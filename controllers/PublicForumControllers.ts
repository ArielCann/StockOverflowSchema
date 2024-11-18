import mongoose from "mongoose";
import express, { Request, Response } from "express";
import session from "express-session";
import Message from "../models/messageSchema";
import Account from "../models/accountSchema";
exports.postResponse = (req: Request, res: Response) => {
    const user = Account.findById(req.session.AccountID);
    var text = req.body.text;
    var msg = Message.create({
        text: text,
        AccountID: req.session.AccountID,
        IsQuery: false,
        Date_Created: new Date(),
        RepliedTo: req.body.Question,
        Replies: [],
        Likes: 0,
        Dislikes: 0
    });
}