import { IAPI_Command } from "../Individual_Stock_Viewer_Controllers/Stock_API_Commands/IAPI_Command";
import { StockBasicCommand } from "../Individual_Stock_Viewer_Controllers/Stock_API_Commands/StockBasicData";
import { StockDataCommand } from "../Individual_Stock_Viewer_Controllers/Stock_API_Commands/StockDataCommand";
import express, {Request, Response} from 'express'

interface StockTickerParams {
    stockTicker: string;
}
export const getIndividualStockChart = async (req: Request<StockTickerParams>, res: Response): Promise<void> => {
    try {
        const stockChartCommand: IAPI_Command = new StockDataCommand('WallStreet Journal');
        const commands: IAPI_Command[] = [stockChartCommand]
        const stockChartMap: Map<string, string> = new Map<string, string>();
        const promises = commands.map(command => {return command.get_data(req.params.stockTicker)});
        const response = await Promise.all(promises);
        let startMarketTime = new Date();
        startMarketTime.setHours(9, 40, 0, 0)
        const timeLen = response[0]['Data']['data']['Series'][0]['DataPoints'].length;
        for (let i = 0; i < timeLen; i++) {
            stockChartMap.set(startMarketTime.getHours() + ':' + startMarketTime.getMinutes(), response[0]['Data']['data']['Series'][0]['DataPoints'][i][1]);
            startMarketTime.setMinutes(startMarketTime.getMinutes() + 10)
        }
        const isUp: boolean =  response[0]['Data']['data']['Series'][0]['DataPoints'][0][1] < response[0]['Data']['data']['Series'][0]['DataPoints'][timeLen - 1][1]
        const responseObject = Object.fromEntries(stockChartMap);
        res.status(200).send({'chart': responseObject, 'isUp': isUp});
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).send({error: 'Failed to retrieve stock data'})
        }
    }
}

export const getBasicStockInformation = async(req: Request<StockTickerParams>, res: Response): Promise<void> => {
    try {
        const stockBasicDataCommand: IAPI_Command = new StockBasicCommand('RealTime');
        const commands: IAPI_Command[] = [stockBasicDataCommand]
        const promises = commands.map(command => {return command.get_data(req.params.stockTicker)});
        const response = await Promise.all(promises);
        res.status(200).send(response);
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).send({error: 'Failed to retrieve stock data'})
        }
    }
}

export const getIndividualStockViewer = async (req: Request<StockTickerParams>, res: Response): Promise<void> => {   
    try {
        const responseMap: Map<string, any> = new Map<string, any>();
        const stockCommand1: IAPI_Command = new StockDataCommand('YahooEarnings');
        const stockCommand2: IAPI_Command = new StockDataCommand('Shwab');
        const stockCommand4: IAPI_Command = new StockDataCommand('Yahoo Finance');
        const stockCommand5: IAPI_Command = new StockDataCommand('Yahoo News');
        const commands: IAPI_Command[] = [stockCommand1, stockCommand2, stockCommand4, stockCommand5];
        const promises = commands.map(command => {return command.get_data(req.params.stockTicker)});
        const responses = await Promise.all(promises);
        responses.forEach(response => {
            console.log(response)
            responseMap.set(response.Name, response.Data)
        });
        const responseObject = Object.fromEntries(responseMap);
        res.status(200).send(responseObject);
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).send({error: 'Failed to retrieve stock data'})
        }
    }

}



