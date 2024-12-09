import { IAPI_Command } from "../Individual_Stock_Viewer_Controllers/Stock_API_Commands/IAPI_Command";


export class WorkerSNSTasks {

    private sns: any;
    private stockAPI?: IAPI_Command;
    constructor(sns: any) {
        this.sns = sns;
    }
    public addExecutor(stockAPI: IAPI_Command) {
        this.stockAPI = stockAPI;
    }
    /**
     * this method is responsible for sending notifications to all the users in a topic
     * @param topicArn 
     * @returns 
     */
    public async SendNotifications(topicArn: string): Promise<any> {
        try {
            const topicName = this.extractTickerName(topicArn);
            const stockNews = this.stockAPI?.get_data(topicName);
            const response = await this.sns.publish({
                TopicAtn: topicArn,
                Message: JSON.stringify(stockNews)
            }).promise();
            return response.MessageId;
        } catch(error) {
            return error;
        }

    }

    extractTickerName = (topicArn: string): string => {
        const parts = topicArn.split(':');
        return parts[1]
    }
}