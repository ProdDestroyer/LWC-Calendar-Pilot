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
            return new ResponseWrapper(JSON.serialize(calendarEvents), null, false);
        } catch (Exception e) {
            return new ResponseWrapper(null, e.getMessage() + '\n' + e.getLineNumber(), true);
        }
    }
    
    @AuraEnabled
    public static ResponseWrapper getUserTimeZone(){
        try {
            return new ResponseWrapper(UserInfo.getTimeZone().getID(), null, false);
        } catch (Exception e) {
            return new ResponseWrapper(null, e.getMessage() + '\n' + e.getLineNumber(), true);
        }
    }

    public class ResponseWrapper {
        @AuraEnabled public string response {get;set;}
        @AuraEnabled public string errorMessage {get;set;}
        @AuraEnabled public Boolean isError {get;set;}

        public ResponseWrapper(
            string response,
            string errorMessage,
            Boolean isError) {
                this.response = response;
                this.errorMessage = errorMessage;
                this.isError = isError;
        }
    }
}