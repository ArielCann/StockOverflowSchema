import mongoose from "mongoose";
import express, { Request, Response } from "express";
import session from "express-session";
exports.postResponse = (req: Request, res: Response) => {
    var user = (req.session);
}