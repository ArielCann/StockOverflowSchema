import axios from 'axios';
import { IIndividualStockPageAPIInformation } from './IIndividualStockPageAPIInformation';
import * as dotenv from 'dotenv';
/**
 * this class is responsible for getting all the news for a specific stock 
 */
export class YahooNews implements IIndividualStockPageAPIInformation{

    constructor () {
        dotenv.config();
    }

    getStockData(ticker: string): Promise<any> {
        return this.getNews(ticker);
    }

    public async getNews(ticker: string) {
        const options = {
            method: 'GET',
            url: 'https://yahoo-finance166.p.rapidapi.com/api/news/list-by-symbol',
            params: {
              s: ticker,
              region: 'US',
              snippetCount: '20'
            },
            headers: {
              'x-rapidapi-key': process.env.RAPID_API_KEY,
              'x-rapidapi-host': 'yahoo-finance166.p.rapidapi.com'
            }
          };
          
          try {
              const response = await axios.request(options);
            //   console.log(response.data);
              return {'Name': 'News', 'Data': response.data};
            } catch (error) {
                console.error(error);
                return {'msg': 'Cannot get the News data'}
            }
    }
}