import { IAPI_Command } from "./IAPI_Command";

export class StockSummaryCommand implements IAPI_Command{
    get_data(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    
}