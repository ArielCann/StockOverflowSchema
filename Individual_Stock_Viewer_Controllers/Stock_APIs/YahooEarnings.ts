import axios from 'axios';
import { IIndividualStockPageAPIInformation } from './IIndividualStockPageAPIInformation';
import * as dotenv from 'dotenv';
/**
 * 
 */
export class YahooEarnings implements IIndividualStockPageAPIInformation{

    constructor () {
        dotenv.config();
    }
    getStockData(ticker: string) {
        return this.getEarnings(ticker);
    }
    public async getEarnings(ticker: string) {
        const options = {
            method: 'GET',
            url: 'https://yahoo-finance15.p.rapidapi.com/api/v1/markets/stock/modules',
            params: {
              ticker: ticker,
              module: 'earnings'
            },
            headers: {
              'x-rapidapi-key': process.env.RAPID_API_KEY,
              'x-rapidapi-host': 'yahoo-finance15.p.rapidapi.com'
            }
          };
          
          try {
              const response = await axios.request(options);
              console.log(response.data);
          } catch (error) {
              console.error(error);
          }
    }

}