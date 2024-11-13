import express from 'express';
import { ExpressValidator } from 'express-validator';

const AuthController = require('../controllers/AuthControllers');
const isUserMiddleware = require('../middleware/IsUser');

const router = express.Router();



export default router;