import express from 'express';
import { ExpressValidator } from 'express-validator';

const AuthController = require('../controllers/AuthControllers');
const isUserMiddleware = require('../middleware/IsUser');

const router = express.Router();

//login routes
router.get('/login');
router.post('/login');

//signup routes 
router.get('/sign-up');
router.post('/sign-up');

//password reset
router.get('/password-reset');
router.post('/password-reset');

export default router;