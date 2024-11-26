import express from 'express';
import { ExpressValidator } from 'express-validator';

import {} from '../controllers/AuthControllers';
import {getMessages, getMessageSearch, patchNotifications, patchProfileDesc} from "../controllers/UserControllers";
//import {} from '../middleware/IsUser';

const router = express.Router();
router.get('/messages',getMessages);
router.get('/messageSearch',getMessageSearch)
router.patch('/profileDesc',patchProfileDesc);
router.patch('/notifications',patchNotifications);
export default router;