import { LightningElement } from 'lwc';
import { WEEK_DAYS_NAMES, MONTHS_NAMES } from 'c/utils';

export default class EventsCalendar extends LightningElement {

    selectedViewType = 'daily';
    pivotDate = new Date();

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