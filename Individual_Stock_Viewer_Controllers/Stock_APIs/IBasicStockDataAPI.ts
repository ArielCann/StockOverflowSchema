
/**
 * this interface will get basic stock data such as teh current market price, the precentage increase or 
 * decrease since the markets opened and the price increase/decrese since the markets opened
 */
export interface IBasicStockDataAPI {
    get_data(ticker: string): Promise<any>;
}