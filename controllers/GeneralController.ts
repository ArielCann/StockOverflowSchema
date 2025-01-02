import express, {Request, Response} from 'express';
import { MongodbManager } from '../DatabaseController/MongodbManager';

export class GeneralController {

    public async GetHome(req: Request, res: Response): Promise<void> {
        console.log('home')
        console.log(req.session.loggedIn);
        let mongodbManager: MongodbManager = MongodbManager.getMongodbManager({publicKey: process.env.DB_PUBLIC_KEY || '',
            privateKey: process.env.DB_PRIVATE_KEY || '',
            groupId: process.env.GROUP_ID || '',
            clusterName: process.env.CLUSTER_NAME || ''});
        const status: string = await mongodbManager.getDbStatus()
        res.status(200).send({'path': "home", 'isAuthenticated': req.session.loggedIn ? true : false, 'currUser': req.session.currAccount ? req.session.currAccount : "", 'profilePicture': res.locals.profilePicture, 'dbStatus': status})
    }
}