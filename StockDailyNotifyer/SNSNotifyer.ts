import { NotifyerHandlerService } from "./NotifyerService";
import AWS from 'aws-sdk';
/**
 * this class is responsible for 
 */
export class SNSHandler implements NotifyerHandlerService {

    private sns: any;

    constructor (sns: any) {
        this.sns = sns 
    }

    async unsubscribeStock(topicName: string, endpoint: string): Promise<string> {
        const topicArn = await this.getStockTopic(topicName);
        const currSubscriptions = await this.listSubscriptions(topicArn);
        const userSubscription = currSubscriptions.find(sub => sub.Endpoint === endpoint);
        if (userSubscription && userSubscription.SubscriptionArn) {
            return await this.removeUserSubscription(userSubscription.SubscriptionArn);
        } else {
            return "Error: No User found"
        }

    }
    private async listSubscriptions(topicArn: string): Promise<any[]> {
        try {
            const response = await this.sns.listSubscriptionsByTopic({ TopicArn: topicArn }).promise();
            return response.Subscriptions || [];
        } catch (error) {
            console.error('Error listing subscriptions:', error);
            throw error;
        }
    }
    private async removeUserSubscription(subscriptionArn: string): Promise<string> {
        try {
            await this.sns.unsubscribe({ SubscriptionArn: subscriptionArn }).promise();
            return `Successfully unsubscribed: ${subscriptionArn}`;
        } catch (error) {
            console.error('Error unsubscribing:', error);
            throw error;
        }
    }
    async subscribeStock(stock: string, protocol: string, endpoint: string): Promise<string> {
        const topicArn = await this.getStockTopic(stock);
        try {
        const response = await this.sns
            .subscribe({
                TopicArn: topicArn, // ARN of the SNS topic
                Protocol: protocol, // Protocol (e.g., "email", "sms", "https")
                Endpoint: endpoint, // Endpoint based on the protocol
            })
            .promise();

        console.log(`Subscription ARN: ${response.SubscriptionArn}`);
        return response.SubscriptionArn!;
    } catch (error) {
        console.error('Error subscribing user to topic:', error);
        throw error;
    }
    }

    async getStockTopic(topicName: string): Promise<string> {
        try {
        // Use the ListTopics API to check if the topic exists
        const listTopicsResponse = await this.sns.listTopics().promise();
        const existingTopic = listTopicsResponse.Topics?.find((topic: { TopicArn: string; }) =>
            topic.TopicArn?.endsWith(`:${topicName}`)
        );

        if (existingTopic) {
            console.log(`Topic already exists: ${existingTopic.TopicArn}`);
            return existingTopic.TopicArn!;
        }

        // If topic does not exist, create it
        const createTopicResponse = await this.sns.createTopic({ Name: topicName }).promise();
        console.log(`Created new topic: ${createTopicResponse.TopicArn}`);
        return createTopicResponse.TopicArn!;
    } catch (error) {
        console.error('Error creating or fetching the topic:', error);
        throw error;
    }
    }
    



}