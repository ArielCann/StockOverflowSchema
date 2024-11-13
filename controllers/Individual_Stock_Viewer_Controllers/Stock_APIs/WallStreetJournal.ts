import axios from 'axios';
import { IIndividualStockPageAPIInformation } from './IIndividualStockPageAPIInformation';
import * as dotenv from 'dotenv';

export class WallStreetJournal implements IIndividualStockPageAPIInformation{

    constructor() {
        dotenv.config();
    }
    getStockData(ticker: string) {
        this.getStockTimestamp(ticker);
    }

    /**
     * this method is responsible for getting the stock data by timestamp
     * @param ticker 
     */
    public async getStockTimestamp(ticker: string) {
        //source: 
        const options = {
            method: 'GET',
            url: 'https://wall-street-journal.p.rapidapi.com/api/v1/getTimeSeries',
            params: {
              chartingSymbol: ticker,
              timeFrame: '1d'
            },
            headers: {
              'x-rapidapi-key': process.env.RAPID_API_KEY,
              'x-rapidapi-host': 'wall-street-journal.p.rapidapi.com'
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