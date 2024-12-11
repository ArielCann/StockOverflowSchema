import { resolve } from "path";
import { Worker } from 'worker_threads';
import { IAPI_Command } from "../Individual_Stock_Viewer_Controllers/Stock_API_Commands/IAPI_Executor";
import { StockBasicCommand } from "../Individual_Stock_Viewer_Controllers/Stock_API_Commands/StockBasicData";
import { StockDataExecutor } from "../Individual_Stock_Viewer_Controllers/Stock_API_Commands/StockDataCommand";
import express, {Request, Response} from 'express';
import Account from "../models/accountSchema";

interface StockTickerParams {
    stockTicker: string;
}
/**
 * this method is responsible for getting the latest price of the stock 
 * @param req 
 * @param res 
 * @returns a map representation of the x, y cordinates for the cart {time: price}
 */
export const getIndividualStockChart = async (req: Request<StockTickerParams>, res: Response): Promise<void> => {
    try {
        const stockChartCommand: IAPI_Command = new StockDataExecutor('WallStreet Journal');
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
        res.status(200).send({'Stock': {'chart': responseObject}, 'isUp': isUp});
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).send({error: 'Failed to retrieve stock data'})
        }
    }
}
/**
 * this method is reponsible for getting the stocks basic information, such as the current price, percentage change and monetary change. Unlike the chart and teh individualStockViewer methods that 
 * are called once per get request. THis method is meant to be called many times in order to continuosly update the price 
 * @param req 
 * @param res 
 */
export const getBasicStockInformation = async(req: Request<StockTickerParams>, res: Response): Promise<void> => {
    try {
        const stockBasicDataCommand: IAPI_Command = new StockBasicCommand('Yahoo');
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
/**
 * 
 * @param data the type of API and the stock ticker that will be sent to the API 
 * @returns the stock data
 */
export function runStockWorker(data:any): Promise<any> {
    return new Promise((resolve, reject) => {
        console.log('inside the ')
        const worker = new Worker("./Individual_Stock_Viewer_Controllers/Stock_API_Commands/StockWorker.ts", { execArgv: ['-r', 'ts-node/register'], workerData: data});
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !==0) {
                reject(new Error('Worker stopped with an exit code ' + code))
            };
        });
    });
}

export const getIndividualStockViewer = async(req: Request<StockTickerParams>, res: Response): Promise<void> => {
    try {
        const responseMap: Map<string, any> = new Map<string, any>();
        const tasks = [
            {id: 1, data: {'API': 'YahooEarnings', 'Data': req.params.stockTicker}},
            {id: 2, data: {'API': 'Shwab', 'Data': req.params.stockTicker}},
            {id: 3, data: {'API': 'Yahoo Company Info', 'Data': req.params.stockTicker}},
            {id: 4, data: {'API': 'Yahoo Finance', 'Data': req.params.stockTicker}},
            {id: 5, data: {'API': 'Yahoo News', 'Data': req.params.stockTicker}}
        ]
        const results = await Promise.all(tasks.map(task => runStockWorker(task)));
        results.forEach(response => {
            console.log(response)
            responseMap.set(response.Name, response.Data)
        });
        const responseObject = Object.fromEntries(responseMap);
        res.status(200).json({Stock: responseObject, isAuthenticated: req.session.loggedIn});
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({error: 'Failed to retrieve stock data', isAuthenticated: req.session.loggedIn})
        }
    }
}
export const postAddUserStock = async (req: Request, res: Response): Promise<void> => {
    const account = await Account.findById(req.session.currAccount);
    if (!account) {
        res.status(422).send({msg: "No Current User is Signed in"});
        return;
    }
    const isChanged: boolean = await account.addFollowedStock(req.body.stockName, req.body.ticker)
    if (!isChanged) {
        console.log('sfsdfsf')
        res.status(422).send({msg: "Stock Already Added"})
        return;
    }
    res.status(200).send({msg: "Stock Added Successfully"})

}
export const postDeleteUserStock = async(req: Request, res: Response): Promise<void> => {
    const account = await Account.findById(req.session.currAccount);
    if (!account) {
        res.status(422).send({msg: "No Current User is Signed in"});
        return;
    }
    const isChanged: boolean = await account.removeFollowedStock(req.body.stockName, req.body.ticker)
    if (!isChanged) {
        console.log('sfsdfsf')
        res.status(422).send({msg: "Stock Already Added"})
        return;
    }
    res.status(200).send({msg: "Stock Deleted Successfully"})
}
// export const getIndividualStockViewer = async (req: Request<StockTickerParams>, res: Response): Promise<void> => {   
//     try {
//         const responseMap: Map<string, any> = new Map<string, any>();
//         const stockCommand1: IAPI_Command = new StockDataCommand('YahooEarnings');
//         const stockCommand2: IAPI_Command = new StockDataCommand('Shwab');
//         const stockCommand3: IAPI_Command = new StockDataCommand('Yahoo Company Info');
//         const stockCommand4: IAPI_Command = new StockDataCommand('Yahoo Finance');
//         const stockCommand5: IAPI_Command = new StockDataCommand('Yahoo News');
//         const commands: IAPI_Command[] = [stockCommand1, stockCommand2, stockCommand3, stockCommand4, stockCommand5];
//         const promises = commands.map(command => {return command.get_data(req.params.stockTicker)});
//         const responses = await Promise.all(promises);
//         responses.forEach(response => {
//             console.log(response)
//             let tempResponse = {'Data': response.Data}
//             responseMap.set(response.Name, tempResponse)
//         });
//         const responseObject = Object.fromEntries(responseMap);
//         res.status(200).send(responseObject);
//     } catch (error) {
//         console.error(error);
//         if (!res.headersSent) {
//             res.status(500).send({error: 'Failed to retrieve stock data'})
//         }
//     }

// }



