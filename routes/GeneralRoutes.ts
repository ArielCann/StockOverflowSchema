import express from 'express';
import { GeneralController } from '../controllers/GeneralController';
import { getAccountInfo } from '../controllers/Middleware/UserMiddleware';

const router = express.Router();
const generalController = new GeneralController();
//login routes
router.get('/', getAccountInfo, generalController.GetHome);


export default router;