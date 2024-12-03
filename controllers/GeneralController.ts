import express, {Request, Response} from 'express';

export class GeneralController {

    public GetHome(req: Request, res: Response): void {
        console.log('home')
        console.log(req.session.loggedIn)
        res.status(200).send({'data': "home", 'isAuthenticated': req.session.loggedIn ? true : false})
    }
}