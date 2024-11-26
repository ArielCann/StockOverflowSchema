import { IBasicStockDataAPI } from "./IBasicStockDataAPI";
import axios from 'axios';


export class RealTimeStockData implements IBasicStockDataAPI {

    public async get_data(ticker: string): Promise<any> {
        
        const options = {
            method: 'GET',
            url: 'https://real-time-finance-data.p.rapidapi.com/stock-quote',
            params: {
              symbol: ticker,
              language: 'en'
            },
            headers: {
              'x-rapidapi-key': process.env.RAPID_API_KEY,
              'x-rapidapi-host': 'real-time-finance-data.p.rapidapi.com'
            }
          };
          

        try {
            const response = await axios.request(options);
            return {'Name': 'Basic', 'Data': response.data};
        } catch (error) {
            console.error(error);
            return {'msg': 'Could not get Basic Stock Data'}
        }
    }

}