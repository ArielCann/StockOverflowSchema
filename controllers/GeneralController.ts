import express, {Request, Response} from 'express';
import Account from '../models/accountSchema';
import ProfileImage from '../models/imageSchema';

export class GeneralController {

    public async GetHome(req: Request, res: Response): Promise<void> {
        console.log('home')
        console.log(req.session.loggedIn)
        let currAccount = await Account.findById(req.session.currAccount);
        let profileImageBase64 = null;
        if (currAccount) {
            console.log('found curr user')
            let currProfilePic = await ProfileImage.findById(currAccount.ProfileImage);
            if (!currProfilePic) {
                currProfilePic = null;
            } else {
                console.log('now getting pic info')
                //have to cast it to base 64 to be read
                profileImageBase64 = `data:${currProfilePic.imageType};base64,${currProfilePic.imageData.toString("base64")}`;
            }
        }
        res.status(200).send({'data': "home", 'isAuthenticated': req.session.loggedIn ? true : false, 'currUser': req.session.currAccount ? req.session.currAccount : "", 'profilePicture': profileImageBase64})
    }
}