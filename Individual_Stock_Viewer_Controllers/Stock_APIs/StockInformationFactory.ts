import { IIndividualStockPageAPIInformation } from "./IIndividualStockPageAPIInformation";
import { Shwab } from "./Shwab";
import { WallStreetJournal } from "./WallStreetJournal";
import { YahooCompanyInfo } from "./YahooCompanyInfo";
import { YahooEarnings } from "./YahooEarnings";
import { YahooFinance } from "./YahooFinance";
import { YahooNews } from "./YahooNews";


export class StockAPIInformationFactory {

    public getAPIInstance(api: string): IIndividualStockPageAPIInformation { 
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
        } else if (api == 'Yahoo Company Info') {
            return new YahooCompanyInfo();
        }
        else {
            throw new Error('API not found')
        }
    }
}