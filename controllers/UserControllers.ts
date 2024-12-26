import { Request, Response } from "express";
import Message, {IMessage} from "../models/messageSchema";
import Account from "../models/accountSchema";
import Fuse from "fuse.js";
import { runStockWorker } from "./StockControllersProd";
import ProfileImage from "../models/imageSchema";
import mongoose from "mongoose";
import { NotifyerHandlerService } from "../StockDailyNotifyer/NotifyerHandlerService";
import { NotifyerServiceHandlerFactory } from "../StockDailyNotifyer/NotifyerServiceHandlerFactory";

const notifyerHandlerService: NotifyerHandlerService = NotifyerServiceHandlerFactory.getNotifyerService('SNS');

export const getUserEditProfilePage = async (req: Request, res: Response) => {
    if (req.params.userId !== req.session.currAccount?.toString()) {
        console.log('nobody')
        res.status(422).send({'status': 422, 'msg': "Error", 'success': false, 'changed-profile': false})
        return;
    }
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
    res.status(200).send({'currAccount': currAccount, isAuthenticated: req.session.loggedIn? true : false, 'currUser': req.session.currAccount ? req.session.currAccount : "", 'profilePicture': profileImageBase64})
    return;
}
export const postEditProfilePage = async (req: Request, res:Response) => {
    console.log('sfsdfsdfsdfsdfsdfsdfsdf')
    console.log(req.body)
    console.log(req.params.userId)
    console.log(req.session.currAccount)
    console.log(req.session.loggedIn)
    if (req.params.userId !== req.session.currAccount) {
        console.log('not equal')
        res.status(422).send({'msg': "Error", 'success': false, 'changed-profile': false})
        return;
    }
    let currAccount = await Account.findById(req.params.userId);
    let changedProfile = false;
    if (!currAccount) {
        console.log('no account')
        res.status(404).send({'status': 404, 'msg': 'This isnt the user your looking for'});
        return;
    }
    console.log('working')
    if (req.file) {
        try {
            const accountImage = new ProfileImage({
                _id: new mongoose.Types.ObjectId(),
                imageType: req.file.mimetype,
                imageData: req.file.buffer,
            });
            await accountImage.save();
            console.log("Image saved successfully:", accountImage);
            currAccount.ProfileImage = accountImage._id;
            changedProfile = true;
        } catch (error) {
            console.error("Error saving profile image:", error);
        }
    }
    if (req.body.birthday !== "" || currAccount.Birthday !== req.body.birthday) {
        currAccount.Birthday = req.body.birthday;
        changedProfile = true;
    } 
    if (req.body.profileDescription !== "" || currAccount.ProfileDesc !== req.body.profileDescription) {
        currAccount.ProfileDesc = req.body.profileDescription;
        changedProfile = true;
    }
    if (req.body.username !== "" || currAccount.Username !== req.body.username) {
        currAccount.Username = req.body.username;
        changedProfile = true;
    }
    console.log('reached here ')
    const recieveStockNews: boolean = req.body.notifyStockNews === 'false' ? false: true;
    console.log(recieveStockNews)
    console.log(currAccount.RecieveStockNewsNotifications)
    console.log((!req.body.notifyStockNews && currAccount.RecieveStockNewsNotifications))
    if ((recieveStockNews && !currAccount.RecieveStockNewsNotifications) || (!recieveStockNews && currAccount.RecieveStockNewsNotifications)) {
        currAccount.RecieveStockNewsNotifications = req.body.notifyStockNews;
        let accountStockArray: string[] = [];
        for(const [ticker, data] of currAccount.FollowedStocks){
            accountStockArray.push(ticker.toString());
        }
        console.log(accountStockArray)
        if (accountStockArray.length > 0) {
            recieveStockNews ? notifyerHandlerService.subscribeStocks(accountStockArray, 'email', currAccount.Email.toString()) : notifyerHandlerService.unsubscribeStocks(accountStockArray, currAccount.Email.toString());
        }

    }
    
    currAccount.RecieveResponseNotifications = req.body.notifyPublicForumResponse;
    currAccount.RecieveLikedNotifications = req.body.notifyPublicForumLikes;
    currAccount.save();
    res.status(200).send({'success': true, 'changed-profile': false})
    return;
}
/**
 * this method is responsible for getting all the stocks for a user. It calls the runStockWorker in the stock controller
 * @param req 
 * @param res 
 */
