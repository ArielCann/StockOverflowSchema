import { AbstractStockAPIFactory } from "../Stock_APIs/AbstractStockAPIFactory";
import { IIndividualStockPageAPIInformation } from "../Stock_APIs/IIndividualStockPageAPIInformation";
import { StockAPIInformationFactory } from "../Stock_APIs/StockInformationFactory";
import { IAPI_Command } from "./IAPI_Command";
/**
 * this command is responsible for getting the stock information based of what command the backend wants to get 
 */
export class StockDataCommand implements IAPI_Command{
    
    private stockAPI: IIndividualStockPageAPIInformation;

    constructor(stockAPIType: string) {
        const factory: StockAPIInformationFactory = AbstractStockAPIFactory.getStockInformationFactory()
        this.stockAPI = factory.getAPIInstance(stockAPIType);
    }
    get_data(ticker: string): any {
        return this.stockAPI.getStockData(ticker);
    }
    
}