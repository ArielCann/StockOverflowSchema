import { IBasicStockDataAPI } from "./IBasicStockDataAPI";
import { RealTimeStockDataAPI } from "./RealTimeStockDataAPI";

export class StockBasicDataFactory {

    public getAPIInstance(api: string): IBasicStockDataAPI { 
        if (api == 'RealTimeStockData') {
            return new RealTimeStockDataAPI();
        } else {
            throw new Error('API not found')
        }
    }
}