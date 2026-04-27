import { LightningElement } from 'lwc';

export default class EventsCalendar extends LightningElement {

    selectedViewType = 'monthly';
    pivotDate = new Date();
    currentMonthTiles = [];
    weekDaysNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
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
            const grayedOut = (i < firstDayOfMonthWeekIndex || i > pastAndCurrentMonthTilesAmount -1 );
            targetMonthTiles.push({ 
                date: currentDate, 
                dateString: currentDate.toDateString(),
                className: !grayedOut ? 'date-tile' : 'date-tile grayed-out',
                });
        }

        this.currentMonthTiles = targetMonthTiles;
    }


    //================================================= HANDLERS =================================================
    handleViewTypeOptionsChange(event) {
        this.selectedViewType = event.target.value;
    }

    handleTodayClick() {
        this.pivotDate = new Date();
        if(this.isMonthlyViewSelected) {
            this.buildCurrentMonthViewTiles();
        }
    }

    handlePreviousClicked() {
        if (this.isMonthlyViewSelected) {
            const pivotDate = this.pivotDate;
            const newPivotDate = new Date(pivotDate.getFullYear(), pivotDate.getMonth() - 1, 1);
            this.pivotDate = newPivotDate;
            console.log('new pivot date: ', this.pivotDate.toDateString());
            this.buildCurrentMonthViewTiles();
        }
    }
    
    handleNextClicked() {
        if (this.isMonthlyViewSelected) {
            const pivotDate = this.pivotDate;
            const newPivotDate = new Date(pivotDate.getFullYear(), pivotDate.getMonth() + 1, 1);
            this.pivotDate = newPivotDate;
            console.log('new pivot date: ', this.pivotDate.toDateString());
            this.buildCurrentMonthViewTiles();
        }
    }

    //================================================= GETTERS =================================================
    get selectedYear() {
        return '2026';
    }

    get dateText() {
        return 'Sun 6 of July - Sat 12 of July';
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
}