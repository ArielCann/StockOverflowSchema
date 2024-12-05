import { resolve } from "path";
import { IAPI_Command } from "../Individual_Stock_Viewer_Controllers/Stock_API_Commands/IAPI_Command";
import { DailyNotifyerService } from "./DailyNotifyerService";
import { Worker } from 'worker_threads';
/**
 * this class is responsible for notifying all the users based on what stocks they follow by allocating each topic to one thread and notify the account
 * NOTE: ChatGPT is responsible for all the API code, I allocated/ organized the code provided
 */
export class SNSDailyNotifyer implements DailyNotifyerService{

    private sns: any;
    private stockNewsAPI: IAPI_Command;

    constructor(sns: any, stockNewsAPI: IAPI_Command) {
        this.sns = sns;
        this.stockNewsAPI = stockNewsAPI;
    }

 
    async notifyAllAccounts(): Promise<void> {
        try {
            const topics = await runTopicsWorker();
            console.log(`Found ${topics.length} topics`);

            const workerPromises = topics.map(
                (topicArn) =>
                    new Promise<void>((resolve, reject) => {
                        const worker = new Worker('./StockDailyNotifyer/TopicNotifierWorker.ts', {
                            execArgv: ['-r', 'ts-node/register'],
                            workerData: { topicArn},
                        });

                        worker.on('message', (data) => {
                            if (data.success) {
                                console.log(`Successfully notified topic: ${data.topicArn}, Message ID: ${data.messageId}`);
                                resolve();
                            } else {
                                console.error(`Failed to notify topic: ${data.topicArn}`);
                                reject(data.error);
                            }
                        });

                        worker.on('error', (error) => {
                            console.error(`Worker error for topic ${topicArn}:`, error);
                            reject(error);
                        });

                        worker.on('exit', (code) => {
                            if (code !== 0) {
                                reject(new Error(`Worker stopped with exit code ${code}`));
                            }
                        });
                    })
            );

            // Wait for all workers to complete
            await Promise.all(workerPromises);

            console.log('All topics notified successfully');
        } catch (error) {
            console.error('Error notifying all users:', error);
            throw error;
        }
    }
    
 }

function runTopicsWorker(): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const topicworker = new Worker("./StockDailyNotifyer/GetTopicWorker.ts", {execArgv: ['-r', 'ts-node/register']});
        topicworker.on('message', (data: string[]) => {
            resolve(data);
        });
        topicworker.on('error', (error) => {
            reject(error); // Reject the promise if there's an error
        });

        // Listen for exit events to handle unexpected termination
        topicworker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    })
}
