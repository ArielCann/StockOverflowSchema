import bcrypt from 'bcrypt'; 
import {NextFunction, Request, response, Response} from "express";
import Account from "../models/accountSchema";
import { console } from 'inspector';
import { Notifyer } from '../Notifiers/Subscribers';
import crypto from 'crypto'
import { NotifyerFactory } from '../Notifiers/NotifyerFactory';

export class AuthController {

    private Service: Array<Notifyer>;

    constructor () {
        this.Service = new Array<Notifyer>();
    }
    /**
     * this method is responsible for adding Observers
     * @param Service 
     */
    public addObserver(): (req: Request, res: Response, next: NextFunction) => void {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                const notifyer = NotifyerFactory.GetNotifyers(req.body.service);
                if (!notifyer) {
                    throw new Error('Invalid service provided');
                }
                this.Service = [...this.Service, notifyer];
                next();
            } catch (error) {
                next(error); 
            }
        };
    }
    public notify(email: string, title: string, body: string) {
        this.Service.forEach(service => {
            service.notify(email, title, body)
        })
    }
    async Logout(req: Request, res: Response): Promise<void>  {
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session:", err);
                return res.status(500).send({ msg: "Failed to log out" });
            }
            res.clearCookie("connect.sid", { path: "/" });
            return res.status(200).send({ msg: "Logged out Successfully" });
        });
    }
    /**
     * this function is responsible for changing the passcode. it will check for teh verification code and its eperational date before it saves a new password
     * @param req 
     * @param res 
     * @returns 
     */
    async PostChangePassword(req: Request, res: Response): Promise<void>  {
        const {password, confirmPassword, verificationCode, userId} = req.body;
        const account = await Account.findOne({_id: userId});
        if (!account) {
    
            res.status(404).json({status: 404, msg: "User Not Found" + userId});
            return;
        }
        if (account.verificationNumber !== verificationCode) {
            res.status(422).json({status: 422, msg: "Error: Verification Code Error"});
            return;
        } else {
            const dateNow: Date = new Date(Date.now())
            if (dateNow > account.verificationExpiration) {
                res.status(422).json({status: 422, msg: "Error: Verification Code Expired"});
                return;
            }
            const hashedOutPassword = await bcrypt.hash(password, 12);
            account.Password = hashedOutPassword;
            account.verificationNumber = ""
            account.save()
            res.status(201).json({status: 201, msg: "Success"});
        }
    }
    
    /**
     * this this route is responsible for getting the change password route which gets the email of that account, send a confirmation email to the user with the 
     * verfication 
     * @param req 
     * @param res 
     * @returns 
     */
    async GetChangePassword(req: Request, res: Response): Promise<void> {
        const account = await Account.findOne({Email: req.body.email});
        if (account) {
            const verificationCode = crypto.randomInt(100000, 1000000).toString();
            account.verificationNumber = verificationCode;
            //this is one hour 
            const expiration: Date = new Date(Date.now() + 3600000)
            account.verificationExpiration = expiration;
            account.save()
            this.notify(account.Email as string, "Change Password Verification", `Your verification code is \n ${verificationCode}`)
            res.status(200).json({status: 200, accountId: account._id});
            return;
        } else {
            res.status(422).json({status: 422, msg: "Invalid Email or Password"});
            return;
        }
    }
    /**
     * this route is reposnible for logging a user in. If the account is found and the passwords are = to each other, it will make user sessions to signify that 
     * the user is logged on
     * @param req 
     * @param res 
     * @returns 
     */
    async PostLogin(req: Request, res: Response): Promise<void> {
        console.log('eofre headers')
        const userName: String = req.body.username;
        const password: string = req.body.password;
        console.log(userName)
        const account = await Account.findOne({
            $or: [{ Email: userName }, { Username: userName }],
        });
            if (!account) {
                console.log('No account found');
                res.status(422).json({status: 422, msg: "Invalid Email or Password", isAuthenticated: req.session.loggedIn})
                return;
            }
    
            bcrypt.compare(password, account.Password).then(result => {
                if (!result) {
                    res.status(422).json({status: 422, msg: "Invalid Email or Password", isAuthenticated: req.session.loggedIn});
                    return;
                }
                req.session.loggedIn = true;
                req.session.currAccount = account._id;
                req.session.save(err => {
                    console.error(err)
                })
                res.status(200).send({'data': {msg: "Success", isAuthenticated: req.session.loggedIn}});
                return;
            }).catch (err => {
                console.error(err);
                res.status(500).send({'data': {msg: "Error Creating Account, try again later", isAuthenticated: req.session.loggedIn}});
            })
    }
    /**
     * this method is responsible for doing the database operations to save a new account 
     * @param req 
     * @param res 
     * @returns 
     */
    async PostSignup(req: Request, res: Response): Promise<void> {
        const { username: userName, password, email } = req.body;
        console.log('attempting to get errors')
    
        try {
            const existingAccount = await Account.findOne({$or: [{Username: userName},{Email: email}]})
            console.log(existingAccount)
            if (existingAccount) {
                res.status(422).json({msg: 'Account with that username or Email already Exists', isAuthenticated: false})
                return;
            }
            const hashedPassword = await bcrypt.hash(password, 12);
            console.log('Password hashed successfully');
    
    
            const account = new Account({
                Username: userName,
                Password: hashedPassword,
                Email: email,
                Signup: Date.now()
            });
    
            const result = await account.save();
            if (result) {
                console.log('Account created successfully');
                 res.status(201).json({
                     msg: 'Account created successfully', isAuthenticated: false
                });
                return;
            }
    
            console.log('Failed to create account');
             res.status(422).json({
                data: { msg: 'Error creating account, please try again later', isAuthenticated: false },
            });
            return;
        } catch (err) {
            console.log('Error during account creation:', err);
            res.status(500).json({
                data: { msg: 'Internal server error, please try again later', isAuthenticated: false },
            });
            return;
        }
    };
    
}
