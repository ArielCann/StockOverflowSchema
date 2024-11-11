import { IStockAPIInformation } from "./IStockInformation";
import { Shwab } from "./Shwab";
import { WallStreetJournal } from "./WallStreetJournal";
import { YahooEarnings } from "./YahooEarnings";
import { YahooFinance } from "./YahooFinance";
import { YahooNews } from "./YahooNews";


export class StockAPIInformationFactory {

    public static getAPIInstance(api: string): IStockAPIInformation { 
        if (api == 'YahooEarnings') {
            return new YahooEarnings();
        }
        else if (api == 'Shwab') {
            return new Shwab();
        } 
        else if (api == 'WallStreet Journal') {
            return new WallStreetJournal();
        } else if (api == 'Yahoo Finance') {
            return new YahooFinance();
        } else if (api == 'Yahoo News') {
            return new YahooNews();
        } 
        else {
            throw new Error('API not found')
        }
    }
}