import express, {Request, Response} from 'express';
import Account from '../models/accountSchema';
import ProfileImage from '../models/imageSchema';

export class GeneralController {

    public async GetHome(req: Request, res: Response): Promise<void> {
        console.log('home')
        console.log(req.session.loggedIn)
        res.status(200).send({'path': "home", 'isAuthenticated': req.session.loggedIn ? true : false, 'currUser': req.session.currAccount ? req.session.currAccount : "", 'profilePicture': res.locals.profilePicture})
    }
}