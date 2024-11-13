import { IBasicStockDataAPI } from "./IBasicStockDataAPI";
import axios from 'axios';


export class RealTimeStockDataAPI implements IBasicStockDataAPI {

    public async get_data(ticker: string): Promise<any> {
        
        const options = {
            method: 'GET',
            url: 'https://real-time-finance-data.p.rapidapi.com/stock-time-series-yahoo-finance',
            params: {
            symbol: 'AAPL, AMZN',
            period: '1D'
            },
            headers: {
            'x-rapidapi-key': process.env.RAPID_API_KEY,
            'x-rapidapi-host': 'real-time-finance-data.p.rapidapi.com'
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