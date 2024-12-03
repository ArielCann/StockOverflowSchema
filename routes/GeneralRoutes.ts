import express from 'express';
import { GeneralController } from '../controllers/GeneralController';

const router = express.Router();
const generalController = new GeneralController();
//login routes
router.get('/', generalController.GetHome);


export default router;