import { LightningElement, api } from 'lwc';
import {WEEK_DAYS_NAMES, BUILD_DAY_HOURS_BLOCKS, ARE_DATES_EQUAL} from 'c/utils'

export default class WeeklyViewCalendar extends LightningElement {

    @api userTimeZone;
    _pivotDate;
    dayHoursBlocks = [];
    weekDays = [];
    isLoading = true;

    connectedCallback() {
        this.dayHoursBlocks = BUILD_DAY_HOURS_BLOCKS();
        this.reloadData();
    }

    reloadData() {
        this.isLoading = true;
        this.buildWeekDays();
        this.isLoading = false;
    }

    buildWeekDays() {
        const currentWeekDays = [];
        const pivotDate = this.pivotDate;
        for(let i = 0; i < 7; i++) {
            const currentLoopDate = new Date(pivotDate);
            currentLoopDate.setDate(currentLoopDate.getDate() + i);
            currentWeekDays.push({
                dateNumber: currentLoopDate.getDate(), 
                dayName: WEEK_DAYS_NAMES[currentLoopDate.getDay()],
                isToday: (ARE_DATES_EQUAL(currentLoopDate, new Date())),
                calendarsPayload: {payload: null, errorMessage: 'testing phase', isError: true},
            });
        }
        this.weekDays = currentWeekDays;
    }

    //=========================================== GETTERS & SETTERS ===========================================

    @api
    get pivotDate() {
        return this._pivotDate;
    }

    set pivotDate(newPivotDate) {
        this._pivotDate = newPivotDate;
        this.reloadData();
    }

    get weekDaysNames() {
        return WEEK_DAYS_NAMES;
    }
}