import { AbstractStockAPIFactory } from "../Stock_APIs/AbstractStockAPIFactory";
import { IBasicStockDataAPI } from "../Stock_APIs/IBasicStockDataAPI";
import { ITrendingStocksPageAPIInformation } from "../Stock_APIs/ITrendingStocksPageAPIInformation";
import { StockBasicDataFactory } from "../Stock_APIs/StockBasicDataFactory";
import { IAPI_Executor } from "./IAPI_Executor";

/**
 * this class represents an executor to exeute a command to get the basic stock information 
 */
export class StockBasicCommand implements IAPI_Executor {

    private basicStockAPI : IBasicStockDataAPI;

    constructor(stockAPIType: string) {
        const factory: StockBasicDataFactory = AbstractStockAPIFactory.getStockBasicFactory();
        this.basicStockAPI = factory.getAPIInstance(stockAPIType);
    }
    /**
     * 
     * @param category of the type of stock trend to get
     * @returns the stock with its basic information
     */
    get_data(category: string) {
        return this.basicStockAPI.get_data(category);
    }
    
}