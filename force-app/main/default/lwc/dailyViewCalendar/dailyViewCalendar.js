import { LightningElement, api } from 'lwc';
import { WEEK_DAYS_NAMES, BUILD_DAY_HOURS_BLOCKS, DAY_MINUTES_AMOUNT } from 'c/utils'

export default class DailyViewCalendar extends LightningElement {

    @api showHoursRuleColumn;
    @api isToday;
    @api calendarEvents = [
        {
            "startTime": {
                "weekday": "Sunday",
                "month": "04",
                "day": "26",
                "year": "2026",
                "hour": "06",
                "minute": "30",
                "second": "00"
            },
            "endTime": {
                "weekday": "Sunday",
                "month": "04",
                "day": "26",
                "year": "2026",
                "hour": "07",
                "minute": "45",
                "second": "00"
            },
            "title": "oxHvbAIJ",
            "type": "Health",
            "class": "calendar-event-box green",
            "id": "a00dL0xxxxxxxxxxAK"
        },
        {
            "startTime": {
                "weekday": "Sunday",
                "month": "04",
                "day": "26",
                "year": "2026",
                "hour": "09",
                "minute": "45",
                "second": "00"
            },
            "endTime": {
                "weekday": "Sunday",
                "month": "04",
                "day": "26",
                "year": "2026",
                "hour": "12",
                "minute": "45",
                "second": "00"
            },
            "title": "bjNDscNaPprT",
            "type": "Health",
            "class": "calendar-event-box green",
            "id": "a00dL000xyxxxxxxxxQAK"
        },
        {
            "startTime": {
                "weekday": "Sunday",
                "month": "04",
                "day": "26",
                "year": "2026",
                "hour": "13",
                "minute": "30",
                "second": "00"
            },
            "endTime": {
                "weekday": "Sunday",
                "month": "04",
                "day": "26",
                "year": "2026",
                "hour": "15",
                "minute": "15",
                "second": "00"
            },
            "title": "QdqZoUuckb",
            "type": "Social",
            "class": "calendar-event-box yellow",
            "id": "a00dL000xxxxxyxxxM6QAK"
        },
        {
            "startTime": {
                "weekday": "Sunday",
                "month": "04",
                "day": "26",
                "year": "2026",
                "hour": "18",
                "minute": "00",
                "second": "00"
            },
            "endTime": {
                "weekday": "Sunday",
                "month": "04",
                "day": "26",
                "year": "2026",
                "hour": "18",
                "minute": "45",
                "second": "00"
            },
            "title": "VdPOKViZJNbb",
            "type": "Health",
            "class": "calendar-event-box green",
            "id": "a00dL00sgdfljahfQAK"
        }
    ];

    _pivotDate;
    dayHoursBlocks = [];
    areCalendarEventsReady = false;

    connectedCallback() {
        this.dayHoursBlocks = BUILD_DAY_HOURS_BLOCKS();
    }

    renderedCallback() {
        if (!this.areCalendarEventsReady) {
            const dayColumn = this.template.querySelector('.day-column');
            const minuteHeightInPX = dayColumn.getBoundingClientRect().height / DAY_MINUTES_AMOUNT;
            this.calendarEvents = this.calendarEvents.map(calendarevent => {

                const { startTime, endTime } = calendarevent;
                const startTimeInMinutes = (Number(startTime.hour) * 60) + Number(startTime.minute);
                const endTimeInMinutes = (Number(endTime.hour) * 60) + Number(endTime.minute);
                const minutesDuration = endTimeInMinutes - startTimeInMinutes;
                const top = startTimeInMinutes * minuteHeightInPX;
                const height = minutesDuration * minuteHeightInPX;

                const style = `position: absolute; top: ${top}px; height:${height}px; width: 100%; border: 1px solid black; background-color: tomato;`;

                return {
                    ...calendarevent,
                    style,
                }

            });
            this.areCalendarEventsReady = true;
        }

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
        return this.isToday ? 'hour-block today-background' : 'hour-block';
    }
}