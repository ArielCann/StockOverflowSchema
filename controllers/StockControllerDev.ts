
import express, {Request, Response} from 'express'
import data from './IdividualStockDataForDev.json'
interface StockTickerParams {
    stockTicker: string;
}
export const getIndividualStockChart = async (req: Request<StockTickerParams>, res: Response): Promise<void> => {
    const fakeData = {"chart":{"9:40":338.121,"9:50":337.1187,"10:0":337.6299,"10:10":341.79,"10:20":340.963,"10:30":344.4,"10:40":346.1,"10:50":343.7903,"11:0":342.101368,"11:10":342.9601,"11:20":345.5155,"11:30":344.8099,"11:40":343.13,"11:50":344.3401,"12:0":345.4769,"12:10":345.0693,"12:20":345.9201,"12:30":343.8737,"12:40":343.5657,"12:50":344.6299,"13:0":344.955,"13:10":345.5,"13:20":345.69,"13:30":346.22,"13:40":345.8586,"13:50":345.1499,"14:0":345.6652,"14:10":343.5606,"14:20":343.1947,"14:30":342.6701,"14:40":342.08,"14:50":343.442,"15:0":343.807841,"15:10":344.82,"15:20":344.4401,"15:30":344.45,"15:40":344.45,"15:50":345.65,"16:0":345.98,"16:10":346},"isUp":true}
    try {
        res.status(200).json({Stock: fakeData, isAuthenticated: req.session.loggedIn});
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).send({error: 'Failed to retrieve stock data'})
        }
    }
}

export const getIndividualStockViewer = async(req: Request<StockTickerParams>, res: Response): Promise<void> => {
    try {
        const fakeData = data;
        const chartfakeData = {"chart":{"9:40":338.121,"9:50":337.1187,"10:0":337.6299,"10:10":341.79,"10:20":340.963,"10:30":344.4,"10:40":346.1,"10:50":343.7903,"11:0":342.101368,"11:10":342.9601,"11:20":345.5155,"11:30":344.8099,"11:40":343.13,"11:50":344.3401,"12:0":345.4769,"12:10":345.0693,"12:20":345.9201,"12:30":343.8737,"12:40":343.5657,"12:50":344.6299,"13:0":344.955,"13:10":345.5,"13:20":345.69,"13:30":346.22,"13:40":345.8586,"13:50":345.1499,"14:0":345.6652,"14:10":343.5606,"14:20":343.1947,"14:30":342.6701,"14:40":342.08,"14:50":343.442,"15:0":343.807841,"15:10":344.82,"15:20":344.4401,"15:30":344.45,"15:40":344.45,"15:50":345.65,"16:0":345.98,"16:10":346},"isUp":true}
        console.log(req.session.loggedIn)
        let sendata = {'isAuthenticated': req.session.loggedIn ? true : false, 'Stock': fakeData, 'chart': chartfakeData}
        res.status(200).send(sendata);
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).send({error: 'Failed to retrieve stock data'})
        }
    }
}

export const getBasicStockInformation = async (req: Request<StockTickerParams>, res: Response): Promise<void> => {   
    try {
        const fakeData = [{"Name":"Basic","Data":{"status":"OK","request_id":"25c65a9c-993f-43d9-8d09-de3f0f225582","data":{"symbol":"TSLA:NASDAQ","name":"Tesla Inc","type":"stock","price":346,"open":335.8,"high":347.3799,"low":332.75,"volume":88244801,"previous_close":338.74,"change":7.26,"change_percent":2.1432,"pre_or_post_market":344,"pre_or_post_market_change":-2,"pre_or_post_market_change_percent":-0.578,"last_update_utc":"2024-11-19 22:22:11"}}}]
        res.status(200).send(fakeData);
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).send({error: 'Failed to retrieve stock data'})
        }
    }

}



