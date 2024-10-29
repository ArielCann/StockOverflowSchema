import { IStockAPIInformation } from "./IStockInformation";
import { Shwab } from "./Shwab";
import { WallStreetJournal } from "./WallStreetJournal";
import { YahooFinance } from "./YahooFinance";

export class AbstractStockAPIInformationFactory {

    public getAPIInstance(api: string): IStockAPIInformation { 
        if (api == 'Yahoo Finance') {
            return new YahooFinance();
        }
        else if (api == 'Shwab') {
            return new Shwab();
        } 
        else if (api == 'WallStreet Journal') {
            return new WallStreetJournal();
        } else {
            throw new Error('API not found')
        }
    }
}