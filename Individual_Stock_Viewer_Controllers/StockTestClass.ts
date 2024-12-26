import { IAPI_Executor } from "./Stock_API_Commands/IAPI_Executor";
import { StockDataExecutor } from "./Stock_API_Commands/StockDataCommand";



const stockCommand1: IAPI_Executor = new StockDataExecutor('YahooEarnings');
const stockCommand2: IAPI_Executor = new StockDataExecutor('Shwab');
const stockCommand3: IAPI_Executor = new StockDataExecutor('WallStreet Journal');
const stockCommand4: IAPI_Executor = new StockDataExecutor('Yahoo Finance');
const stockCommand5: IAPI_Executor = new StockDataExecutor('Yahoo News');
const commands: IAPI_Executor[] = [stockCommand1, stockCommand2, stockCommand3, stockCommand4, stockCommand5];
commands.forEach(command => {
    console.log(command.get_data('TSLA'));
})