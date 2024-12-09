import { parentPort, workerData } from 'worker_threads';
import AWS from 'aws-sdk';
import { StockDataExecutor } from '../Individual_Stock_Viewer_Controllers/Stock_API_Commands/StockDataCommand';
import { IAPI_Command } from '../Individual_Stock_Viewer_Controllers/Stock_API_Commands/IAPI_Executor';

const sns = new AWS.SNS({ region: 'us-east-1' }); 

(async () => {
    const { topicArn, message } = workerData; 
    //this method is responsible for extracting the ticker from the topicARn
    const extractTickerName = (topicArn: string): string => {
        const parts: string[] = topicArn.split(':');
        return parts[5];
    }
    const formatNews = (stockNews: any[]): Record<number, { title: string; provider: string; url: string }> => {
        console.log(stockNews)
        const newNewsDict: Record<number, { title: string; provider: string; url: string }> = {};
        let index: number = 0;
        stockNews.forEach(newsItem => {
            newNewsDict[index] = {'title': newsItem['content']['title'], 
                            'provider': newsItem['content']['provider']['displayName'], 
                            'url': newsItem["content"]["clickThroughUrl"] ? newsItem["content"]["clickThroughUrl"]["url"] : newsItem["content"]["previewUrl"]}
            index++;
        })
        return newNewsDict;
    }
    try {
        const stockNewsAPI: IAPI_Command = new StockDataExecutor('Yahoo News');
        const stockNews = await stockNewsAPI.get_data(extractTickerName(topicArn));
        const formattedStockNews = formatNews(stockNews['Data']['data']['main']['stream']);
        const htmlContent = `<html><body><ul>
                            ${Object.entries(formattedStockNews).map(([index, newsItem]) => `
                                <li>
                                    <a href="${newsItem.url}">${newsItem.title}</a>
                                    <strong>${newsItem.provider}</strong>
                                </li>
                                `)}
                            </ul></body></html>`
        const response = await sns.publish({
            TopicArn: topicArn,
            MessageStructure: 'html',
            Message:  htmlContent
        }).promise();

        console.log(`Message sent to topic: ${topicArn}`);
        parentPort?.postMessage({ success: true, topicArn, messageId: response.MessageId });
    } catch (error) {
        console.error(`Error` +  error);
        parentPort?.postMessage({ success: false, topicArn, error });
    }
})();

