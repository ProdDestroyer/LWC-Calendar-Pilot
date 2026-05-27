public with sharing class EventsCalendarController {
    
    @AuraEnabled(cacheable = true)
    public static ResponseWrapper getCalendarEvents(DateWrapper startDate, DateWrapper endDate) {
        
        try{
            Datetime startDT = Datetime.newInstance(
                startDate.year,
                startDate.month,
                startDate.day,
                0,0,0
            );
            Datetime endDT = Datetime.newInstance(
                endDate.year,
                endDate.month,
                endDate.day,
                23, 59, 59
            );

            List<Calendar_Event__c> calendarEvents = [
                SELECT 
                Id,
                Title__c,
                Start_Time__c,
                End_Time__c,
                Type__c
                FROM Calendar_Event__c
                WHERE End_Time__c >= :startDT
                AND Start_Time__c <= : endDT
                ORDER BY Start_Time__c ASC
            ];

            return new ResponseWrapper(JSON.serialize(calendarEvents), null, false);
        } catch (Exception e) {
            return new ResponseWrapper(null, e.getMessage() + '\n' + e.getLineNumber(), true);
        }
    }

    @AuraEnabled
    public static ResponseWrapper getUserTimeZone(){
        try {
            return new ResponseWrapper(JSON.serialize(UserInfo.getTimeZone().getID()), null, false);
        } catch (Exception e) {
            return new ResponseWrapper(null, e.getMessage() + '\n' + e.getLineNumber(), true);
        }
    }   

    public class ResponseWrapper {
        @AuraEnabled public String payload {get;set;}
        @AuraEnabled public String errorMessage {get;set;}
        @AuraEnabled public Boolean isError {get;set;}

        public ResponseWrapper(
            String payload,
            String errorMessage,
            Boolean isError
        ) {
                this.payload = payload;
                this.errorMessage = errorMessage;
                this.isError = isError;
        }
    }

    public class DateWrapper {
        @AuraEnabled public Integer year {get; set;}
        @AuraEnabled public Integer month {get; set;}
        @AuraEnabled public Integer day {get; set;}
    }
}