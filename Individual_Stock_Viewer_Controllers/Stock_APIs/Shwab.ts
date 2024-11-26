import axios from 'axios';
import { IIndividualStockPageAPIInformation } from './IIndividualStockPageAPIInformation';
import * as dotenv from 'dotenv';
import { ITrendingStocksPageAPIInformation } from './ITrendingStocksPageAPIInformation';
/**
 * this class is responsible for getting data about stocks from the Shwab API
 */
export class Shwab implements IIndividualStockPageAPIInformation, ITrendingStocksPageAPIInformation {
    constructor () {
        dotenv.config();
    }
    getStockData(ticker: string): Promise<any> {
        return this.getStockSummary(ticker);
    }
  
    public async getStockSummary(ticker: string) {
        const options = {
            method: 'GET',
            url: 'https://schwab.p.rapidapi.com/symbols/get-summary',
            params: {symbol: ticker},
            headers: {
              'x-rapidapi-key': process.env.RAPID_API_KEY,
              'x-rapidapi-host': 'schwab.p.rapidapi.com'
            }
          };
          
          try {
              const response = await axios.request(options);
            //   console.log(response.data);
              return {'Name': 'Summary', 'Data': response.data};
            } catch (error) {
                console.error(error);
                return {'msg': 'Cannot get the Stock Summary'}
            }
    }
    /**
     * get the current trending stocks based on the trending category 
     * @param trendingCategory the different types of Trending Categories that can be used
     */
    public async get_trending_data(trendingCategory: string) {
        const options = {
        method: 'GET',
        url: 'https://schwab.p.rapidapi.com/market/v2/get-movers',
        params: {
            rankType: trendingCategory
        },
        headers: {
            'x-rapidapi-key': process.env.RAPID_API_KEY,
            'x-rapidapi-host': 'schwab.p.rapidapi.com'
        }
        };

        try {
            const response = await axios.request(options);
            // console.log(response.data);
            return {'Name': 'Trending', 'Data': response.data};
        } catch (error) {
            console.error(error);
            return {'msg': 'Cannot get the Trending stock data'}
        }
    }
}