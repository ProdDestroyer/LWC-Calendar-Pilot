import { LightningElement } from 'lwc';
import { WEEK_DAYS_NAMES, MONTHS_NAMES } from 'c/utils';

export default class EventsCalendar extends LightningElement {

    selectedViewType = 'daily';
    pivotDate = new Date();
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

    //================================================= HANDLERS =================================================
    handleViewTypeOptionsChange(event) {
        this.selectedViewType = event.target.value;
        if (this.isMonthlyViewSelected) {
            const newPivotDate = new Date(this.pivotDate);
            newPivotDate.setDate(1);
            this.pivotDate = newPivotDate;
        }
    }

    handleTodayClick() {
        this.pivotDate = new Date();
    }

    handlePreviousClicked() {
        if (this.isMonthlyViewSelected) {
            const pivotDate = this.pivotDate;
            const newPivotDate = new Date(pivotDate.getFullYear(), pivotDate.getMonth() - 1, 1);
            this.pivotDate = newPivotDate;
        }
        if (this.isDailyViewSelected) {
            const pivotDate = this.pivotDate;
            const newPivotDate = new Date(pivotDate.getFullYear(), pivotDate.getMonth(), pivotDate.getDate() - 1);
            this.pivotDate = newPivotDate;
        }
    }

    handleNextClicked() {
        if (this.isMonthlyViewSelected) {
            const pivotDate = this.pivotDate;
            const newPivotDate = new Date(pivotDate.getFullYear(), pivotDate.getMonth() + 1, 1);
            this.pivotDate = newPivotDate;
        } else if (this.isDailyViewSelected) {
            const pivotDate = this.pivotDate;
            const newPivotDate = new Date(pivotDate.getFullYear(), pivotDate.getMonth(), pivotDate.getDate() + 1);
            this.pivotDate = newPivotDate;
        }
    }

    //================================================= GETTERS =================================================
    get selectedYear() {
        return this.pivotDate.getFullYear();
    }

    get viewTypeOptions() {
        return [
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Daily', value: 'daily' },
        ]
    }

    get isMonthlyViewSelected() {
        return this.selectedViewType == 'monthly';
    }

    get isDailyViewSelected() {
        return this.selectedViewType == 'daily';
    }

    get currentDayName() {
        return WEEK_DAYS_NAMES[this.pivotDate.getDay()];
    }

    get currentYear() {
        return this.pivotDate.getFullYear();
    }

    get dateText() {
        const pivotDate = this.pivotDate;
        switch (this.selectedViewType) {
            case 'weekly':
                return 'Sun 6 of July - Sat 12 of July';
            case 'daily':
                return `${WEEK_DAYS_NAMES[pivotDate.getDay()]} ${pivotDate.getDate()} of ${MONTHS_NAMES[pivotDate.getMonth()]}`
            case 'monthly':
                return MONTHS_NAMES[pivotDate.getMonth()];
        }
    }
}