import path from 'path';

import session from 'express-session';
import MongodbSession from 'connect-mongodb-session';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import flash from 'connect-flash';
import * as dotenv from 'dotenv';
import crypto from 'crypto'
import cors from 'cors'
import AuthRoutes from './routes/AuthRoutes';
import ErrorRoutes from './routes/ErrorRoutes';
import PublicForumRoutes from './routes/PublicForumRoutes';
import StockRoutes from './routes/StockRoutes';
import UserRoutes from './routes/UserRoutes';
dotenv.config();
const sessionSecret = crypto.randomBytes(32).toString('hex');
const MongodbStore = MongodbSession(session);
const app = express();
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60
    }
}))
//routes
app.use(cors()); // Enable CORS for React frontend
app.use(express.json()); // Parse JSON request bodies
app.use('/auth', AuthRoutes);
app.use(ErrorRoutes);
app.use('/public-forum', PublicForumRoutes);
app.use('/stocks', StockRoutes);
app.use('/user', UserRoutes);

const dbUrl: string = process.env.DB_CONNECTION_URL ? process.env.DB_CONNECTION_URL : ''
mongoose.connect(dbUrl).then(result => {
    app.listen(8000)
}).catch(err => {
    console.log(err)
})
const store = new MongodbStore({
    uri: dbUrl,
    collection: 'UserData',
});

