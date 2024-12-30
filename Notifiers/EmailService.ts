import { Notifyer } from "./Subscribers";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import nodemailer from 'nodemailer'

/**
 * this email service class sends emails to Accounts using the Simple Email Service by AWS to notify them 
 */

export class EmailService implements Notifyer  {
  /**
   * this method is responsible for sending out an email to a user that forgot there password 
   * @param toEmail the email where the verification code is being sent to 
   * @param subject the title of the email
   * @param bodyText the test, ie the verification code, of the email
   */
    async notify(toEmail: string, subject: string, bodyText: string) {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'stockoverflowinfo@gmail.com',
              pass: process.env.EMAIL_PASSWORD
            }
          });
          
          var mailOptions = {
            from: 'stockoverflowinfo@gmail.com',
            to: toEmail,
            subject: subject,
            text: bodyText
          }
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
      }
}
// SES: Send Email
