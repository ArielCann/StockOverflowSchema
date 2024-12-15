import { IStockSearcher } from "./IStockSearcher";
import { StockSearcher } from "./StockSeacher";



export class StockSearcherFactory {

    public getAPIInstance(api: string): IStockSearcher { 
        if (api == 'StockSearcher') {
            return new StockSearcher();
        } else {
            throw new Error('API not found')
        }
    }
}