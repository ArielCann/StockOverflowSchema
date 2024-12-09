import { IAPI_Command } from "./IAPI_Executor";

export class StockSearcherRecommendations implements IAPI_Command {
    get_data(ticker: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    
}