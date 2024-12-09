import { Request, Response } from "express";
import Message from "../models/messageSchema";
import Account from "../models/accountSchema";
import Fuse from "fuse.js";
import { runStockWorker } from "./StockControllersProd";



export const getUserEditProfilePage = async (req: Request, res: Response) => {
    if (req.params.userId !== req.session.currAccount?.toString()) {
        console.log('nobody')
        res.status(422).send({'status': 422, 'msg': "Error", 'success': false, 'changed-profile': false})
        return;
    }
    let currAccount = await Account.findById(req.params.userId);
    res.status(200).send({'currAccount': currAccount, isAuthenticated: req.session.loggedIn? true : false, 'currUser': req.session.currAccount ? req.session.currAccount : 'None'})
    return;
}
export const postEditProfilePage = async (req: Request, res:Response) => {
    console.log(req.body);
    if (req.params.userId !== req.session.currAccount?.toString()) {
        res.status(422).send({'msg': "Error", 'success': false, 'changed-profile': false})
        return;
    }
    let currAccount = await Account.findById(req.params.userId);
    let changedProfile = false;
    if (!currAccount) {
        res.status(404).send({'status': 404, 'msg': 'This isnt the user your looking for'});
        return;
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
    currAccount.RecieveStockNewsNotifications = req.body.notifyStockNews;
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
    userStock.forEach((ticker: any) => {
        counter += 1;
        taskList.push({id: counter, data: {API: "YahooBasicInfo", 'Data': ticker}})
    })
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
    const userStocks: any = await getAllStocks(currAccount.FollowedStocks);
    console.log(userStocks);
    res.status(200).send({'currViewedUser': currAccount, 'userStocks': userStocks, isAuthenticated: req.session.loggedIn? true : false, 'currUser': req.session.currAccount ? req.session.currAccount : 'None'});
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
    let account = await Account.findById(req.session.AccountID).exec();
    if(account == null){
        res.status(400).send("Account does not exist!");
        return;
    }
    let messages = await Message.find({Account: account._id}).exec();
    let messageObjs = [];
    for (let message of messages) {
        messageObjs.push(message.toJSON());
    }
    res.status(200).json({messages: messageObjs});
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
    let account = await Account.findById(req.session.AccountID).exec();
    if(account == null){
        res.status(400).send("Account does not exist!");
        return;
    }
    try {
        if ("receiveSMS" in req.body) {
            if (req.body.receiveSMS as boolean) {
                account.yesSMS();
            } else {
                account.noSMS();
            }
        }
        if ("receiveEmail" in req.body) {
            if (req.body.receeiveEmail as boolean) {
                account.yesEmail();
            } else {
                account.noEmail();
            }
        }
        if ("receiveLiked" in req.body) {
            if (req.body.receiveLiked as boolean) {
                account.yesLikedNotifications();
            } else {
                account.noLikedNotifications();
            }
        }
        if ("receiveReplied" in req.body) {
            if (req.body.receiveReplied as boolean) {
                account.yesResponseNotifications();
            } else {
                account.noResponseNotifications();
            }
        }
        res.status(200);
    }catch(err){
        console.error(err);
        res.status(500).json("Server failed to change notifications");
    }
}
/**
 * Searches through the Accounts past messages
 * @param req body should have a parameter called 'text'
 * @param res sends a list of matches with http code 200
 */
export const getMessageSearch = async (req: Request, res: Response) => {
    const messages = await Message.find({Account: req.session.AccountID}).exec();
    const searcher = new Fuse(messages,{keys: ["text"]});
    let results = searcher.search(req.body.Text);
    let matches = [];
    for (const result of results) {
        matches.push(result.item.toJSON());
    }
    res.status(200).json(matches);
}