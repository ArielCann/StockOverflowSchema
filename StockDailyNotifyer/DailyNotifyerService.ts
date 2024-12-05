 
 export interface DailyNotifyerService {
    /**
     * this method is responsible for notifying all the accounts in each topic for every user 
     */
    notifyAllAccounts(): Promise<void>;
 }