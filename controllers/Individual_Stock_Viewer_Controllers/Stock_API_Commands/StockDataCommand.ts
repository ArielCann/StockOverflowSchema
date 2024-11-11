import { IStockAPIInformation } from "../Stock_APIs/IStockInformation";
import { StockAPIInformationFactory } from "../Stock_APIs/StockInformationFactory";
import { IAPI_Command } from "./IAPI_Command";
/**
 * this command is responsible for getting the stock information based of what command the backend wants to get 
 */
export class StockDataCommand implements IAPI_Command{
    
    private stockAPI: IStockAPIInformation;

    constructor(stockAPIType: string) {
        this.stockAPI = StockAPIInformationFactory.getAPIInstance(stockAPIType);
    }
    get_data(ticker: string): any {
        return this.stockAPI.getStockData(ticker);
    }
    
}