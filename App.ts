
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
import GeneralRoutes from './routes/GeneralRoutes';
import UserRoutes from './routes/UserRoutes';
import { GeneralController } from './controllers/GeneralController';
dotenv.config();
const sessionSecret = crypto.randomBytes(32).toString('hex');
const MongodbStore = MongodbSession(session);
const app = express();

const dbUrl = process.env.DB_CONNECTION_URL || '';

mongoose.connect(dbUrl)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(8000, () => console.log('Server running on http://localhost:8000'));
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });
const store = new MongodbStore({
    uri: dbUrl,
    collection: 'UserData',
});
store.on('error', (error) => console.error('Session store error:', error));

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(session({
    secret: sessionSecret,
    resave: false,
    store: store,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60,
        secure: false,
        httpOnly: true,
    },
}));

app.use(express.json()); // Parse JSON request bodies
app.use('/auth', AuthRoutes);
app.use(ErrorRoutes);
app.use(GeneralRoutes)
app.use('/public-forum', PublicForumRoutes);
app.use('/stocks', StockRoutes);
app.use('/user', UserRoutes);

// mongoose.connect(dbUrl).then(result => {
//     app.listen(8000)
// }).catch(err => {
//     console.log(err)
// })