export const getAllStocks = async(userStock: Map<String, String>): Promise<any> => {
    let counter = 0;
    const taskList: any[] = [];
    for(const [ticker, data] of userStock){
        counter += 1;
        console.log('thing')
        console.log(ticker)
        taskList.push({id: counter, data: {API: "YahooBasicInfo", 'Data': ticker, 'ExecutorType': 'IndividualStockPageData'}})
    }
    return await Promise.all(taskList.map(task => runStockWorker(task))) 
}
/**
 * this method is responsible for getting the user information based off of the passed in user id. Such as there followed stocks
 * username, profile description, profile picture, birthday, ect
 * @param req 
 * @param res 
 * @returns 
 */
export const GetUserProfile = async (req: Request, res: Response) => {
    console.log("Received userId:", req.params.userId); 
    let currAccount = await Account.findById(req.params.userId);
    console.log(currAccount)
    if (!currAccount) {
        res.status(404).send({'status': 404, 'msg': 'This isnt the user your looking for'});
        return;
    }
    let currProfilePic = await ProfileImage.findById(currAccount.ProfileImage);
    let profileImageBase64 = "";
    if (!currProfilePic) {
        currProfilePic = null;
    } else {
        //have to cast it to base 64 to be read
        profileImageBase64 = `data:${currProfilePic.imageType};base64,${currProfilePic.imageData.toString("base64")}`;
    }

    console.log(req.session.loggedIn)
    const userStocks: any = await getAllStocks(currAccount.FollowedStocks);
    console.log(userStocks);
    res.status(200).send({'profilePicture': profileImageBase64, 'currViewedUser': currAccount, 'userStocks': userStocks, isAuthenticated: req.session.loggedIn? true : false, 'currUser': req.session.currAccount ? req.session.currAccount : ''});
    return;
}
/**
 * Alters a users profile description
 * @param req nneds a session with Account Id
 * @param res sends http code 200 upon success
 */
export const patchProfileDesc = async (req: Request, res: Response) => {
    let account = await Account.findById(req.session.AccountID).exec();
    if(account == null){
        res.status(400).send("User does not exist!");
        return;
    }
    else{
        account.alterProfileDesc(req.body.profileDesc);
        account.save();
        res.status(200);
        return;
    }
}
/**
 * Gets all of an account's messages
 * @param req
 * @param res
 */
