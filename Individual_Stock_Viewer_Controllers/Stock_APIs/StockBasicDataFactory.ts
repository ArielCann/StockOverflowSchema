import { IBasicStockDataAPI } from "./IBasicStockDataAPI";
import { AlphaVantage } from "./AlphaVantage";
import { RealTimeStockData } from "./RealTimeStockData";

export class StockBasicDataFactory {

    public getAPIInstance(api: string): IBasicStockDataAPI { 
        if (api == 'AlphaVantage') {
            return new AlphaVantage();
        } else if (api == 'RealTime') {
            return new RealTimeStockData()
        }
        else {
            throw new Error('API not found')
        }
    }
}