import { IBasicStockDataAPI } from "./IBasicStockDataAPI";
import axios from 'axios';


export class YahooBasicInfo implements IBasicStockDataAPI {

    public async get_data(ticker: string): Promise<any> {
        
        const options = {
            method: 'GET',
            url: 'https://yahoo-finance166.p.rapidapi.com/api/stock/get-price',
            params: {
              region: 'US',
              symbol: ticker
            },
            headers: {
              'x-rapidapi-key': '0bc2aaf1b2mshcd620cae6b97baep1cf3d3jsn46b5ab94a5fe',
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