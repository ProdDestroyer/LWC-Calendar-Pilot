import { LightningElement } from 'lwc';

export default class EventsCalendar extends LightningElement {

    selectedViewType = 'daily';
    pivotDate = new Date();
    currentMonthTiles = [];
    currentDayHourBlocks = [];
    weekDaysNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    monthsNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    connectedCallback() {
        this.buildCurrentMonthViewTiles();
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
                className: !grayedOut ? 'date-tile' : 'date-tile grayed-out',
            });
        }

        this.currentMonthTiles = targetMonthTiles;
    }


    //================================================= HANDLERS =================================================
    handleViewTypeOptionsChange(event) {
        this.selectedViewType = event.target.value;
        if (this.isMonthlyViewSelected) {
            const newPivotDate = new Date(this.pivotDate);
            newPivotDate.setDate(1);
            this.pivotDate = newPivotDate;
            this.buildCurrentMonthViewTiles();
        }
    }

    handleTodayClick() {
        this.pivotDate = new Date();
        if (this.isMonthlyViewSelected) {
            this.buildCurrentMonthViewTiles();
        }
    }

    handlePreviousClicked() {
        if (this.isMonthlyViewSelected) {
            const pivotDate = this.pivotDate;
            const newPivotDate = new Date(pivotDate.getFullYear(), pivotDate.getMonth() - 1, 1);
            this.pivotDate = newPivotDate;
            this.buildCurrentMonthViewTiles();
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
            this.buildCurrentMonthViewTiles();
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
        return this.weekDaysNames[this.pivotDate.getDay()];
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
                return `${this.weekDaysNames[pivotDate.getDay()]} ${pivotDate.getDate()} of ${this.monthsNames[pivotDate.getMonth()]}`
            case 'monthly':
                return this.monthsNames[pivotDate.getMonth()];
        }
    }
}