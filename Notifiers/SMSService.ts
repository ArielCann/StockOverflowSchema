import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { Notifyer } from './Subscribers';
/**
 * this class is responsible for sending SMS messages out to users
 */
export class SMSService implements Notifyer {

    async notify(to: string, subject: string, bodyText: string): Promise<any> {
        const snsClient = new SNSClient({ region: 'us-east-1' }); // Replace with your AWS region

        const params = {
            PhoneNumber: to, // E.164 format, e.g., +15555555555
            Message: bodyText, // The SMS message body
        };

        try {
            const command = new PublishCommand(params);
            const response = await snsClient.send(command);
            console.log('SMS sent successfully:', response);
            return response;
        } catch (error) {
            console.error('Error sending SMS:', error);
            throw error;
        }
    }
    
}