import { AbstractStockAPIFactory } from "../Stock_APIs/AbstractStockAPIFactory";
import { ITrendingStocksPageAPIInformation } from "../Stock_APIs/ITrendingStocksPageAPIInformation";
import { StockTrendingFactory } from "../Stock_APIs/StockTrendingFactory";
import { IAPI_Executor } from "./IAPI_Executor";

/**
 * this class represents a command to get the trending stocks 
 */
export class StockTrendingCommand implements IAPI_Executor {

    private trendingApi : ITrendingStocksPageAPIInformation;

    constructor(stockAPIType: string) {
        const factory: StockTrendingFactory = AbstractStockAPIFactory.getTrendingFactory()
        this.trendingApi = factory.getAPIInstance(stockAPIType);
    }
    /**
     * 
     * @param category of the type of stock trend to get
     * @returns the top stocks in that current trend
     */
    get_data(category: string) {
        return this.trendingApi.get_trending_data(category);
    }
    
}