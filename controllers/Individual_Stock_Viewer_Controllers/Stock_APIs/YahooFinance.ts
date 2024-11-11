import axios from 'axios';
import { IStockAPIInformation } from './IStockInformation';
import * as dotenv from 'dotenv';

export class YahooFinance implements IStockAPIInformation{

    constructor () {
        dotenv.config();
    }
    
    getStockData(ticker: string) {
        return this.getNews(ticker);
    }

    public async getNews(ticker: string) {
        const options = {
            method: 'GET',
            url: 'https://yahoo-finance166.p.rapidapi.com/api/news/list-by-symbol',
            params: {
              s: ticker,
              region: 'US',
              snippetCount: '500'
            },
            headers: {
              'x-rapidapi-key': process.env.RAPID_API_KEY,
              'x-rapidapi-host': 'yahoo-finance166.p.rapidapi.com'
            }
          };
          
          try {
              const response = await axios.request(options);
              console.log(response.data);
          } catch (error) {
              console.error(error);
          }
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

    public async getFinancialData(ticker: string) {
        const options = {
            method: 'GET',
            url: 'https://yahoo-finance15.p.rapidapi.com/api/v1/markets/stock/modules',
            params: {
              ticker: ticker,
              module: 'financial-data'
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