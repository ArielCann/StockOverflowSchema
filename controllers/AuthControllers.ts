import bcrypt from 'bcrypt'; 
import { validationResult } from 'express-validator';
import {Request, Response} from "express";
import Account from "../models/accountSchema";



exports.getLogin = (req: Request, res: Response) => {

}

exports.postLogin = exports.postSignup = async (req: Request, res: Response) => {
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

exports.getSignup = (req: Request, res: Response) => {

}

exports.postSignup = (req: Request, res: Response) => {

}

exports.getResetPassword = (req: Request, res: Response) => {

}

exports.postResetPassword = (req: Request, res: Response) => {

}

