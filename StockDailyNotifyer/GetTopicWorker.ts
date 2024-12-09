import { parentPort, workerData } from 'worker_threads';
import AWS from 'aws-sdk';
import { StockDataCommand } from '../Individual_Stock_Viewer_Controllers/Stock_API_Commands/StockDataCommand';
import { IAPI_Command } from '../Individual_Stock_Viewer_Controllers/Stock_API_Commands/IAPI_Command';
const sns = new AWS.SNS({ region: 'us-east-1' }); 
(async () => {
    try {
        const topics: string[] = [];
        let nextToken: string | undefined;

        // Fetch topics in a loop to handle pagination
        do {
            const response = await sns.listTopics({ NextToken: nextToken }).promise();
            response.Topics?.forEach((topic) => {
                if (topic.TopicArn) {
                    topics.push(topic.TopicArn);
                }
            });
            nextToken = response.NextToken; // Update the token for the next iteration
        } while (nextToken);

        // Send the topics array back to the main thread
        parentPort?.postMessage(topics);
    } catch (error) {
        // Send an empty array in case of error
        console.error('Error fetching topics in worker:', error);
        parentPort?.postMessage([]);
    }
})();