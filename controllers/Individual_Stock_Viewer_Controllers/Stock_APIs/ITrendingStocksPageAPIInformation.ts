/**
 * This interface is for any Stock API's that will be showed in the Trending Page
 */
export interface ITrendingStocksPageAPIInformation {
    get_trending_data(trendingCategory: string): any;
}