import mongoose from "mongoose";
import { Request, Response } from "express";
import Message from "../models/messageSchema";
import Account from "../models/accountSchema";
import Fuse from "fuse.js";
exports.patchProfile = async (req: Request, res: Response) => {
    if(req.session){
        
    }
}