export const getMessages = async (req: Request, res: Response)=> {
    const currAccount = await Account.findById(req.session.currAccount).lean().exec();
    let profileImageBase64 = "";
    if(currAccount) {
        let currProfilePic = await ProfileImage.findById(currAccount.ProfileImage);
        if (!currProfilePic) {
            currProfilePic = null;
        } else {
            profileImageBase64 = `data:${currProfilePic.imageType};base64,${currProfilePic.imageData.toString("base64")}`;
        }
    }
    let account = await Account.findById(req.params.userId).lean().exec();
    if(account == null){
        res.status(400).json({'error': "Account does not exist!",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: profileImageBase64});
        return;
    }
    let messages = await Message.find({Account: account._id}).lean().exec();
    let messageObjs = [];
    for (let message of messages) {
        messageObjs.push(message);
    }
    res.status(200).json({'messages': messageObjs,'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: profileImageBase64});
}
/**
 * Changes the Account's notification settings.
 * @param req should have parameters for notification settings, receiveSMS and receiveEmail for how to receive notifications,
 * (true to receive notifications that way),
 * and receiveLiked and receiveReplied for what notifications to receive,
 * (true to receive that kind of notification).
 * @param res sends http code 200 if successful, 500 if failed due to a server error.
 */
export const patchNotifications = async (req: Request, res: Response) => {
    if(!req.session.loggedIn || !req.session.currAccount){
        res.status(401).json({'error':"Invalid Credentials",'isAuthenticated': false,'currUser': req.session.currAccount, profilePicture: ""});
        return;
    }
    const currAccount = await Account.findById(req.session.currAccount).exec();
    let profileImageBase64 = "";
    if(currAccount) {
        let currProfilePic = await ProfileImage.findById(currAccount.ProfileImage);
        if (!currProfilePic) {
            currProfilePic = null;
        } else {
            profileImageBase64 = `data:${currProfilePic.imageType};base64,${currProfilePic.imageData.toString("base64")}`;
        }
    }
    else{
        res.status(404).json({'error':"Account not found",'isAuthenticated':false,'currUser': req.session.currAccount, profilePicture: profileImageBase64});
        return;
    }
    try {
        if ("receiveSMS" in req.body) {
            if (req.body.receiveSMS as boolean) {
                await currAccount.yesSMS();
            } else {
                await currAccount.noSMS();
            }
        }
        if ("receiveEmail" in req.body) {
            if (req.body.receeiveEmail as boolean) {
                await currAccount.yesEmail();
            } else {
                await currAccount.noEmail();
            }
        }
        if ("receiveLiked" in req.body) {
            if (req.body.receiveLiked as boolean) {
                await currAccount.yesLikedNotifications();
            } else {
                await currAccount.noLikedNotifications();
            }
        }
        if ("receiveReplied" in req.body) {
            if (req.body.receiveReplied as boolean) {
                await currAccount.yesResponseNotifications();
            } else {
                await currAccount.noResponseNotifications();
            }
        }
        res.status(200).json({'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount, profilePicture: profileImageBase64});
    }catch(err){
        console.error(err);
        res.status(500).json({'error': "Server failed to change notifications",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount, profilePicture: profileImageBase64});
    }
}
/**
 * Searches through the Accounts past messages (specified through userId path param)
 * for messages similar to text body param.
 * @param req should contain parameter named text in the body.
 * The body may also include another parameter called sortBy, which should be one of Likes, Dislikes, or Date_Created.
 * @param res sends a list of matches with http code 200
 */
export const getMessageSearch = async (req: Request, res: Response) => {
    const currAccount = await Account.findById(req.session.currAccount).exec();
    let profileImageBase64 = "";
    if(currAccount) {
        let currProfilePic = await ProfileImage.findById(currAccount.ProfileImage);
        if (!currProfilePic) {
            currProfilePic = null;
        } else {
            profileImageBase64 = `data:${currProfilePic.imageType};base64,${currProfilePic.imageData.toString("base64")}`;
        }
    }
    else{
        res.status(404).json({'error':"Account not found",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount, profilePicture: profileImageBase64});
        return;
    }
    const messages = await Message.find({Account: req.params.userId}).lean().exec();
    let sortBy = 'default';
    if(req.body.sortBy as string == 'Date_Created' || req.body.sortBy as string == 'Likes' || req.body.sortBy as string == 'Dislikes'){
         sortBy = req.body.sortBy;
    }
    const searcher = new Fuse(messages,{keys: ["Text"],sortFn: (a,b)=> {
            if(a.score && b.score){
                a.item
                if(a.score == b.score){
                    switch (sortBy){
                        case "Date_Created":
                            let aTime = new Date(a.item.Date_Created.toString()).getTime();
                            let bTime = new Date(b.item.Date_Created.toString()).getTime();
                            return bTime - aTime;
                        case "Likes":
                            let aLikes = +a.item.Likes.toString();
                            let bLikes = +b.item.Likes.toString();
                            return aLikes - bLikes;
                        case "Dislikes":
                            let aDislikes = +a.item.Dislikes.toString();
                            let bDislikes = +b.item.Dislikes.toString();
                            return aDislikes - bDislikes;
                    }
                }
                else{
                    return a.score - b.score;
                }
            }
            else{
                return 0;
            }
            return 0;
    }
    });
    let results = searcher.search(req.params.text);
    let matches = [];
    for (const result of results) {
        matches.push(result.item);
    }
    res.status(200).json({'matches': matches,'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount, profilePicture: profileImageBase64});
}