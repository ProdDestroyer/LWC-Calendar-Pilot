import { LightningElement, api } from 'lwc';
import { BUILD_CURRENT_USER_TIME, WEEK_DAYS_NAMES, BUILD_DAY_HOURS_BLOCKS, DAY_MINUTES_AMOUNT } from 'c/utils';
import getCalendarEvents from '@salesforce/apex/EventsCalendarController.getCalendarEvents'

export default class DailyViewCalendar extends LightningElement {

    //data
    @api isWeeklyView;
    @api isToday;
    @api userTimeZone;
    @api calendarEventsPayload;
    calendarEvents = [];
    calendarEventsMap = {};
    _pivotDate;
    dayHoursBlocks = [];

    //flags
    areCalendarEventsReady = false;
    isLoading = true;
    firstTimeConnected = true;


    connectedCallback() {
        if (this.firstTimeConnected) {
            this.firstTimeConnected = false;
        }
        this.dayHoursBlocks = BUILD_DAY_HOURS_BLOCKS();
        this.requestCalendarEvents();
    }

    async reloadData() {
        this.isLoading = true;
        this.areCalendarEventsReady = false;
        this.calendarEvents = [];
        this.calendarEventsMap = [];
        this.requestCalendarEvents();
    }

    async requestCalendarEvents() {
        const { payload, errorMessage, isError } = (!this.calendarEventsPayload) ? await getCalendarEvents({
            startDate: {
                year: this.pivotDate.getFullYear(),
                month: this.pivotDate.getMonth() + 1,
                day: this.pivotDate.getDate()
            },
            endDate: {
                year: this.pivotDate.getFullYear(),
                month: this.pivotDate.getMonth() + 1,
                day: this.pivotDate.getDate()
            },
        }) : this.calendarEventsPayload;
        if (!isError) {
            this.processCalendarEvents(payload);
        } else {
            console.error('error ', errorMessage);
        }
        this.isLoading = false;
    }

    processCalendarEvents(payload) {
        const calendarEvents = JSON.parse(payload);
        calendarEvents.forEach(calendarEvent => {
            const startTime = BUILD_CURRENT_USER_TIME(new Date(calendarEvent.Start_Time__c), this.userTimeZone);
            const endTime = BUILD_CURRENT_USER_TIME(new Date(calendarEvent.End_Time__c), this.userTimeZone);
            const eventType = calendarEvent.Type__c;

            this.calendarEvents.push({
                startTime,
                endTime,
                title: calendarEvent.Title__c,
                type: eventType,
                id: calendarEvent.Id,
            });
        });
    }

    renderedCallback() {
        if (!this.isLoading && !this.areCalendarEventsReady) {
            const dayColumn = this.template.querySelector('.day-column');
            this.calculateVerticalAlignments(dayColumn);
            this.calculateHorizontalAlignments(dayColumn);
        }
    }

