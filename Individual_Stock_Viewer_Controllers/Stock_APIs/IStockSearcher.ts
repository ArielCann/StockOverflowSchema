
export interface IStockSearcher {
    get_stock_recommendations(ticker_query: string): Promise<any>;
}