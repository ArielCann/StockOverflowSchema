import { resolve } from "path";
import { Worker } from 'worker_threads';
import { IAPI_Executor } from "../Individual_Stock_Viewer_Controllers/Stock_API_Commands/IAPI_Executor";
import { StockBasicCommand } from "../Individual_Stock_Viewer_Controllers/Stock_API_Commands/StockBasicData";
import { StockDataExecutor } from "../Individual_Stock_Viewer_Controllers/Stock_API_Commands/StockDataCommand";
import express, {Request, Response} from 'express';
import Account from "../models/accountSchema";
import ProfileImage from "../models/imageSchema";
import { NotifyerHandlerService } from "../StockDailyNotifyer/NotifyerHandlerService";
import { NotifyerServiceHandlerFactory } from "../StockDailyNotifyer/NotifyerServiceHandlerFactory";

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
        const stockChartCommand: IAPI_Executor = new StockDataExecutor('WallStreet Journal');
        const commands: IAPI_Executor[] = [stockChartCommand]
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
        const stockBasicDataCommand: IAPI_Executor = new StockBasicCommand('Yahoo');
        const commands: IAPI_Executor[] = [stockBasicDataCommand]
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
 * this class is responsible for getting the stock searcher page
 * @param req 
 * @param res 
 * @returns 
 */
export const getStockSearcher = async(req: Request, res: Response): Promise<void> => {
    console.log('stock searcher')
    let currAccount = await Account.findById(req.session.currAccount);
    let profileImageBase64 = "";
    if (currAccount) {
        let currProfilePic = await ProfileImage.findById(currAccount.ProfileImage);
        if (!currProfilePic) {
            currProfilePic = null;
        } else {
            //have to cast it to base 64 to be read
            profileImageBase64 = `data:${currProfilePic.imageType};base64,${currProfilePic.imageData.toString("base64")}`;
        }
    }
    
    res.status(200).json({isAuthenticated: req.session.loggedIn, 'currUser': req.session.currAccount ? req.session.currAccount : "", 'profilePicture': profileImageBase64});
    return;
}

/**
 * 
 */
