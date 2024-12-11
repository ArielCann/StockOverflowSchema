/**
 * this interface is responsible for giving methods to classes to make them notify users about stocks they follow every day 
 */
export interface NotifyerHandlerService {
    /**
     * theis method is responsible for getting a topic regarding a specific stock. if it doesnt exist, itll call teh api and make a new topic 
     * @param topicName 
     */
    getStockTopic(topicName: string): Promise<string>;
    /**
     * this method is responsible for subsribing a user to a certain stock to recieve daily news about it 
     */
    subscribeStocks(stock: string[], protocol: string, endpoint: string): Promise<void>;

    /**
     * this method is responsible for unsubscibing a user from a certain stock to not recieve daily news about it 
     */
    unsubscribeStocks(topicName: string[], endpoint: string): Promise<void>;
}