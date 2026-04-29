import { LightningElement, api } from 'lwc';
import { WEEK_DAYS_NAMES, ARE_DATES_EQUAL } from 'c/utils';

export default class MonthlyViewCalendar extends LightningElement {
    _pivotDate;
    currentMonthTiles = [];

    connectedCallback() {
        this.buildCurrentMonthViewTiles();
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
                dateString: currentDate.toDateString(),
                className: !grayedOut ? (ARE_DATES_EQUAL(currentDate, new Date())) ? 'date-tile today-background': 'date-tile' : 'date-tile grayed-out',
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