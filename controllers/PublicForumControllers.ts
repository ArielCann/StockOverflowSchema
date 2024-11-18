import mongoose from "mongoose";
import express, { Request, Response } from "express";
import session from "express-session";
import Message from "../models/messageSchema";
import Account from "../models/accountSchema";
exports.postResponse = async (req: Request, res: Response) => {
    const account = await Account.findOne({AccountID: req.session.AccountID});
    const text = req.body.text;
    const question = await Message.findOne({MessageID: req.body.QuestionID})
    var msg = await Message.create({
        text: text,
        Account: account?._id,
        IsQuery: false,
        Date_Created: new Date(),
        RepliedTo: question?._id,
        Replies: [],
        Likes: 0,
        Dislikes: 0
    });
    msg.save();
}