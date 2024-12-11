import { NotifyerHandlerService } from "./NotifyerHandlerService";
import { SNSHandler } from "./SNSHandler";

/**
 * this class is responsible for getting the correct Notifyer service and returning its instance based on
 * field passed into it 
 */
export class NotifyerServiceHandlerFactory {

    static getNotifyerService(service: string): NotifyerHandlerService {
        if (service === "SNS") {
            return new SNSHandler();
        } else {
            throw new Error("No Service Handler with name " + service);
        }
    }
}