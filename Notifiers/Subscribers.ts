export interface Observer {
    notify(to: string, subject: string, bodyText: string): Promise<any>;
}