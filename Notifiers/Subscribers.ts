/**
 * this interface is responsible for delegating responsibility to classes that implement it to notify users about specific actions 
 * that happened in their account
 */
export interface Notifyer {
    notify(to: string, subject: string, bodyText: string): Promise<any>;
}