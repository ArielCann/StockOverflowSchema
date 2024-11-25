import { Request, Response } from "express";
import Message from "../models/messageSchema";
import Account from "../models/accountSchema";

exports.patchProfile = async (req: Request, res: Response) => {
    let user = await Account.findById(req.session.AccountID).exec();
    if(user == null){
        res.status(400).send("User does not exist!");
        return;
    }
    else{
        user.alterProfileDesc(req.body.profileDesc);
        user.save();
        res.status(200).send("Profile updated!");
        return;
    }
}
exports.postSignup = async (req: Request, res: Response) => {
    let account = new Account({Username: req.body.username, password: req.body.password, Email: req.body.email});
    await account.save().catch((err) => {
        if(err.code === 11000) {
            console.log(err.message);
            res.status(400).json("User with this information already exists!");
            return;
        }
        else{
            console.error(err.message);
            res.status(400).json("Could not create Account with this information.");
            return;
        }
    });
    res.status(201).json(account.toJSON());
}
exports.getMessages = async (req: Request, res: Response)=> {
    let account = await Account.findById(req.session.AccountID).exec();
    let messages = await Message.find({Account: account?._id}).exec();
    let messageObjs = [];
    for (let message of messages) {
        messageObjs.push(message.toJSON());
    }
    res.status(200).json({messages: messageObjs});
}
exports.setNotifications = async (req: Request, res: Response) => {
    let account = await Account.findById(req.session.AccountID).exec();
    try {
        if ("receiveSMS" in req.body) {
            if (req.body.receiveSMS as boolean) {
                account?.yesSMS();
            } else {
                account?.noSMS();
            }
        }
        if ("receiveEmail" in req.body) {
            if (req.body.receeiveEmail as boolean) {
                account?.yesEmail();
            } else {
                account?.noEmail();
            }
        }
        if ("receiveLiked" in req.body) {
            if (req.body.receiveLiked as boolean) {
                account?.yesLikedNotifications();
            } else {
                account?.noLikedNotifications();
            }
        }
        if ("receiveReplied" in req.body) {
            if (req.body.receiveReplied as boolean) {
                account?.yesResponseNotifications();
            } else {
                account?.noResponseNotifications();
            }
        }
        res.status(200);
    }catch(err){
        console.error(err);
        res.status(500).json("Server failed to create account");
    }
}