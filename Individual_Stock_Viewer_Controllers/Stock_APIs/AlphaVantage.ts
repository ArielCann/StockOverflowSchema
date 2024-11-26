import { IBasicStockDataAPI } from "./IBasicStockDataAPI";
import axios from 'axios';


export class AlphaVantage implements IBasicStockDataAPI {

    public async get_data(ticker: string): Promise<any> {
        const options = {
        method: 'GET',
        url: 'https://alpha-vantage.p.rapidapi.com/query',
        params: {
            function: 'GLOBAL_QUOTE',
            symbol: ticker,
            datatype: 'json'
        },
        headers: {
            'x-rapidapi-key': process.env.RAPID_API_KEY,
            'x-rapidapi-host': 'alpha-vantage.p.rapidapi.com'
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