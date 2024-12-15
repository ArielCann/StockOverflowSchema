import { IAPI_Executor } from "./IAPI_Executor";
import { StockDataExecutor } from "./StockDataCommand";
import { StockSearcherRecommendations } from "./StockSearcherRecommendations";
import { StockTrendingCommand } from "./StockTrendingCommand";


/**
 * this class is responsible to get executors based on what stock information the user wants to view
 */
export class StockExecutorFactory {

    static GetStockExecutor(executor_type: string, api_type: string): IAPI_Executor {
        if (executor_type == 'Search') {
            return new StockSearcherRecommendations(api_type);
        } else if (executor_type == 'Trending') {
            return new StockTrendingCommand(api_type);
        } else if (executor_type == 'IndividualStockPageData') {
            return new StockDataExecutor(api_type);
        } else {
            throw new Error('No Executors Found')
        }
    }
}