import { AbstractStockAPIFactory } from "../Stock_APIs/AbstractStockAPIFactory";
import { IStockSearcher } from "../Stock_APIs/IStockSearcher";
import { StockSearcherFactory } from "../Stock_APIs/StockSearcherFactory";
import { IAPI_Executor } from "./IAPI_Executor";

export class StockSearcherRecommendations implements IAPI_Executor {
    private StockSearcher : IStockSearcher;

    constructor(stockAPIType: string) {
        const factory: StockSearcherFactory = AbstractStockAPIFactory.getStockSearcherFactory()
        this.StockSearcher = factory.getAPIInstance(stockAPIType);
    }
    /**
     * 
     * @param stock_query - order of character or characters that are entered in by user 
     * @returns the stocks that resemble the query the user entered 
     */
    async get_data(stock_query: string) {
        return await this.StockSearcher.get_stock_recommendations(stock_query)
    }
    
}