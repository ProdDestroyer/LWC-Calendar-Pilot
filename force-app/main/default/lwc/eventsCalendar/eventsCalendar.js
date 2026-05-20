import { LightningElement } from 'lwc';
import { WEEK_DAYS_NAMES, MONTHS_NAMES } from 'c/utils';
import getUserTimeZone from '@salesforce/apex/EventsCalendarController.getUserTimeZone';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class EventsCalendar extends LightningElement {

    selectedViewType = 'monthly';
    pivotDate;
    isLoading = true;
    userTimeZone;

    //================================================= HANDLERS =================================================

    connectedCallback() {
        this.pivotDate = this.handlePivotDateReset(new Date());
        this.requestUserTimeZone();
    }

    async requestUserTimeZone() {
        const {payload, errorMessage, isError} = await getUserTimeZone();
        if (isError) {
            showToast('Error', errorMessage, 'error');
        } else { 
            this.userTimeZone = JSON.parse(payload);
        }
        this.isLoading = false;
    }

    handleViewTypeOptionsChange(event) {
        this.selectedViewType = event.target.value;
        this.pivotDate = this.handlePivotDateReset(this.pivotDate);
    }

    handleTodayClick() {
        this.pivotDate = this.handlePivotDateReset(new Date());
    }

    handlePivotDateReset = (baseDate) => {
        let newPivotDate = new Date(baseDate);

        switch (this.selectedViewType) {
            case 'monthly':
                newPivotDate = new Date(newPivotDate.getFullYear(), newPivotDate.getMonth(), 1);
                break;
            case 'weekly':
                const todaysWeekIndex = newPivotDate.getDay();
                newPivotDate = new Date(newPivotDate);
                newPivotDate.setDate(newPivotDate.getDate() - todaysWeekIndex);
                break;
        }
        return newPivotDate;
    }

    handlePreviousClicked() {
        let pivotDate = this.pivotDate;
        switch (this.selectedViewType) {
            case 'monthly':
                pivotDate = new Date(pivotDate.getFullYear(), pivotDate.getMonth() - 1, 1);
                break;
            case 'weekly':
                pivotDate = new Date(pivotDate);
                pivotDate.setDate(pivotDate.getDate() - 7);
                break;
            case 'daily':
                pivotDate = new Date(pivotDate);
                pivotDate.setDate(pivotDate.getDate() - 1);
                break;
        }
        this.pivotDate = pivotDate;
    }

    handleNextClicked() {
        let pivotDate = this.pivotDate;
        switch (this.selectedViewType) {
            case 'monthly':
                pivotDate = new Date(pivotDate.getFullYear(), pivotDate.getMonth() + 1, 1);
                break;
            case 'weekly':
                pivotDate = new Date(pivotDate);
                pivotDate.setDate(pivotDate.getDate() + 7);
                break;
            case 'daily':
                pivotDate = new Date(pivotDate);
                pivotDate.setDate(pivotDate.getDate() + 1);
                break;
        }
        this.pivotDate = pivotDate;
    }

    weeklyViewDayTextBuilder() {
        const startDate = new Date(this.pivotDate);
        const endDate = new Date(this.pivotDate);
        endDate.setDate(endDate.getDate() + 6);
        let text = `${(WEEK_DAYS_NAMES[startDate.getDay()]).substring(0, 3)} ${startDate.getDate()} of ${(MONTHS_NAMES[startDate.getMonth()]).substring(0, 3)}`;
        text += ` - ${(WEEK_DAYS_NAMES[endDate.getDay()]).substring(0, 3)} ${endDate.getDate()} of ${(MONTHS_NAMES[endDate.getMonth()]).substring(0, 3)}`;
        return text;
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

    //================================================= GETTERS =================================================

    get viewTypeOptions() {
        return [
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Daily', value: 'daily' },
        ]
    }

    get selectedYear() {
        return this.pivotDate.getFullYear();
    }

    get dateText() {
        const pivotDate = this.pivotDate;
        switch (this.selectedViewType) {
            case 'weekly':
                return this.weeklyViewDayTextBuilder();
            case 'daily':
                return `${WEEK_DAYS_NAMES[pivotDate.getDay()]} ${pivotDate.getDate()} of ${MONTHS_NAMES[pivotDate.getMonth()]}`
            case 'monthly':
                return MONTHS_NAMES[pivotDate.getMonth()];
        }
    }

    get isMonthlyViewSelected() {
        return this.selectedViewType == 'monthly';
    }

    get isDailyViewSelected() {
        return this.selectedViewType == 'daily';
    }

    get isWeeklyViewSelected() {
        return this.selectedViewType == 'weekly';
    }
}