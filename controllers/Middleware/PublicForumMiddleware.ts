import { Request, Response, NextFunction } from "express";
import Message from '../../models/messageSchema'
import Filter from 'leo-profanity';

/**
 *
 * @param req any post request containing text for a new message,
 * should already have auth information in the session.
 * @param res should already have profile picture
 * @param next
 */
export const checkProfanity = (req: Request, res: Response, next: NextFunction) => {
    const hasProfanity = Filter.check(req.body.Text);
    if (hasProfanity && req.body.Text == '') {
        res.status(404).json({message: 'profanity/Empty' ,isAuthenticated: req.session.loggedIn, currUser: req.session.currAccount, profilePicture: res.locals.profilePicture});
        return;
    }
    next();
}