import { LightningElement, api } from 'lwc';

export default class MonthTileCalendar extends LightningElement {
    @api monthTileData;

    get calendarEvents() {
        return (this.monthTileData.calendarEvents.length > 3) ? 
        this.monthTileData.calendarEvents.slice(0,3) : 
        this.monthTileData.calendarEvents;
    }

    get truncateEvents() {
        return this.monthTileData.truncateEvents;
    }
}