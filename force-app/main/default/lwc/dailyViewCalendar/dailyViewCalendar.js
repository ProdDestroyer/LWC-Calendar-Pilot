import { LightningElement, api } from 'lwc';
import {WEEK_DAYS_NAMES} from 'c/utils'

export default class DailyViewCalendar extends LightningElement {

    _pivotDate;
    currentDayHourBlocks = [];


    connectedCallback() {
        this.buildDailyViewBlocks();
    }

    buildDailyViewBlocks() {
        const dailyViewHourBlocks = [];
        for (let i = 0; i < 24; i++) {
            const suffix = (i < 13) ? 'am' : 'pm';
            const formattedHour = (i % 12) + (12 * (Math.trunc(i / 12)));
            dailyViewHourBlocks.push({ hour: i, hourString: `${formattedHour}:00${suffix}` });
        }
        this.currentDayHourBlocks = dailyViewHourBlocks;
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
        return WEEK_DAYS_NAMES[this.pivotDate.getDay()];
    }
}