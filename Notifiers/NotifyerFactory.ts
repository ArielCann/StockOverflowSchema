import { EmailService } from "./EmailService";
import { SMSService } from "./SMSService";
import { Notifyer } from "./Subscribers";

/**
 * this factory is responsible for returning notifyers based on user input 
 */
export class NotifyerFactory {

    public static GetNotifyers(notifyer: string): Notifyer {
        if (notifyer === 'Email') {
            return new EmailService();
        } else if (notifyer === 'SMS') {
            return new SMSService();
        } else {
            throw Error('Notiryer doesnt exist')
        }
    }
}