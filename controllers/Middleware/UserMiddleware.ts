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
    let currAccount = await Account.findById(req.params.userId);
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