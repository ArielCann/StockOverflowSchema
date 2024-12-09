import { IBasicStockDataAPI } from "./IBasicStockDataAPI";
import { AlphaVantage } from "./AlphaVantage";
import { RealTimeStockData } from "./RealTimeStockData";
import { YahooBasicInfo } from "./YahooBasicInfo";

export class StockBasicDataFactory {

    public getAPIInstance(api: string): IBasicStockDataAPI { 
        if (api == 'AlphaVantage') {
            return new AlphaVantage();
        } else if (api == 'RealTime') {
            return new RealTimeStockData()
        } else if (api == 'Yahoo') {
            return new YahooBasicInfo();
        }
        else {
            throw new Error('API not found')
        }
    }
}