import { LightningElement, api } from 'lwc';
import { BUILD_CURRENT_USER_TIME, WEEK_DAYS_NAMES, ARE_DATES_EQUAL, PRINT_ERROR } from 'c/utils';
import getCalendarEvents from '@salesforce/apex/EventsCalendarController.getCalendarEvents';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class MonthlyViewCalendar extends LightningElement {

    firstTimeConnected = true;
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
        const { calendarEventsWrapper: { calendarEvents, timeZone }, errorMessage, isError } = await getCalendarEvents({
            startDate: firstDayOfArray,
            endDate: lastDayOfArray,
        });

        if(this.lastRequestIndex != lastRequestIndex) return;

        if (isError) {
            showToast('Error', errorMessage, 'error');
        } else {

            this.calendarEvents = calendarEvents;
            this.calendarEventsMap = {};

            calendarEvents.forEach(calendarEvent => {
                const startTime = BUILD_CURRENT_USER_TIME(new Date(calendarEvent.Start_Time__c), timeZone);
                const endTime = BUILD_CURRENT_USER_TIME(new Date(calendarEvent.End_Time__c), timeZone);
                const key = `${startTime.month}-${startTime.day}`;
                const eventType = calendarEvent.Type__c;

                this.calendarEventsMap[key] ??= [];
                this.calendarEventsMap[key].push({
                    startTime,
                    endTime,
                    title: calendarEvent.Title__c,
                    type: eventType,
                    class: (eventType == 'Health') ? 'calendar-event-box green' : (eventType == 'Social') ? 'calendar-event-box yellow' : 'calendar-event-box red',
                    id: calendarEvent.Id,
                });
            });
        }
    }

    buildCurrentMonthViewTiles() {
        const { totalTilesAmount, firstDayOfMonthWeekIndex, pastAndCurrentMonthTilesAmount, firstDayOfArray } = this.buildMonthBaseData();

        const targetMonthTiles = [];
        try {
            for (let i = 0; i < totalTilesAmount; i++) {
                const currentDate = new Date(firstDayOfArray);
                currentDate.setDate(currentDate.getDate() + i);
                const grayedOut = (i < firstDayOfMonthWeekIndex || i > pastAndCurrentMonthTilesAmount - 1);
                const key = `${((currentDate.getMonth() + 1 < 10) ? '0' : '') + (currentDate.getMonth() + 1)}-${((currentDate.getDate() < 10) ? '0' : '') + currentDate.getDate()}`;
                const tileCalendarEvents = this.calendarEventsMap[key] || [];

                targetMonthTiles.push({
                    date: currentDate,
                    dateNumber: currentDate.getDate(),
                    dateString: currentDate.toDateString(),
                    className: !grayedOut ? (ARE_DATES_EQUAL(currentDate, new Date())) ? 'date-tile today-background' : 'date-tile' : 'date-tile grayed-out',
                    calendarEvents: tileCalendarEvents,
                    truncateEvents: tileCalendarEvents.length > 3,
                });
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