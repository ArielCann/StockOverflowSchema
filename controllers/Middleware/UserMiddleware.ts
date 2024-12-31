import { Request, Response, NextFunction } from "express";
import Account from "../../models/accountSchema";
import ProfileImage from "../../models/imageSchema";
/**
 * this middleware is responsible for getting the user information, most notibly the user proile picture 
 * @param req 
 * @param res 
 * @param next 
 */
export const getAccountInfo = async (req: Request<any>, res: Response, next: NextFunction) => {
    let currAccount = await Account.findById(req.session.currAccount);
    let profileImageBase64 = "";
    if (currAccount) {
        let currProfilePic = await ProfileImage.findById(currAccount.ProfileImage);
        if (!currProfilePic) {
            currProfilePic = null;
        } else {
            //have to cast it to base 64 to be read
            profileImageBase64 = `data:${currProfilePic.imageType};base64,${currProfilePic.imageData.toString("base64")}`;
        }
    }
    res.locals.currAccount = currAccount;
    res.locals.profilePicture = profileImageBase64;
    next();
}
/**
 * this method is responsible for checking if the current acount id in the sessionis equal to the account id that the current user is viewing.
 * this makes sure that the current user, who is viewing the accoun that is not his will not be able to edit that account
 */
export const checkIfAccountsAreEqual = async(req: Request<any>, res: Response, next: NextFunction) => {
    if (req.params.userId !== req.session.currAccount?.toString()) {
        console.log('not equal')
        res.status(422).send({'msg': "Error", 'success': false, 'changed-profile': false})
        return;
    }
    next();
}
/**
 * this middleware is responsible to check if a current account exists or not by checking the userid in the SESSION to the mongo db database
 */
export const checkIfAccountExists = async(req: Request, res: Response, next: NextFunction) => {
    const currAccount = await Account.findById(req.session.currAccount).exec();
    if(!currAccount) {
        res.status(404).json({'error':"Account not found",'isAuthenticated':false,'currUser': req.session.currAccount, profilePicture: res.locals.profilePicture});
        return;
    }
    res.locals.currAccount = currAccount;
    next();
}