export const postStockSearcher = async(req: Request, res: Response): Promise<void> => {
    let currAccount = await Account.findById(req.session.currAccount);
    let profileImageBase64 = "";
    if (currAccount) {
        let currProfilePic = await ProfileImage.findById(currAccount.ProfileImage);
        if (!currProfilePic) {
            currProfilePic = null;
        } else {
            //have to cast it to base 64 to be read
            profileImageBase64 = `data:${currProfilePic.imageType};base64,${currProfilePic.imageData.toString("base64")}`;
        }
    }
    if (req.body.curr_user_input === "") {
        res.status(200).json({data: []});
        return;
    }
    const tasks = [{id: 1, data: {'API': 'StockSearcher', 'Data': req.body.curr_user_input, 'ExecutorType': 'Search'}}]
    try {
        const response = await Promise.all(tasks.map(task => runStockWorker(task)));
        console.log("The response:", response);
        res.status(200).json({ data: response});
        return;
    } catch (error) {
        console.error("Error processing tasks:", error);
        res.status(500).json({ data: 'Error getting stocks' });
        return;
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
export const getTrendingPagee = async(req: Request<StockTickerParams>, res: Response): Promise<void> => {
    try {

        const tasks = [
            {id: 1, data: {'API': 'Shwab', 'Data': 'MostActive', 'ExecutorType': 'Trending'}},
            {id: 2, data: {'API': 'Shwab', 'Data': 'PctChgGainers', 'ExecutorType': 'Trending'}},
            {id: 3, data: {'API': 'Shwab', 'Data': 'PctChgLosers', 'ExecutorType': 'Trending'}},
            {id: 4, data: {'API': 'Shwab', 'Data': 'NetGainers', 'ExecutorType': 'Trending'}},
            {id: 5, data: {'API': 'Shwab', 'Data': 'NetLosers', 'ExecutorType': 'Trending'}},
            {id: 6, data: {'API': 'Shwab', 'Data': 'High52Wk', 'ExecutorType': 'Trending'}},
            {id: 7, data: {'API': 'Shwab', 'Data': 'Low52Wk', 'ExecutorType': 'Trending'}}
        ]
        const results = await Promise.all(tasks.map(task => runStockWorker(task)));
        let currAccount = await Account.findById(req.session.currAccount);
        let profileImageBase64 = "";
        if (currAccount) {
            let currProfilePic = await ProfileImage.findById(currAccount.ProfileImage);
            if (!currProfilePic) {
                currProfilePic = null;
            } else {
                //have to cast it to base 64 to be read
                profileImageBase64 = `data:${currProfilePic.imageType};base64,${currProfilePic.imageData.toString("base64")}`;
            }
        }
        res.status(200).json({Stock: results, isAuthenticated: req.session.loggedIn, 'currUser': req.session.currAccount ? req.session.currAccount : "", 'profilePicture': profileImageBase64});
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({error: 'Failed to retrieve stock data', isAuthenticated: req.session.loggedIn})
        }
    }
}
export const getIndividualStockViewer = async(req: Request<StockTickerParams>, res: Response): Promise<void> => {
    try {
        const responseMap: Map<string, any> = new Map<string, any>();
        const tasks = [
            {id: 1, data: {'API': 'YahooEarnings', 'Data': req.params.stockTicker, 'ExecutorType': 'IndividualStockPageData'}},
            {id: 2, data: {'API': 'Shwab', 'Data': req.params.stockTicker, 'ExecutorType': 'IndividualStockPageData'}},
            {id: 3, data: {'API': 'Yahoo Company Info', 'Data': req.params.stockTicker, 'ExecutorType': 'IndividualStockPageData'}},
            {id: 4, data: {'API': 'Yahoo Finance', 'Data': req.params.stockTicker, 'ExecutorType': 'IndividualStockPageData'}},
            {id: 5, data: {'API': 'Yahoo News', 'Data': req.params.stockTicker, 'ExecutorType': 'IndividualStockPageData'}}
        ]
        const results = await Promise.all(tasks.map(task => runStockWorker(task)));
        results.forEach(response => {
            console.log(response)
            responseMap.set(response.Name, response.Data)
        });
        const responseObject = Object.fromEntries(responseMap);
        let currAccount = await Account.findById(req.session.currAccount);
        let profileImageBase64 = "";
        if (currAccount) {
            let currProfilePic = await ProfileImage.findById(currAccount.ProfileImage);
            if (!currProfilePic) {
                currProfilePic = null;
            } else {
                //have to cast it to base 64 to be read
                profileImageBase64 = `data:${currProfilePic.imageType};base64,${currProfilePic.imageData.toString("base64")}`;
            }
        }
        res.status(200).json({Stock: responseObject, isAuthenticated: req.session.loggedIn, 'currUser': req.session.currAccount ? req.session.currAccount : "", 'profilePicture': profileImageBase64});
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({error: 'Failed to retrieve stock data', isAuthenticated: req.session.loggedIn})
        }
    }
}
/**
 * this post route is responsible for adding teh stock ticker and stock name to the user that clicked the add button. 
 * @param req 
 * @param res 
 * @returns 
 */
export const postAddUserStock = async (req: Request, res: Response): Promise<void> => {
    const account = await Account.findById(req.session.currAccount);
    if (!account) {
        res.status(422).send({msg: "No Current User is Signed in"});
        return;
    }
    const StockName = req.body.stockName.replace(/\./g, "");

    const isChanged: boolean = await account.addFollowedStock(StockName, req.body.ticker)
    if (!isChanged) {
        console.log('geez')
        res.status(422).send({msg: "Stock Already Added"})
        return;
    }
    if (account.RecieveStockNewsNotifications) {
        const notifyerHandlerService: NotifyerHandlerService = NotifyerServiceHandlerFactory.getNotifyerService('SNS');
        notifyerHandlerService.subscribeStocks([req.body.ticker], 'email', account.Email.toString())
    }
    res.status(200).send({msg: "Stock Added Successfully"})

}
export const postDeleteUserStock = async(req: Request, res: Response): Promise<void> => {
    const account = await Account.findById(req.session.currAccount);
    if (!account) {
        res.status(422).send({msg: "No Current User is Signed in"});
        return;
    }
    console.log('removing stock...')
    const StockName = req.body.stockName.replace(/\./g, "");
    console.log(StockName);
    const isChanged: boolean = await account.removeFollowedStock(StockName, req.body.ticker)
    if (!isChanged) {
        console.log('sfsdfsf')
        res.status(422).send({msg: "Stock Already Added"})
        return;
    }
    if (account.RecieveStockNewsNotifications) {
        const notifyerHandlerService: NotifyerHandlerService = NotifyerServiceHandlerFactory.getNotifyerService('SNS');
        notifyerHandlerService.unsubscribeStocks([req.body.ticker], account.Email.toString())
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



