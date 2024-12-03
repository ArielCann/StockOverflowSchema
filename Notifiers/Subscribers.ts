export interface Notifyer {
    notify(to: string, subject: string, bodyText: string): Promise<any>;
}