import mongoose from "mongoose";
import {Request, Response} from "express";
import Message from "../models/messageSchema";
import Account from "../models/accountSchema";
import Fuse from "fuse.js";
import ProfileImage from "../models/imageSchema";

export const getQuestionSearch = async (req: Request, res: Response) => {
    const currAccount = await Account.findOne({AccountID: req.session.currAccount}).exec();
    let profileImageBase64 = "";
    if(currAccount) {
        let currProfilePic = await ProfileImage.findById(currAccount.ProfileImage);
        if (!currProfilePic) {
            currProfilePic = null;
        } else {
            profileImageBase64 = `data:${currProfilePic.imageType};base64,${currProfilePic.imageData.toString("base64")}`;
        }
    }
    const questions = await Message.find({IsQuestion: true}).exec();
    const searcher = new Fuse(questions,{keys: ["text"]});
    let results = searcher.search(req.body.Text);
    let matches = [];
    for (const result of results) {
        matches.push(result.item.toJSON());
    }
    res.status(200).json({'matches': matches,'isAuthenticated': req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: profileImageBase64});
}
export const getMessage = async(req: Request, res: Response) => {
    const currAccount = await Account.findOne({AccountID: req.session.currAccount}).exec();
    let profileImageBase64 = "";
    if(currAccount) {
        let currProfilePic = await ProfileImage.findById(currAccount.ProfileImage);
        if (!currProfilePic) {
            currProfilePic = null;
        } else {
            profileImageBase64 = `data:${currProfilePic.imageType};base64,${currProfilePic.imageData.toString("base64")}`;
        }
    }
    const message = await Message.findById(req.params.MessageID).lean().exec();
    if(message == null){
        res.status(404).json({'error': "Message could not be found",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: profileImageBase64});
        return;
    }
    const account = await Account.findById(message.Account);
    let username = account?.Username;
    res.status(200).json({'message': message,'username': username,'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: profileImageBase64});
}
/**
 * Creates a new Question with the specified text. Session must have current AccountId and be logged in
 * @param req body should have text
 * @param res will send a 401 if not logged in, 404 if the Account Id couldn't be resolved.
 */
export const postQuestion = async (req: Request, res: Response) => {
    if(!req.session.loggedIn || !req.session.currAccount){
        res.status(401).json({'error':"Invalid Credentials",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount, profilePicture: ""});
        return;
    }
    const currAccount = await Account.findOne({AccountID: req.session.currAccount}).exec();
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
        res.status(401).json({'error':"Invalid Credentials",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount, profilePicture: profileImageBase64});
        return;
    }

    const text = req.body.text;
    const msg = new Message({
        text: text,
        Account: currAccount._id,
        IsQuestion: true,
        Date_Created: new Date(),
        RepliedTo: null,
        Replies: [],
        Likes: 0,
        Dislikes: 0
    });
    msg.save();
    res.status(201).json({'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: profileImageBase64});
}
/**
 *  Session should have AccountID as currAccount.
 * @param req body should have the following properties.
 *     @param QuestionID the ObjectID of the Question being responded to
 *     @param text the text of the message
 * @param res will send http error 404 code if either the Account or Question couldn't be found.
 */
export const postResponse = async (req: Request, res: Response) => {
    if(!req.session.loggedIn || !req.session.currAccount){
        res.status(401).json({'error':"Invalid Credentials",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: ""});
        return;
    }
    const currAccount = await Account.findOne({AccountID: req.session.currAccount}).exec();
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
        res.status(401).json({'error':"Invalid Credentials",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount, profilePicture: profileImageBase64});
        return;
    }
    const question = await Message.findById(req.body.QuestionID).exec();
    if (question == null) {
        res.status(404).json({'error': "Question could not be found.",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: profileImageBase64});
        return;
    }
    const msg = new Message({
        text: req.body.text,
        Account: currAccount._id,
        IsQuestion: false,
        Date_Created: new Date(),
        RepliedTo: question._id,
        Replies: [],
        Likes: 0,
        Dislikes: 0
    });
    question.addReply(msg._id);
    msg.save();
}
export const postComment = async (req: Request, res: Response) => {
    if(!req.session.loggedIn || !req.session.currAccount){
        res.status(401).json({'error': "Invalid Credentials",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: ""});
        return;
    }
    const currAccount = await Account.findOne({AccountID: req.session.currAccount}).exec();
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
        res.status(401).json({'error':"Invalid Credentials",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount, profilePicture: profileImageBase64});
        return;
    }
    const text = req.body.text;
    const response = await Message.findById(req.body.ResponseID).exec();
    if (response == null) {
        res.status(404).json({'error': "Question could not be found",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: profileImageBase64});
        return;
    }
    const msg = new Message({
        text: text,
        Account: currAccount._id,
        IsQuestion: false,
        Date_Created: new Date(),
        RepliedTo: response._id,
        Replies: [],
        Likes: 0,
        Dislikes: 0
    });
    response.addReply(msg._id);
    res.status(201).json({'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: profileImageBase64});
    msg.save();
}
/**
 * Gets all the responses to a Question whose Id is a path parameter, as well as comments on those responses
 * @param req
 * @param res sends http code 404 if the Question could not be found,
 * 422 if the supplied Id is not a Question,
 * or if susccessful, code 200 with a Map where the keys are response objects and the keys are comment obejcts.
 */
export const getQuestionPage = async (req: Request, res: Response) => {
    const currAccount = await Account.findOne({AccountID: req.session.currAccount}).exec();
    let profileImageBase64 = "";
    if(currAccount) {
        let currProfilePic = await ProfileImage.findById(currAccount.ProfileImage);
        if (!currProfilePic) {
            currProfilePic = null;
        } else {
            profileImageBase64 = `data:${currProfilePic.imageType};base64,${currProfilePic.imageData.toString("base64")}`;
        }
    }
    const question = await Message.findById(req.params.QuestionID).exec();
    if(question == null) {
        res.status(404).json({'error': "Question could not be found",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: profileImageBase64});
        return;
    }
    if(!question.IsQuestion){
        res.status(422).json({'error': "Message was found, but is not a forum Question.",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: profileImageBase64});
        return;
    }
    let responses = [];
    for (const reply of question.Replies) {
        let response = await Message.findById(reply).lean().exec();
        let id = response?._id;
        let username = (await Account.findById(id).lean().exec())?.Username;
        let comments = await Message.find({_id: {$in: response?.Replies}}).lean().exec();
        let comment_users = []
        for (let i = 0; i < comments.length; i++) {
            let commenter = (await Account.findById(comments[i].Account).lean().exec())?.Username;
            comment_users.push({Username: commenter,Message: comments[i]});
        }
        responses?.push({Username: username,Response: response,Comments: comment_users});
    }
    res.status(200).json({'responses': responses,'isAuthenticated': req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: profileImageBase64});
}
export const getResponseComments = async (req: Request, res: Response) => {
    const currAccount = await Account.findOne({AccountID: req.session.currAccount}).exec();
    let profileImageBase64 = "";
    if(currAccount) {
        let currProfilePic = await ProfileImage.findById(currAccount.ProfileImage);
        if (!currProfilePic) {
            currProfilePic = null;
        } else {
            profileImageBase64 = `data:${currProfilePic.imageType};base64,${currProfilePic.imageData.toString("base64")}`;
        }
    }
    const response = await Message.findById(req.params.ResponseID).exec();
    if(response == null){
        res.status(404).json({'error': "Response could not be found.",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: profileImageBase64});
        return;
    }
    if(response?.IsQuestion){
        res.status(422).json({'error': "Message was found, but a Question, not a response.",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: profileImageBase64});
        return;
    }
    let comments = [];
    for (const comment of response.Replies) {
        comments.push((await Message.findById(comment).exec())?.toJSON());
    }
    res.status(200).json({'comments': comments,'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: profileImageBase64});
}
/**
 * Likes a message whose Id should be a path parameter
 * @param req needs to have a session with an AccountID
 * @param res will send http code 200 upon completion
 */
export const patchLikeMessage = async(req: Request, res: Response) => {
    if(!req.session.loggedIn || !req.session.currAccount){
        res.status(401).json({'error': "Invalid Credentials",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: ""});
        return;
    }
    const currAccount = await Account.findOne({AccountID: req.session.currAccount}).exec();
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
        res.status(401).json({'error':"Invalid Credentials",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount, profilePicture: profileImageBase64});
        return;
    }
    let account = await Account.findById(req.session.currAccount).exec();
    account?.likeMessage(new mongoose.Types.ObjectId(req.params.MessageID));
    res.status(200).json({'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture:profileImageBase64});
}
/**
 * Dislikes a message whose Id is a path parameter.
 * @param req needs to have a session with an AccountId
 * @param res will send http code 200 upon completion
 */
export const patchDislikeMessage = async(req: Request, res: Response) => {
    if(!req.session.loggedIn || !req.session.currAccount){
        res.status(401).json({'error': "Invalid Credentials",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: ""});
        return;
    }
    const currAccount = await Account.findOne({AccountID: req.session.currAccount}).exec();
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
        res.status(401).json({'error':"Invalid Credentials",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount, profilePicture: profileImageBase64});
        return;
    }
    currAccount.dislikeMessage(new mongoose.Types.ObjectId(req.params.MessageID));
    res.status(200).json({'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture:profileImageBase64});
}
/**
 * Sets the Account to no longer like or dislike a message whose Id is a path parameter
 * @param req needs to have a session with an AccountID
 * @param res will send http code 200 upon completion
 */
export const patchClearLike = async(req: Request, res: Response) => {
    if(!req.session.loggedIn || !req.session.currAccount){
        res.status(401).json({'error': "Invalid Credentials",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: ""});
        return;
    }
    const currAccount = await Account.findOne({AccountID: req.session.currAccount}).exec();
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
        res.status(401).json({'error':"Invalid Credentials",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount, profilePicture: profileImageBase64});
        return;
    }
    currAccount.removeMessage(new mongoose.Types.ObjectId(req.params.MessageID));
    res.status(200).json({'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture:profileImageBase64});
}
/**
 *
 * @param req needs to have a session with an AccountID
 * @param res sends http code 200 and a map of message Ids (as strings)
 *      to booleans that the user has either liked or disliked, true for liked, false for disliked.
 */
export const getLikedDislikedMessages = async (req: Request, res: Response) => {
    const currAccount = await Account.findOne({AccountID: req.session.currAccount}).exec();
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
    res.status(200).json({'likeDislike': currAccount.LikedDislikedMessages,'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount, profilePicture: profileImageBase64});
}