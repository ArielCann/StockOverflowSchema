import { IBasicStockDataAPI } from "./IBasicStockDataAPI";
import axios from 'axios';
import { IIndividualStockPageAPIInformation } from "./IIndividualStockPageAPIInformation";


export class YahooBasicInfo implements IBasicStockDataAPI, IIndividualStockPageAPIInformation {
    async getStockData(ticker: string): Promise<any> {
        return await this.get_data(ticker);
    }

    public async get_data(ticker: string): Promise<any> {
        
        const options = {
            method: 'GET',
            url: 'https://yahoo-finance166.p.rapidapi.com/api/stock/get-price',
            params: {
              region: 'US',
              symbol: ticker
            },
            headers: {
              'x-rapidapi-key': process.env.RAPID_API_KEY,
              'x-rapidapi-host': 'yahoo-finance166.p.rapidapi.com'
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