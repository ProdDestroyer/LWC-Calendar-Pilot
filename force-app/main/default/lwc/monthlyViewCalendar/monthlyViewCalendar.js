import { LightningElement, api } from 'lwc';
import { WEEK_DAYS_NAMES, ARE_DATES_EQUAL } from 'c/utils';
import getCalendarEvents from '@salesforce/apex/EventsCalendarController.getCalendarEvents'
import getUserTimeZone from '@salesforce/apex/EventsCalendarController.getUserTimeZone'

export default class MonthlyViewCalendar extends LightningElement {
    _pivotDate;
    currentMonthTiles = [];
    isLoading = true;
    calendarEvents = [];

    async connectedCallback() {
        this.buildCurrentMonthViewTiles();
        await this.retrieveCalendarEvents();
        this.isLoading = false;
    }

    async retrieveCalendarEvents() {
            const { response, errorMessage, isError } = await getCalendarEvents({
                startDate: this.currentMonthTiles[0].date,
                endDate: this.currentMonthTiles[this.currentMonthTiles.length - 1].date,
            });
    }

    buildCurrentMonthViewTiles() {
        const targetMonthTiles = [];
        const pivotDate = this.pivotDate;
        const firstDayOfMonth = new Date(pivotDate.getFullYear(), pivotDate.getMonth(), 1);
        const firstDayOfMonthWeekIndex = firstDayOfMonth.getDay();
        const firstDayOfArray = new Date(firstDayOfMonth);
        firstDayOfArray.setDate(firstDayOfMonth.getDate() - firstDayOfMonthWeekIndex);


        const daysAmountInMonth = new Date(pivotDate.getFullYear(), pivotDate.getMonth() + 1, 0).getDate();
        const pastAndCurrentMonthTilesAmount = firstDayOfMonthWeekIndex + daysAmountInMonth;
        const futureTilesAmount = (7 - (pastAndCurrentMonthTilesAmount % 7)) % 7;
        const totalTilesAmount = pastAndCurrentMonthTilesAmount + futureTilesAmount;

        for (let i = 0; i < totalTilesAmount; i++) {
            const currentDate = new Date(firstDayOfArray);
            currentDate.setDate(currentDate.getDate() + i);
            const grayedOut = (i < firstDayOfMonthWeekIndex || i > pastAndCurrentMonthTilesAmount - 1);
            targetMonthTiles.push({
                date: currentDate,
                dateNumber: currentDate.getDate(),
                dateString: currentDate.toDateString(),
                className: !grayedOut ? (ARE_DATES_EQUAL(currentDate, new Date())) ? 'date-tile today-background' : 'date-tile' : 'date-tile grayed-out',
            });
        }

        this.currentMonthTiles = targetMonthTiles;
    }

    //=========================================== GETTERS & SETTERS ===========================================

    @api
    get pivotDate() {
        return this._pivotDate;
    }

    set pivotDate(newPivotDate) {
        this._pivotDate = newPivotDate;
        this.buildCurrentMonthViewTiles();
    }

    get weekDaysNames() {
        return WEEK_DAYS_NAMES;
    }
}