import mongoose from "mongoose";
import {Request, Response} from "express";
import Message, {IMessage} from "../models/messageSchema";
import Account from "../models/accountSchema";
import Fuse, {IFuseOptions} from "fuse.js";
import {NotifyerFactory} from "../Notifiers/NotifyerFactory";
export const getRecentQuestions = async(req: Request, res: Response) => {
    const questions = await Message.find({IsQuestion: true}).sort({Date_Created: -1}).lean().exec();
    let slice = questions.slice(0,Math.min(50,questions.length));
    let matches = [];
    for(const msg of slice){
        let account = await Account.findById(msg.Account).lean().exec();
        matches.push({...msg, Username: account?.Username})
    }
    res.status(200).json({'matches': matches,'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount? req.session.currAccount : "", profilePicture: res.locals.profilePicture});
}
/**
 * Searches for questions on the public forum, using text and (optionally) sortBy path param.
 * @param req
 * @param res
 */
export const getQuestionSearch = async (req: Request, res: Response) => {
    const questions = await Message.find({IsQuestion: true}).lean().exec();
    const options: IFuseOptions<IMessage> = {keys: ["Text","Likes","Dislikes","Date_Created"]}
    const searcher = new Fuse(questions as IMessage[],options);
    let sortBy = req.params.sortBy;
    let results = searcher.search(req.params.text);
    let matches = [];
    for (const result of results) {
        let account = await Account.findById(result.item.Account).lean().exec();
        matches.push({...result.item, Username: account?.Username})
    }
    if(sortBy == 'Date_Created' || sortBy == 'Likes' || sortBy == 'Dislikes') {
        matches.sort(function (a, b) {
            switch (sortBy) {
                case 'Likes':
                    return a.Likes >= b.Likes ? -1 : 1;
                case 'Dislikes':
                    return a.Dislikes >= b.Dislikes ? -1 : 1;
                case 'Date_Created':
                    return a.Date_Created >= b.Date_Created ? -1 : 1;
            }
        })
    }
    res.status(200).json({'matches': matches,'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount ? req.session.currAccount: "", profilePicture: res.locals.profilePicture});
}
/**
 * Gets a message with id matching the MessageID path param,
 * responding with 404 if the message couldn't be found
 * @param req
 * @param res
 */
export const getMessage = async(req: Request, res: Response) => {
    let message;
    try{
        message = await Message.findById(req.params.MessageID).lean().exec();
    }
    catch(error){
        res.status(404).json({'error': "Message could not be found",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: res.locals.profilePicture});
        return;
    }
    if(message == null){
        res.status(404).json({'error': "Message could not be found",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: res.locals.profilePicture});
        return;
    }
    const account = await Account.findById(message.Account).lean().exec();
    let username = account?.Username;
    res.status(200).json({'message': message,'Username': username,'isAuthenticated': !!req.session.loggedIn,'currUser': req.session.currAccount? req.session.currAccount : "",profilePicture: res.locals.profilePicture});
}
/**
 * Creates a new Question with the specified text. Session must have current AccountId and be logged in
 * @param req body should have text
 * @param res will send a 401 if not logged in, 404 if the Account Id couldn't be resolved.
 */
export const postQuestion = async (req: Request, res: Response) => {
    const currAccount = res.locals.currAccount;
    const text = req.body.Text;
    const msg = new Message({
        Text: text,
        Account: currAccount._id,
        IsQuestion: true,
        Date_Created: new Date(),
        RepliedTo: null,
        Replies: [],
        Likes: 0,
        Dislikes: 0
    });
    await msg.save();
    res.status(201).json({'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: res.locals.profilePicture});
}
/**
 * Replies to a message on the Public Forum.
 *  Session should have AccountID as currAccount.
 *     @param MessageId as a path parameter, the ObjectID of the Question being responded to
 *     @param req body should have Text: the text of the message
 * @param res will send http error 404 code if either the Account or Question couldn't be found, 401 if unauthorized, 201
 */
export const postReply = async (req: Request, res: Response) => {
    if(!req.session.loggedIn || req.session.currAccount == null){
        res.status(401).json({'error':"Invalid Credentials",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: res.locals.profilePicture});
        return;
    }
    const currAccount = await Account.findById( req.session.currAccount).lean().exec();
    if(!currAccount){
        res.status(500).json({'error':"Couldn't find acclunt",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: res.locals.profilePicture});
        return;
    }
    const message = await Message.findById(req.params.MessageID).exec();
    if (message == null) {
        res.status(500).json({'error': "Question could not be found.",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: res.locals.profilePicture});
        return;
    }
    const msg = new Message({
        Text: req.body.Text,
        Account: currAccount?._id,
        IsQuestion: false,
        Date_Created: new Date(),
        RepliedTo: message._id,
        Replies: [],
        Likes: 0,
        Dislikes: 0
    });
    await message.addReply(msg._id);
    await msg.save();
    const repliedAccount = await Account.findById(message.Account).lean().exec();
    if(repliedAccount != null && repliedAccount.RecieveResponseNotifications) {
        const notifier = NotifyerFactory.GetNotifyers("Email");
        const emailText = "Your Message:\n" + message.Text + "\nReply:\n" + msg.Text;
        notifier.notify(repliedAccount.Email as string,"StockOverflow Reply By " + currAccount.Username,emailText)
    }
    res.status(201).json({'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: res.locals.profilePicture});
}
/**
 * Gets all the responses to a Question whose Id is a path parameter, as well as comments on those responses
 * @param req
 * @param res sends http code 404 if the Question could not be found,
 * 422 if the supplied Id is not a Question,
 * or if susccessful, code 200 with a Map where the keys are response objects and the keys are comment obejcts.
 */
export const getQuestionPage = async (req: Request, res: Response) => {
    let question;
    try {
        question = await Message.findById(req.params.QuestionID).lean().exec();
    }catch(error){
        res.status(404).json({'error': "Question could not be found",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount ? req.session.currAccount : "",profilePicture: res.locals.profilePicture});
        return;
    }
    if(question == null) {
        res.status(404).json({'error': "Question could not be found",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount ? req.session.currAccount : "",profilePicture: res.locals.profilePicture});
        return;
    }
    if(!question.IsQuestion){
        res.status(303).json({'error': "Message was found, but is not a forum Question.",'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount ? req.session.currAccount : "",profilePicture: res.locals.profilePicture});
        return;
    }
    let responses = [];
    for (const reply of question.Replies) {
        let response = await Message.findById(reply).lean().exec();
        let id = response?.Account;
        let username = (await Account.findById(id).lean().exec())?.Username;
        let comments = await Message.find({_id: {$in: response?.Replies}}).lean().exec();
        let comment_users = []
        for (let i = 0; i < comments.length; i++) {
            let commenter = (await Account.findById(comments[i].Account).lean().exec())?.Username;
            comment_users.push({Username: commenter,Message: comments[i]});
            /** let commentReplies = await Message.find({_id: {$in: response?.Replies}}).lean().exec();
            for(let commentReply of commentReplies) {
                let commentReplier = (await Account.findById(commentReply.Account).lean().exec())?.Username;
                comment_users.push({Username: commentReplier,Message: commentReply});
            }*/
        }
        responses.push({Username: username,Response: response,Comments: comment_users});
    }
    res.status(200).json({'responses': responses,'isAuthenticated': req.session.loggedIn,'currUser': req.session.currAccount? req.session.currAccount : "",profilePicture: res.locals.profilePicture});
}
/**
 * Likes a message whose Id should be a path parameter
 * @param req needs to have a session with an AccountID
 * @param res will send http code 200 upon completion
 */
export const patchLikeMessage = async(req: Request, res: Response) => {
    const currAccount = res.locals.currAccount;
    const msg = await Message.findById(req.params.MessageID).lean().exec();
    if(msg) {
        await currAccount.likeMessage(new mongoose.Types.ObjectId(msg._id));
        const likedAccount = await Account.findById(msg?.Account).lean().exec();
        if (likedAccount != null && likedAccount.RecieveLikedNotifications) {
            const notifier = NotifyerFactory.GetNotifyers("Email");
            const emailText = "Your Message:\n" + msg.Text;
            await notifier.notify(likedAccount.Email.toString(), "StockOverflow Like By " + currAccount.Username, emailText)
        }
        res.status(200).json({'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture:res.locals.profilePicture});
    }
    else{
        res.status(404).json({'error': 'Message could not be found','isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: res.locals.profilePicture});
    }
}
/**
 * Dislikes a message whose Id is a path parameter.
 * @param req needs to have a session with an AccountId
 * @param res will send http code 200 upon completion
 */
export const patchDislikeMessage = async(req: Request, res: Response) => {
    const currAccount = res.locals.currAccount;
    await currAccount.dislikeMessage(new mongoose.Types.ObjectId(req.params.MessageID));
    res.status(200).json({'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture:res.locals.profilePicture});
}
/**
 * Sets the Account to no longer like or dislike a message whose Id is a path parameter
 * @param req needs to have a session with an AccountID
 * @param res will send http code 200 upon completion
 */
export const patchClearLike = async(req: Request, res: Response) => {
    const currAccount = res.locals.currAccount;
    await currAccount.removeMessage(new mongoose.Types.ObjectId(req.params.MessageID));
    res.status(200).json({'isAuthenticated':req.session.loggedIn,'currUser': req.session.currAccount,profilePicture: res.locals.profilePicture});
}