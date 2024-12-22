import express from 'express';
import { ExpressValidator } from 'express-validator';
import { getIndividualStockViewer, getIndividualStockChart, getBasicStockInformation, postAddUserStock, getStockSearcher, postStockSearcher, getTrendingPagee } from '../controllers/StockControllerDev';
import { postDeleteUserStock } from '../controllers/StockControllersProd';


const router = express.Router();
//this route is the main stock route, ie the stock searcher route
router.get('/', getStockSearcher);
router.post('/', postStockSearcher);

//this route adds a stock to a user
router.post('/add-stock', postAddUserStock);

//this route removes a stock from the user
router.post('/remove-stock', postDeleteUserStock);

//this route gets the trending page
router.get('/trending-page', getTrendingPagee);

//this route is to grab stock data like the company information
router.get('/stock-data/:stockTicker', getIndividualStockViewer);

//this route is in order to grab the stock chart
router.get('/stock-chart/:stockTicker', getIndividualStockChart);

//this route gets the stock summmary 
router.get('/stock-basic-data/:stockTicker', getBasicStockInformation)





export default router;