    calculateHorizontalAlignments(dayColumn) {
        this.calendarEvents.sort((a, b) => new Date(a.startTimeInMinutes) - new Date(b.startTimeInMinutes));
        const dayColumnWidth = dayColumn.getBoundingClientRect().width;

        const calendarEventsMasterList = [...this.calendarEvents];
        const columnsList = [];

        let columnIndex = 0;
        while (calendarEventsMasterList.length > 0) {

            calendarEventsMasterList[0].columnIndex = columnIndex;
            const currentColumn = [calendarEventsMasterList[0]];
            let timeRule = calendarEventsMasterList[0].endTimeInMinutes;
            let index = 1;

            while (index < calendarEventsMasterList.length) {

                const currentCalendarEvent = calendarEventsMasterList[index];
                if (currentCalendarEvent.startTimeInMinutes >= timeRule) {
                    currentCalendarEvent.columnIndex = columnIndex;
                    currentColumn.push(currentCalendarEvent);
                    timeRule = currentCalendarEvent.endTimeInMinutes;
                    calendarEventsMasterList.splice(index, 1);
                }
                else {
                    currentColumn[currentColumn.length - 1].expand = false;
                    index += 1;
                }
            }
            calendarEventsMasterList.shift();
            columnsList.push(currentColumn);
            columnIndex += 1;
        }

        let index = 0;
        const calendarEventWidth = dayColumnWidth / columnsList.length;

        while (index < this.calendarEvents.length) {
            const currentCalendarEvent = this.calendarEvents[index];
            currentCalendarEvent.calendarEventWidth = calendarEventWidth;
            currentCalendarEvent['style'] = `${currentCalendarEvent['style']} 
                                                left: ${((currentCalendarEvent['columnIndex'] * calendarEventWidth) / dayColumnWidth) * 100}%;`;
            index += 1;
        }

        columnsList.forEach((column, index) => {
            if (index < columnsList.length - 1) {
                column.forEach(calendarEvent => {
                    if (calendarEvent.expand) {
                        let innerIndex = index + 1;
                        let notFound = true;
                        while (innerIndex < columnsList.length && notFound == true) {
                            columnsList[innerIndex].forEach(targetCalendarEvent => {
                                notFound = notFound && (
                                    !(calendarEvent.startTimeInMinutes > targetCalendarEvent.startTimeInMinutes
                                        &&
                                        calendarEvent.startTimeInMinutes < targetCalendarEvent.endTimeInMinutes)
                                    &&
                                    !(calendarEvent.endTimeInMinutes > targetCalendarEvent.startTimeInMinutes
                                        &&
                                        calendarEvent.endTimeInMinutes < targetCalendarEvent.endTimeInMinutes)
                                    &&
                                    !(calendarEvent.startTimeInMinutes == targetCalendarEvent.startTimeInMinutes
                                        &&
                                        calendarEvent.endTimeInMinutes == targetCalendarEvent.endTimeInMinutes)
                                );
                            })
                            innerIndex += (notFound) ? 1 : 0;
                        }

                        calendarEvent.calendarEventWidth += ((innerIndex - 1) - index) * calendarEventWidth;

                    }
                })
            }
        })

        this.calendarEvents = this.calendarEvents.map(calendarEvent => {
            calendarEvent.calendarEventWidth = (calendarEvent.calendarEventWidth/dayColumnWidth) * 100;
            const style = `${calendarEvent['style']} width: ${calendarEvent.calendarEventWidth}%`;
            return { ...calendarEvent, style };
        })

        this.areCalendarEventsReady = true;
    }

    calculateVerticalAlignments(dayColumn) {
        const minuteHeightInPX = dayColumn.getBoundingClientRect().height / DAY_MINUTES_AMOUNT;

        this.calendarEvents = this.calendarEvents.map(calendarevent => {
            const { startTime, endTime, type } = calendarevent;
            const startTimeInMinutes = (Number(startTime.hour) * 60) + Number(startTime.minute);
            const endTimeInMinutes = (Number(endTime.hour) * 60) + Number(endTime.minute);
            const minutesDuration = endTimeInMinutes - startTimeInMinutes;
            const top = startTimeInMinutes * minuteHeightInPX;
            const height = minutesDuration * minuteHeightInPX;

            const borderColor = (type == 'Health') ? 'green' : (type == 'Social') ? 'orange' : 'red';
            const backgroundColor = (type == 'Health') ? 'rgb(97, 209, 97)' : (type == 'Social') ? 'rgb(248, 194, 94)' : 'rgb(239, 95, 95)';

            let style = `
                position: absolute; 
                top: ${top}px;
                height:${height}px;
                border-left: 5px solid;
                border-radius: 3px;
                border-color: ${borderColor};
                background-color: ${backgroundColor};
                `;

            const transformedCalendarEvent = {
                ...calendarevent,
                style,
                startTimeString: `${startTime.hour}:${startTime.minute}:${startTime.second}`,
                endTimeString: `${endTime.hour}:${endTime.minute}:${endTime.second}`,
                height,
                startTimeInMinutes,
                endTimeInMinutes,
                expand: true,
            };

            this.calendarEventsMap[calendarevent.id] = transformedCalendarEvent;

            return transformedCalendarEvent;
        });
    }

    handleCalendarEventHover(event) {
        const height = this.calendarEventsMap[event.target.dataset.id].height;
        event.target.style.height = 'auto';
        const autoHeight = event.target.getBoundingClientRect().height;
        event.target.style.height = (autoHeight < height) ? `${height}px` : 'auto';
        event.target.style.zIndex = '60';
    }

    handleMouseLeave(event) {
        event.target.style.height = `${this.calendarEventsMap[event.target.dataset.id].height}px`;
        event.target.style.zIndex = 'auto';
    }

    //=========================================== GETTERS & SETTERS ===========================================

    @api
    get pivotDate() {
        return this._pivotDate;
    }

    set pivotDate(newPivotDate) {
        this._pivotDate = newPivotDate;
        if (!this.firstTimeConnected) {
            this.reloadData();
        }
    }

    get currentDayName() {
        return WEEK_DAYS_NAMES[this._pivotDate.getDay()];
    }

    get hourBlockClass() {
        return this.isToday ? 'hour-block today-background' : 'hour-block';
    }
}