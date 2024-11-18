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
        Date_Created: new Date(),
    });
}