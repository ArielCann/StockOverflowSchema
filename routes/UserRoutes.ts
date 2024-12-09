import express from 'express';
import { ExpressValidator } from 'express-validator';

import {} from '../controllers/AuthControllers';
import {getMessages, getMessageSearch, getUserEditProfilePage, GetUserProfile, patchNotifications, patchProfileDesc, postEditProfilePage} from "../controllers/UserControllers";
//import {} from '../middleware/IsUser';

const router = express.Router();
router.get('/:userId/messages',getMessages);
router.get('/:userId/messageSearch',getMessageSearch)
router.patch('/:userId/profileDesc',patchProfileDesc);
router.patch('/:userId/notifications',patchNotifications);

router.get('/:userId/profile', GetUserProfile)
//these routes are for operations of the edit profile page
router.get('/:userId/edit-profile', getUserEditProfilePage);
router.post('/:userId/edit-profile', postEditProfilePage);
export default router;