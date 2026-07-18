import { LightningElement, api } from 'lwc';
import {WEEK_DAYS_NAMES, BUILD_DAY_HOURS_BLOCKS, ARE_DATES_EQUAL, BUILD_CURRENT_USER_TIME, USER_TIME_TO_DATE_TIME, BUILD_TIME_DIRECTLY} from 'c/utils'
import getCalendarEvents from '@salesforce/apex/EventsCalendarController.getCalendarEvents';

export default class WeeklyViewCalendar extends LightningElement {

    @api userTimeZone;
    _pivotDate;
    dayHoursBlocks = [];
    weekDays = [];
    isLoading = true;
    calendarEventsMap = {};
    truthy = true;
    firstTimeConnected = true;
    lastRequestIndex = 0;

    connectedCallback() {
        this.firstTimeConnected = false;
        this.dayHoursBlocks = BUILD_DAY_HOURS_BLOCKS();
        this.reloadData();
    }

    async reloadData() {
        this.lastRequestIndex += 1;
        this.isLoading = true;
        await this.retrieveCalendarEvents();
    }

    async retrieveCalendarEvents() {
        const lastRequestIndex = this.lastRequestIndex;
        const firstDayOfArray = this.pivotDate;
        const lastDayOfArray = new Date(this.pivotDate);
        lastDayOfArray.setDate(this.pivotDate.getDate() + 6);
        const { payload, errorMessage, isError } = await getCalendarEvents({
            startDate: {
                year: firstDayOfArray.getFullYear(),
                month: firstDayOfArray.getMonth() + 1,
                day: firstDayOfArray.getDate()
            },
            endDate: {
                year: lastDayOfArray.getFullYear(),
                month: lastDayOfArray.getMonth() + 1,
                day: lastDayOfArray.getDate()
            },
        });

        if (this.lastRequestIndex != lastRequestIndex) return;

        if (isError) {
            showToast('Error', errorMessage, 'error');
        } else {

            const calendarEvents = JSON.parse(payload).sort((a, b) => new Date(a.Start_Time__c) - new Date(b.Start_Time__c));

            this.calendarEventsMap = {};

            calendarEvents.forEach((calendarEvent) => {
                const startTime = BUILD_CURRENT_USER_TIME(new Date(calendarEvent.Start_Time__c), this.userTimeZone);
                const endTime = BUILD_CURRENT_USER_TIME(new Date(calendarEvent.End_Time__c), this.userTimeZone);
                const eventType = calendarEvent.Type__c;

                
                let currentStartTime = USER_TIME_TO_DATE_TIME(startTime);
                const currentEndTime = USER_TIME_TO_DATE_TIME(endTime);
                do {
                    const assignableStartTime = BUILD_TIME_DIRECTLY(currentStartTime);
                    const assignableEndTime = (ARE_DATES_EQUAL(currentStartTime, currentEndTime)) ? endTime :
                    {assignableStartTime, hour: '23', minute: '59', second: '59'}
                    const key = `${assignableStartTime.day}`;

                    this.calendarEventsMap[key] ??= [];
                    this.calendarEventsMap[key].push({
                        startTime: assignableStartTime,
                        endTime: assignableEndTime,
                        title: calendarEvent.Title__c,
                        type: eventType,
                        class: (eventType == 'Health') ? 'calendar-event-box green' : (eventType == 'Social') ? 'calendar-event-box yellow' : 'calendar-event-box red',
                        id: calendarEvent.Id,
                        originalStartTime: startTime,
                        originalEndTime: endTime,
                    });

                    currentStartTime = new Date(currentStartTime);
                    currentStartTime.setDate(currentStartTime.getDate() + 1);
                    currentStartTime.setHours(0);
                    currentStartTime.setMinutes(0);
                    currentStartTime.setSeconds(0);
                } while (currentStartTime < currentEndTime);
            });
        }
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
                pivotDate: currentLoopDate,
                dateString: currentLoopDate.toDateString(),
                dateNumber: currentLoopDate.getDate(), 
                dayName: WEEK_DAYS_NAMES[currentLoopDate.getDay()],
                isToday: (ARE_DATES_EQUAL(currentLoopDate, USER_TIME_TO_DATE_TIME(BUILD_CURRENT_USER_TIME(new Date(), this.userTimeZone)))),
                calendarEventsPayload: this.calendarEventsMap[`${(currentLoopDate.getDate() > 9 ? '': '0')}${currentLoopDate.getDate()}`] || [],
            });
        }
        this.weekDays = currentWeekDays;
    }

    handleContainerRectangleRequest({detail}) {
        const weeklyViewContainer = this.template.querySelector('.weekly-view-container');
        detail.weeklyViewContainerRectangle = weeklyViewContainer.getBoundingClientRect();
    }

    //=========================================== GETTERS & SETTERS ===========================================

    @api
    get pivotDate() {
        return this._pivotDate;
    }

    set pivotDate(newPivotDate) {
        this._pivotDate = newPivotDate;
        if (!this.firstTimeConnected) {
            this.reloadData();
        }
    }

    get weekDaysNames() {
        return WEEK_DAYS_NAMES;
    }
}