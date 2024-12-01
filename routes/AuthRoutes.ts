import express from 'express';
import { ExpressValidator, check, body } from 'express-validator';
import Account from '../models/accountSchema';
import { GetChangePassword, PostChangePassword, PostLogin, PostSignup } from '../controllers/AuthControllers';
//const AuthController = require('../controllers/AuthControllers');
//const isUserMiddleware = require('../middleware/IsUser');

const router = express.Router();

//login routes

router.post('/login', PostLogin);

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
, PostSignup)

//password reset
router.post('/change-password', GetChangePassword);
router.post('/password-reset', PostChangePassword);

export default router;

function err(reason: any): PromiseLike<never> {
    throw new Error('Function not implemented.');
}
