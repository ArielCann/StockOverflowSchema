import mongoose from "mongoose";
import {Request, Response} from "express";
import Message from "../models/messageSchema";
import Account from "../models/accountSchema";
import Fuse from "fuse.js";

export const getQuestionSearch = async (req: Request, res: Response) => {
    const questions = await Message.find({IsQuestion: true}).exec();
    const searcher = new Fuse(questions,{keys: ["text"]});
    let results = searcher.search(req.body.Text);
    let matches = [];
    for (const result of results) {
        matches.push(result.item.toJSON());
    }
    res.json(matches);
}
export const getMessage = async(req: Request, res: Response) => {
    const message = await Message.findById(req.params.MessageID).lean().exec();
    if(message == null){
        res.status(404).send("Message could not be found");
        return;
    }
    const user = await Account.findById(message.Account).lean().exec();
    res.status(200).json({username: user?.Username, message: message});
}
export const postQuestion = async (req: Request, res: Response) => {
    const account = await Account.findOne({AccountID: req.session.AccountID}).exec();
    if(account == null) {
        res.status(404).send("Error: Account could not be found.");
        return;
    }
    const text = req.body.text;
    const msg = new Message({
        text: text,
        Account: account._id,
        IsQuestion: true,
        Date_Created: new Date(),
        RepliedTo: null,
        Replies: [],
        Likes: 0,
        Dislikes: 0
    });
    msg.save();
    res.status(200);
}
/**
 *
 * @param req body should have the following properties
 *     @param AccountID the ObjectID of the Account posting the new response
 *     @param QuestionID the ObjectID of the Question being responded to
 *     @param text the text of the message
 * @param res will send http error 404 code if either the Account or Question couldn't be found.
 */
export const postResponse = async (req: Request, res: Response) => {
    const account = await Account.findById(req.session.AccountID).exec();
    const question = await Message.findById(req.body.QuestionID).exec();
    if (question == null) {
        res.status(404).send("Error: Question could not be found.");
        return;
    }
    if (account == null) {
        res.status(404).send("Error: Account could not be found.");
        return;
    }
    const msg = new Message({
        text: req.body.text,
        Account: account._id,
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
    const account = await Account.findById(req.session.AccountID).exec();
    const text = req.body.text;
    const response = await Message.findById(req.body.ResponseID).exec();
    if (response == null) {
        res.status(404).send("Error: Question could not be found.");
        return;
    }
    if (account == null) {
        res.status(404).send("Error: Account could not be found.");
        return;
    }
    const msg = new Message({
        text: text,
        Account: account._id,
        IsQuestion: false,
        Date_Created: new Date(),
        RepliedTo: response._id,
        Replies: [],
        Likes: 0,
        Dislikes: 0
    });
    response.addReply(msg._id);
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
    const question = await Message.findById(req.params.QuestionID).exec();
    if(question == null) {
        res.status(404).send("Error: Question could not be found.");
        return;
    }
    if(!question.IsQuestion){
        res.status(422).send("Message was found, but is not a forum Question.");
        return;
    }
    let responses = new Map();
    for (const reply of question.Replies) {
        let response = await Message.findById(reply).exec();
        responses?.set(response?._id, await Message.find({_id: {$in: response?.Replies}}).lean().exec());
    }
    res.status(200).json(responses);
}
export const getResponseComments = async (req: Request, res: Response) => {
    const response = await Message.findById(req.params.ResponseID).exec();
    if(response == null){
        res.status(404).send("Error: Response could not be found.");
        return;
    }
    if(response?.IsQuestion){
        res.status(422).send("Message was found, but a Question, not a response.");
        return;
    }
    let comments = [];
    for (const comment of response.Replies) {
        comments.push((await Message.findById(comment).exec())?.toJSON());
    }
    res.status(200).json(comments);
}
/**
 * Likes a message whose Id should be a path parameter
 * @param req needs to have a session with an AccountID
 * @param res will send http code 200 upon completion
 */
export const patchLikeMessage = async(req: Request, res: Response) => {
    let account = await Account.findById(req.session.AccountID).exec();
    account?.likeMessage(new mongoose.Types.ObjectId(req.params.MessageID));
    res.status(200);
}
/**
 * Dislikes a message whose Id is a path parameter.
 * @param req needs to have a session with an AccountId
 * @param res will send http code 200 upon completion
 */
export const patchDislikeMessage = async(req: Request, res: Response) => {
    let account = await Account.findById(req.session.AccountID).exec();
    account?.dislikeMessage(new mongoose.Types.ObjectId(req.params.MessageID));
    res.status(200);
}
/**
 * Sets the Account to no longer like or dislike a message whose Id is a path parameter
 * @param req needs to have a session with an AccountID
 * @param res will send http code 200 upon completion
 */
export const patchClearLike = async(req: Request, res: Response) => {
    let account = await Account.findById(req.session.AccountID).exec();
    account?.removeMessage(new mongoose.Types.ObjectId(req.params.MessageID));
    res.status(200);
}
/**
 *
 * @param req needs to have a session with an AccountID
 * @param res sends http code 200 and a map of message Ids (as strings)
 *      to booleans that the user has either liked or disliked, true for liked, false for disliked.
 */
export const getLikedDislikedMessages = async (req: Request, res: Response) => {
    let account = await Account.findById(req.session.AccountID).exec();
    res.status(200).json(account?.LikedDislikedMessages);
}