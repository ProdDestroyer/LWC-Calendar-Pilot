import { LightningElement, api } from 'lwc';
import { BUILD_CURRENT_USER_TIME, WEEK_DAYS_NAMES, ARE_DATES_EQUAL, PRINT_ERROR, USER_TIME_TO_DATE_TIME, BUILD_TIME_DIRECTLY } from 'c/utils';
import getCalendarEvents from '@salesforce/apex/EventsCalendarController.getCalendarEvents';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class MonthlyViewCalendar extends LightningElement {

    firstTimeConnected = true;
    @api userTimeZone;
    _pivotDate;
    lastRequestIndex = 0;
    currentMonthTiles = [];
    isLoading = true;
    calendarEvents = [];
    calendarEventsMap = {};

    async connectedCallback() {
        if (this.firstTimeConnected) {
            this.firstTimeConnected = false;
        }
        await this.reloadData();
    }

    async reloadData() {
        this.lastRequestIndex += 1;
        this.isLoading = true;
        await this.retrieveCalendarEvents();
        this.buildCurrentMonthViewTiles();
        this.isLoading = false;
    }

    async retrieveCalendarEvents() {
        const lastRequestIndex = this.lastRequestIndex;
        const { firstDayOfArray, lastDayOfArray } = this.buildMonthBaseData();
        const { payload, errorMessage, isError } = await getCalendarEvents({
            startDate: {
                year: firstDayOfArray.getFullYear(),
                month: firstDayOfArray.getMonth() + 1,
                day: firstDayOfArray.getDate()
            },
            endDate: {
                year: lastDayOfArray.getFullYear(),
                month: lastDayOfArray.getMonth() + 1,
                day: lastDayOfArray.getDate()
            },
        });

        if (this.lastRequestIndex != lastRequestIndex) return;

        if (isError) {
            showToast('Error', errorMessage, 'error');
        } else {

            const calendarEvents = JSON.parse(payload).sort((a, b) => new Date(a.Start_Time__c) - new Date(b.Start_Time__c));

            this.calendarEvents = calendarEvents;
            this.calendarEventsMap = {};

            calendarEvents.forEach((calendarEvent) => {
                const startTime = BUILD_CURRENT_USER_TIME(new Date(calendarEvent.Start_Time__c), this.userTimeZone);
                const endTime = BUILD_CURRENT_USER_TIME(new Date(calendarEvent.End_Time__c), this.userTimeZone);
                const eventType = calendarEvent.Type__c;

                
                let currentStartTime = USER_TIME_TO_DATE_TIME(startTime);
                const currentEndTime = USER_TIME_TO_DATE_TIME(endTime);
                do {
                    const assignableStartTime = BUILD_TIME_DIRECTLY(currentStartTime);
                    const assignableEndTime = (ARE_DATES_EQUAL(currentStartTime, currentEndTime)) ? endTime :
                    {assignableStartTime, hour: '23', minute: '59', second: '59'}
                    const key = `${assignableStartTime.month}-${assignableStartTime.day}`;

                    this.calendarEventsMap[key] ??= [];
                    this.calendarEventsMap[key].push({
                        startTime: assignableStartTime,
                        endTime: assignableEndTime,
                        title: calendarEvent.Title__c,
                        type: eventType,
                        class: (eventType == 'Health') ? 'calendar-event-box green' : (eventType == 'Social') ? 'calendar-event-box yellow' : 'calendar-event-box red',
                        id: calendarEvent.Id,
                        originalStartTime: startTime,
                        originalEndTime: endTime,
                    });

                    currentStartTime = new Date(currentStartTime);
                    currentStartTime.setDate(currentStartTime.getDate() + 1);
                    currentStartTime.setHours(0);
                    currentStartTime.setMinutes(0);
                    currentStartTime.setSeconds(0);
                } while (currentStartTime < currentEndTime);
            });
        }
    }

    buildCurrentMonthViewTiles() {
        const { totalTilesAmount, firstDayOfMonthWeekIndex, pastAndCurrentMonthTilesAmount, firstDayOfArray } = this.buildMonthBaseData();

        const targetMonthTiles = [];
        try {
            for (let i = 0; i < totalTilesAmount; i++) {
                try{
                const currentDate = new Date(firstDayOfArray);
                currentDate.setDate(currentDate.getDate() + i);
                const grayedOut = (i < firstDayOfMonthWeekIndex || i > pastAndCurrentMonthTilesAmount - 1);
                const key = `${((currentDate.getMonth() + 1 < 10) ? '0' : '') + (currentDate.getMonth() + 1)}-${((currentDate.getDate() < 10) ? '0' : '') + currentDate.getDate()}`;
                const tileCalendarEvents = this.calendarEventsMap[key] || [];

                targetMonthTiles.push({
                    date: currentDate,
                    key,
                    dateNumber: currentDate.getDate(),
                    dateString: currentDate.toDateString(),
                    monthNumber: currentDate.getMonth(),
                    className: !grayedOut ? (ARE_DATES_EQUAL(currentDate, new Date())) ? 'date-tile today-background' : 'date-tile' : 'date-tile grayed-out',
                    calendarEvents: tileCalendarEvents,
                    truncateEvents: tileCalendarEvents.length > 3,
                });
            } catch(err) {
                throw new Error(`${err}`);
                
            }
            }
        } catch (error) {
            PRINT_ERROR(error);
        }
        this.currentMonthTiles = targetMonthTiles;
    }

    buildMonthBaseData() {
        const pivotDate = this.pivotDate;
        const firstDayOfMonth = new Date(pivotDate.getFullYear(), pivotDate.getMonth(), 1);
        const firstDayOfMonthWeekIndex = firstDayOfMonth.getDay();
        const firstDayOfArray = new Date(firstDayOfMonth);
        firstDayOfArray.setDate(firstDayOfMonth.getDate() - firstDayOfMonthWeekIndex);


        const daysAmountInMonth = new Date(pivotDate.getFullYear(), pivotDate.getMonth() + 1, 0).getDate();
        const pastAndCurrentMonthTilesAmount = firstDayOfMonthWeekIndex + daysAmountInMonth;
        const futureTilesAmount = (7 - (pastAndCurrentMonthTilesAmount % 7)) % 7;
        const totalTilesAmount = pastAndCurrentMonthTilesAmount + futureTilesAmount;
        const lastDayOfArray = new Date(firstDayOfArray);
        lastDayOfArray.setDate(lastDayOfArray.getDate() + totalTilesAmount - 1);
        return {
            pivotDate,
            firstDayOfMonth,
            firstDayOfMonthWeekIndex,
            firstDayOfArray,
            lastDayOfArray,
            daysAmountInMonth,
            pastAndCurrentMonthTilesAmount,
            futureTilesAmount,
            totalTilesAmount,
        };
    }

    jumpToDaily(event) {
        const key = event.currentTarget.dataset.id;
        const date = event.currentTarget.dataset.date;
        const clickedDayCalendarEvents = this.calendarEventsMap[key];

        this.dispatchEvent(new CustomEvent('monthtileclick',
            { detail: { clickedDayCalendarEvents, date } })
        );
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title,
            message,
            variant,
            mode: 'dismissable' //could try sticky
        });
        this.dispatchEvent(evt);
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

    get weekDaysNames() {
        return WEEK_DAYS_NAMES;
    }
}