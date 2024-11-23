import express from 'express';
import { ExpressValidator } from 'express-validator';
import { getIndividualStockViewer, getIndividualStockChart, getBasicStockInformation } from '../controllers/StockControllersProd';


const router = express.Router();



//this route is to grab stock data like the company information
router.get('/stock-data/:stockTicker', getIndividualStockViewer);

//this route is in order to grab the stock chart
router.get('/stock-chart/:stockTicker', getIndividualStockChart);

//this route gets the stock summmary 
router.get('/stock-basic-data/:stockTicker', getBasicStockInformation)


export default router;