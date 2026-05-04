public with sharing class EventsCalendarController {
    
    @AuraEnabled(cacheable = true)
    public static ResponseWrapper getCalendarEvents(Date startDate, Date endDate) {
        
        try{
            Datetime startDT = Datetime.newInstance(startDate, Time.newInstance(0, 0, 0, 0));
            Datetime endDT = Datetime.newInstance(endDate, Time.newInstance(23, 59, 59, 999));

            List<Calendar_Event__c> calendarEvents = [
                SELECT 
                Id,
                Title__c,
                Start_Time__c,
                End_Time__c,
                Type__c
                FROM Calendar_Event__c
                WHERE Start_Time__c >= :startDT
                AND End_Time__c <= : endDT
                ORDER BY Start_Time__c ASC
            ];

            CalendarEventsWrapper calendarEventsWrapper = new CalendarEventsWrapper(calendarEvents);
            return new ResponseWrapper(calendarEventsWrapper, null, false);
        } catch (Exception e) {
            return new ResponseWrapper(null, e.getMessage() + '\n' + e.getLineNumber(), true);
        }
    }
    
    public class CalendarEventsWrapper {
        @AuraEnabled public List<Calendar_Event__c> calendarEvents {get;set;}
        @AuraEnabled public String timeZone {get;set;}

        public CalendarEventsWrapper(List<Calendar_Event__c> calendarEvents) {
            this.calendarEvents = calendarEvents;
            this.timeZone = UserInfo.getTimeZone().getID();
        }
        
    }

    public class ResponseWrapper {
        @AuraEnabled public CalendarEventsWrapper calendarEventsWrapper {get;set;}
        @AuraEnabled public String errorMessage {get;set;}
        @AuraEnabled public Boolean isError {get;set;}

        public ResponseWrapper(
            CalendarEventsWrapper calendarEventsWrapper,
            String errorMessage,
            Boolean isError) {
                this.calendarEventsWrapper = calendarEventsWrapper;
                this.errorMessage = errorMessage;
                this.isError = isError;
        }
    }
}