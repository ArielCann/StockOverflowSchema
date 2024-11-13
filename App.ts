import path from 'path';
import session from 'express-session';
import MongodbSession from 'connect-mongodb-session';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import flash from 'connect-flash';
import * as dotenv from 'dotenv';

import AuthRoutes from './routes/AuthRoutes';
import ErrorRoutes from './routes/ErrorRoutes';
import PublicForumRoutes from './routes/PublicForumRoutes';
import StockRoutes from './routes/StockRoutes';
import UserRoutes from './routes/UserRoutes';


dotenv.config();
const MongodbStore = MongodbSession(session);
const app = express();
//routes
app.use('/auth', AuthRoutes);
app.use(ErrorRoutes);
app.use('/public-forum', PublicForumRoutes);
app.use('/stocks', StockRoutes);
app.use('/user', UserRoutes);

const dbUrl: string = process.env.DB_CONNECTION_URL ? process.env.DB_CONNECTION_URL : ''
mongoose.connect(dbUrl).then(result => {
    app.listen(3000)
}).catch(err => {
    console.log(err)
})


