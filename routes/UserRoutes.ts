import express from 'express';
import { ExpressValidator } from 'express-validator';

const AuthController = require('../controllers/AuthControllers');
const isUserMiddleware = require('../middleware/IsUser');

const router = express.Router();
router.get('/information/messages');
router.post('/information/signup');
router.patch('/information/profile');
router.patch('/information/notifications');
export default router;