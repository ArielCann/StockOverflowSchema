import { parentPort, workerData } from 'worker_threads';
import AWS from 'aws-sdk';
import { error } from 'console';
const sns = new AWS.SNS({ region: 'us-east-1' }); 

/**
 * this method is responsible for subscribing the current account to a specific topic 
 * @param topic 
 * @param protocol 
 * @param endpoint 
 */
async function subscribeUser(topic: string, protocol: string, endpoint: string, ) {
    let topicArn = await getStockTopic(topic);
    try {
        const response = await sns
            .subscribe({
                TopicArn: topicArn, 
                Protocol: protocol, 
                Endpoint: endpoint, 
            })
            .promise();

        console.log(`Subscription ARN: ${response.SubscriptionArn}`);
        } catch (error) {
            console.error('Error subscribing user to topic:', error);
            throw error;
        }
}
/**
     * this method is responsible for unsubscribing users when they eitehr remove the stock from tehre profile or turn off notifications 
     * @param topicNames tehh name of teh topic the user is being unsubscribed from
     * @param endpoint the user email
     */
async function unsubscibeUser(topicName: string, endpoint: string) {
    const topicArn = await getStockTopic(topicName);
            const currSubscriptions = await listSubscriptions(topicArn);
            const userSubscription = currSubscriptions.find(sub => sub.Endpoint === endpoint);
            if (userSubscription && userSubscription.SubscriptionArn) {
                 await removeUserSubscription(userSubscription.SubscriptionArn);
            } else {
                throw new Error("No User found to unsubscibe")
            }
}
async function listSubscriptions(topicArn: string): Promise<any[]> {
    try {
        const response = await sns.listSubscriptionsByTopic({ TopicArn: topicArn }).promise();
        return response.Subscriptions || [];
    } catch (error) {
        console.error('Error listing subscriptions:', error);
        throw error;
    }
}
async function removeUserSubscription(subscriptionArn: string): Promise<string> {
    try {
        await sns.unsubscribe({ SubscriptionArn: subscriptionArn }).promise();
        return `Successfully unsubscribed: ${subscriptionArn}`;
    } catch (error) {
        console.error('Error unsubscribing:', error);
        throw error;
    }
}
/**
 * this method is responsible for getting teh topic arn from sns. if it doesnt exist, itll create a new one 
 * @param topicName 
 * @returns 
 */
async function getStockTopic(topicName: string): Promise<string> {
    try {
        // Use the ListTopics API to check if the topic exists
        const listTopicsResponse = await sns.listTopics().promise();
        const existingTopic = listTopicsResponse.Topics?.find(
            (topic) => topic.TopicArn && topic.TopicArn.endsWith(`:${topicName}`)
        );

        if (existingTopic && existingTopic.TopicArn) {
            console.log(`Topic already exists: ${existingTopic.TopicArn}`);
            return existingTopic.TopicArn;
        }

        // If topic does not exist, create it
        const createTopicResponse = await sns.createTopic({ Name: topicName }).promise();
        console.log(`Created new topic: ${createTopicResponse.TopicArn}`);
        return createTopicResponse.TopicArn!;
    } catch (error) {
        console.error('Error creating or fetching the topic:', error);
        throw error;
    }
}
//this 'method' calls either to subscribe or unsubscribe the user based on the data passed in
if (parentPort) {
    if (workerData.isSubscribing) {
        subscribeUser(workerData.topicName, workerData.protocol, workerData.endpoint)
            .then(() => {
                parentPort?.postMessage({ success: true }); 
            })
            .catch((err) => {
                parentPort?.postMessage({ success: false, error: err.message }); 
            });
    } else {
        unsubscibeUser(workerData.topicName, workerData.endpoint)
            .then(() => {
                parentPort?.postMessage({ success: true }); 
            })
            .catch((err) => {
                parentPort?.postMessage({ success: false, error: err.message }); 
            });
    }
}