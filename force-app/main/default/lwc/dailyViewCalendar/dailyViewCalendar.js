import { LightningElement, api } from 'lwc';
import {WEEK_DAYS_NAMES, BUILD_DAY_HOURS_BLOCKS} from 'c/utils'

export default class DailyViewCalendar extends LightningElement {

    @api showHoursRuleColumn;
    @api isToday;
    _pivotDate;
    dayHoursBlocks = [];

    connectedCallback() {
        this.dayHoursBlocks = BUILD_DAY_HOURS_BLOCKS();
    }

    //=========================================== GETTERS & SETTERS ===========================================

    @api
    get pivotDate() {
        return this._pivotDate;
    }

    set pivotDate(newPivotDate) {
        this._pivotDate = newPivotDate;
    }

    get currentDayName() {
        return WEEK_DAYS_NAMES[this._pivotDate.getDay()];
    }

    get hourBlockClass() {
        return this.isToday ? 'hour-block today-background': 'hour-block';
    }
}