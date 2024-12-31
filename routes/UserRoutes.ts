import express from 'express';
import multer, {StorageEngine, Multer} from 'multer';
import {} from '../controllers/AuthControllers';
import {getMessages, getMessageSearch, getUserEditProfilePage, GetUserProfile, patchNotifications, patchProfileDesc, postEditProfilePage} from "../controllers/UserControllers";
import { checkIfAccountExists, checkIfAccountsAreEqual, getAccountInfo } from '../controllers/Middleware/UserMiddleware';
//import {} from '../middleware/IsUser';
const storage: StorageEngine = multer.memoryStorage(); // Store file in memory
const upload: Multer = multer({ storage });

const router = express.Router();
router.get('/:userId/messages', checkIfAccountExists ,getAccountInfo, getMessages);
router.get('/:userId/messageSearch/:text', getAccountInfo, getMessageSearch)
router.patch('/:userId/profileDesc', checkIfAccountExists ,patchProfileDesc);
router.patch('/:userId/notifications', checkIfAccountsAreEqual, patchNotifications);

router.get('/:userId/profile', getAccountInfo, GetUserProfile)
//these routes are for operations of the edit profile page
router.get('/:userId/edit-profile', checkIfAccountsAreEqual, checkIfAccountExists,  getAccountInfo,  getUserEditProfilePage);
//researched and found to hadle images in backend, best to use multer package o be used as temp storage in the request obj to be able to get the picture data
router.post('/:userId/edit-profile', checkIfAccountsAreEqual, checkIfAccountExists ,upload.single("profilePicture"), postEditProfilePage);
export default router;