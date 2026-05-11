import { LightningElement, api } from 'lwc';
import { ARE_DATES_EQUAL} from 'c/utils';

export default class MonthTileCalendar extends LightningElement {
    @api monthTileData;


    get isToday() {
        return  ARE_DATES_EQUAL(this.monthTileData.date, new Date());
    }

    get calendarEvents() {
        return (this.monthTileData.calendarEvents.length > 3) ? 
        this.monthTileData.calendarEvents.slice(0,3) : 
        this.monthTileData.calendarEvents;
    }

    get truncateEvents() {
        return this.monthTileData.truncateEvents;
    }
}