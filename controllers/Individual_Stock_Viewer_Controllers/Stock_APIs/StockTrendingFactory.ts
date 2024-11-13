import { ITrendingStocksPageAPIInformation } from "./ITrendingStocksPageAPIInformation";
import { Shwab } from "./Shwab";

export class StockTrendingFactory {

    public getAPIInstance(api: string): ITrendingStocksPageAPIInformation { 
        if (api = 'Shwab') {
            return new Shwab();
        } else {
            throw new Error('API not found')
        }
    }
}