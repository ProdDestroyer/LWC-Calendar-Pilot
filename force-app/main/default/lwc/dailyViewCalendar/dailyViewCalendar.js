import { LightningElement, api } from 'lwc';
import { BUILD_CURRENT_USER_TIME, WEEK_DAYS_NAMES, BUILD_DAY_HOURS_BLOCKS, DAY_MINUTES_AMOUNT } from 'c/utils';
import getCalendarEvents from '@salesforce/apex/EventsCalendarController.getCalendarEvents'

export default class DailyViewCalendar extends LightningElement {

    //data
    @api isWeeklyView;
    @api isToday;
    @api calendarEvents = [];
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
        const { calendarEventsWrapper: { calendarEvents, timeZone }, errorMessage, isError } = await getCalendarEvents({
            startDate: this.pivotDate,
            endDate: this.pivotDate,
        });
        if (!isError) {
            calendarEvents.forEach(calendarEvent => {
                const startTime = BUILD_CURRENT_USER_TIME(new Date(calendarEvent.Start_Time__c), timeZone);
                const endTime = BUILD_CURRENT_USER_TIME(new Date(calendarEvent.End_Time__c), timeZone);
                const eventType = calendarEvent.Type__c;

                this.calendarEvents.push({
                    startTime,
                    endTime,
                    title: calendarEvent.Title__c,
                    type: eventType,
                    id: calendarEvent.Id,
                });
            });
        } else {
            console.error('error ', errorMessage);
        }
        this.isLoading = false;
    }

    renderedCallback() {
        if (!this.isLoading && !this.areCalendarEventsReady) {
            const dayColumn = this.template.querySelector('.day-column');
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
                position: absolute; top: ${top}px;
                height:${height}px;
                width: 100%;
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
                };

                this.calendarEventsMap[calendarevent.id] = transformedCalendarEvent;

                return transformedCalendarEvent;
            });
            this.areCalendarEventsReady = true;
        }
    }

    handleCalendarEventHover(event) {
        const height = this.calendarEventsMap[event.target.dataset.id].height;
        event.target.style.height = 'auto';
        const autoHeight = event.target.getBoundingClientRect().height;
        event.target.style.height = (autoHeight < height) ? `${height}px` : 'auto';
    }
    
    handleMouseLeave(event) {
        event.target.style.height = `${this.calendarEventsMap[event.target.dataset.id].height}px`;
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