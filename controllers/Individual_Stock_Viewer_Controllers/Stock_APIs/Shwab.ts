import axios from 'axios';
import { IStockAPIInformation } from './IStockInformation';
import * as dotenv from 'dotenv';

export class Shwab implements IStockAPIInformation{
    constructor () {
        dotenv.config();
    }
    getStockData(ticker: string) {
        this.getStockSummary(ticker);
    }
  
    public async getStockSummary(ticker: string) {
        const options = {
            method: 'GET',
            url: 'https://schwab.p.rapidapi.com/symbols/get-summary',
            params: {symbol: 'TSLA'},
            headers: {
              'x-rapidapi-key': process.env.RAPID_API_KEY,
              'x-rapidapi-host': 'schwab.p.rapidapi.com'
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