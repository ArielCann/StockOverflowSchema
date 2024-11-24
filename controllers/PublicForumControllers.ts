import mongoose from "mongoose";
import express, { Request, Response } from "express";
import session from "express-session";
import Message from "../models/messageSchema";
import Account from "../models/accountSchema";
import Fuse from "fuse.js";
exports.questionSearch = async (req: Request, res: Response) => {
    const questions = await Message.find({IsQuestion: true}).exec();
    const searcher = new Fuse(questions,{keys: ["text"]});
    let results = searcher.search(req.body.Text);
    let matches = [];
    for (const result of results) {
        matches.push(result.item.toObject({versionKey: false,depopulate: true}));
    }
    res.json(matches);
}
exports.getMessage = async(req: Request, res: Response) => {
    const message = await Message.findById(req.params.MessageID).exec();
    if(message == null){
        res.status(404).send("Message could not be found");
        return;
    }
    res.status(200).json(message.toObject({versionKey: false,depopulate: true}));
}
exports.postQuestion = async (req: Request, res: Response) => {
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
exports.postResponse = async (req: Request, res: Response) => {
    const account = await Account.findById(req.body.AccountID).exec();
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
exports.postComment = async (req: Request, res: Response) => {
    const account = await Account.findById(req.body.AccountID).exec();
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
exports.getQuestionResponses = async (req: Request, res: Response) => {
    const question = await Message.findById(req.params.QuestionID).exec();
    if(question == null) {
        res.status(404).send("Error: Question could not be found.");
        return;
    }
    if(!question.IsQuestion){
        res.status(422).send("Message was found, but is not a forum Question.");
        return;
    }
    let responses = [];
    for (const reply of question.Replies) {
        responses.push((await Message.findById(reply).exec())?.toObject({versionKey: false,depopulate: true}));
    }
    res.status(200).json(responses);
}
exports.getResponseComments = async (req: Request, res: Response) => {
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
        comments.push((await Message.findById(comment).exec())?.toObject({versionKey: false,depopulate: true}));
    }
    res.status(200).json(comments);
}