import express from 'express';
import { ExpressValidator } from 'express-validator';
import multer, {StorageEngine, Multer} from 'multer';
import {} from '../controllers/AuthControllers';
import {getMessages, getMessageSearch, getUserEditProfilePage, GetUserProfile, patchNotifications, patchProfileDesc, postEditProfilePage} from "../controllers/UserControllers";
//import {} from '../middleware/IsUser';
const storage: StorageEngine = multer.memoryStorage(); // Store file in memory
const upload: Multer = multer({ storage });

const router = express.Router();
router.get('/:userId/messages',getMessages);
router.get('/:userId/messageSearch',getMessageSearch)
router.patch('/:userId/profileDesc',patchProfileDesc);
router.patch('/:userId/notifications',patchNotifications);

router.get('/:userId/profile', GetUserProfile)
//these routes are for operations of the edit profile page
router.get('/:userId/edit-profile', getUserEditProfilePage);
//researched and found to hadle images in backend, best to use multer package o be used as temp storage in the request obj to be able to get the picture data
router.post('/:userId/edit-profile', upload.single("profilePicture"), postEditProfilePage);
export default router;