import { IAPI_Command } from "./Stock_API_Commands/IAPI_Command";
import { StockDataCommand } from "./Stock_API_Commands/StockDataCommand";



const stockCommand1: IAPI_Command = new StockDataCommand('YahooEarnings');
const stockCommand2: IAPI_Command = new StockDataCommand('Shwab');
const stockCommand3: IAPI_Command = new StockDataCommand('WallStreet Journal');
const stockCommand4: IAPI_Command = new StockDataCommand('Yahoo Finance');
const stockCommand5: IAPI_Command = new StockDataCommand('Yahoo News');
const commands: IAPI_Command[] = [stockCommand1, stockCommand2, stockCommand3, stockCommand4, stockCommand5];
commands.forEach(command => {
    console.log(command.get_data('TSLA'));
})