import mongoose from "mongoose";
import express, { Request, Response } from "express";
import session from "express-session";
import Message from "../models/messageSchema";
import Account from "../models/accountSchema";
exports.postResponse = async (req: Request, res: Response) => {
    const account = await Account.findById(req.body.AccountID);
    const text = req.body.text;
    const question = await Message.findById(req.body.QuestionID)
    const msg = await Message.create({
        text: text,
        Account: account?._id,
        IsQuestion: false,
        Date_Created: new Date(),
        RepliedTo: question?._id,
        Replies: [],
        Likes: 0,
        Dislikes: 0
    });
    msg.save();
}
exports.postQuestion = async (req: Request, res: Response) => {
    const account = await Account.findOne({AccountID: req.session.AccountID});
    const text = req.body.text;
    const msg = await Message.create({
        text: text,
        Account: account?._id,
        IsQuestion: true,
        Date_Created: new Date(),
        RepliedTo: null,
        Replies: [],
        Likes: 0,
        Dislikes: 0
    });
    msg.save();
}