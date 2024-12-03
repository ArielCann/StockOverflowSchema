import express from 'express';
import { ExpressValidator, check, body } from 'express-validator';
import Account from '../models/accountSchema';
import { AuthController } from '../controllers/AuthControllers';
import { Notifyer } from '../Notifiers/Subscribers';
import { EmailService } from '../Notifiers/EmailService';
//const AuthController = require('../controllers/AuthControllers');
//const isUserMiddleware = require('../middleware/IsUser');
const emailService: Notifyer = new EmailService();
const router = express.Router();
const authController = new AuthController()

//login routes

router.post('/login', authController.PostLogin);

//signup routes 
router.post('/sign-up', 

    check('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .custom(async (value) => {
            console.log(value)
            const account = await Account.findOne({ Email: value });
            console.log(value)
            if (account) {
                console.log('Email already exists');
                return Promise.reject('Email already exists'); 
            } else {
                console.log('email doesnt exist i guess')
                console.log(account)
            }
        }),

    check('username')
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long')
        .custom(async (value) => {
            const account = await Account.findOne({ Username: value });
            console.log(account)
               if (account) {
                console.log('Username already exists');
                throw new Error('Username already exists'); 
            }
        })
, authController.PostSignup)

//password reset
router.post('/change-password', authController.addObserver(),authController.GetChangePassword);
router.post('/password-reset', authController.PostChangePassword);

router.post('/logout', authController.Logout);

export default router;

function err(reason: any): PromiseLike<never> {
    throw new Error('Function not implemented.');
}
