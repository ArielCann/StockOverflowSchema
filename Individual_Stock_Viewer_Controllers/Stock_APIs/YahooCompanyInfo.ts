import axios from 'axios';
import { IIndividualStockPageAPIInformation } from './IIndividualStockPageAPIInformation';
import * as dotenv from 'dotenv';
/**
 * 
 */
export class YahooCompanyInfo implements IIndividualStockPageAPIInformation{

    constructor () {
        dotenv.config();
    }
    getStockData(ticker: string): Promise<any> {
        return this.getEarnings(ticker);
    }
    public async getEarnings(ticker: string) {
        const options = {
            method: 'GET',
            url: 'https://yahoo-finance15.p.rapidapi.com/api/v1/markets/stock/modules',
            params: {
              ticker: ticker,
              module: 'asset-profile'
            },
            headers: {
              'x-rapidapi-key': process.env.RAPID_API_KEY,
              'x-rapidapi-host': 'yahoo-finance15.p.rapidapi.com'
            }
          };
          
          try {
              const response = await axios.request(options);
            //   console.log(response.data);
            return {'Name': 'Company_Info', 'Data': response.data};
          } catch (error) {
              console.error(error);
              return {'msg': 'cannot get earnings'}
          }
    }

}