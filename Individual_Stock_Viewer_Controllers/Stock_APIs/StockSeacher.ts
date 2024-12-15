import axios from 'axios';
import { IIndividualStockPageAPIInformation } from './IIndividualStockPageAPIInformation';
import * as dotenv from 'dotenv';
import { IStockSearcher } from './IStockSearcher';

export class StockSearcher implements IStockSearcher{

    constructor() {
        dotenv.config();
    }
    get_stock_recommendations(ticker_query: string): Promise<any> {
        return this.getStockTimestamp(ticker_query);

    }
    /**
     * this method is responsible for getting the recommended stock information 
     * @param ticker 
     */
    public async getStockTimestamp(ticker_query: string) {
        const options = {
            method: 'GET',
            url: 'https://stocksearch.p.rapidapi.com/api/stocks',
            params: {
              query: ticker_query,
              size: '8'
            },
            headers: {
              'x-rapidapi-key': process.env.RAPID_API_KEY,
              'x-rapidapi-host': 'stocksearch.p.rapidapi.com'
            }
          };
          
          try {
              const response = await axios.request(options);
              console.log(response.data);
              return {'Name': 'Chart', 'Data': response.data};
            } catch (error) {
                console.error(error);
                return {'msg': 'Cannot get the chart data'}
            }
    }
}