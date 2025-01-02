
import session from 'express-session';
import MongodbSession from 'connect-mongodb-session';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import flash from 'connect-flash';
import cron from 'node-cron'
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
import { SNSDailyNotifyer } from './StockDailyNotifyer/SNSDailyNotifyer';
import { DailyNotifyerService } from './StockDailyNotifyer/DailyNotifyerService';
import AWS from 'aws-sdk';
import { StockDataExecutor } from './Individual_Stock_Viewer_Controllers/Stock_API_Commands/StockDataCommand';
import { DbManager } from './DatabaseController/DbManager';
import { MongodbManager } from './DatabaseController/MongodbManager';
import { connectToMongoDB } from './DatabaseController/MongooseInstance';
dotenv.config();
const sessionSecret = crypto.randomBytes(32).toString('hex');
const MongodbStore = MongodbSession(session);
const app = express();

const dbUrl = process.env.DB_CONNECTION_URL || '';

const dbManager: DbManager = MongodbManager.getMongodbManager({publicKey: process.env.DB_PUBLIC_KEY || '',
    privateKey: process.env.DB_PRIVATE_KEY || '',
    groupId: process.env.GROUP_ID || '',
    clusterName: process.env.CLUSTER_NAME || ''});

// mongoose.connect(dbUrl)
//     .then(() => {
//         console.log('Connected to MongoDB');
//         app.listen(8000, () => console.log('Server running on http://localhost:8000'));
//     })
//     .catch(err => {
//         console.error('MongoDB connection error:', err);
//     });
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
//this middleware is responsible for invoking aws sns to send messages to users about daily news
const triggerNotifications = () => {
    const sns = new AWS.SNS({region: 'us-east-1'})
    const dailyNotifyerService: DailyNotifyerService = new SNSDailyNotifyer(sns, new StockDataExecutor('Yahoo News'));
    try {
        console.log('about to notify all accounts');
        dailyNotifyerService.notifyAllAccounts();
    } catch (error) {
        console.log("error notifying accounts ")
    }
    
};
/**
 * this method is responsible for triggering sns to send the latest stock news to users
 */
cron.schedule('37 16 * * *', async () => {
    await triggerNotifications();
});
// (async () => {
//     await triggerNotifications();
// })();

// mongoose.connect(dbUrl).then(result => {
//     app.listen(8000)
// }).catch(err => {
//     console.log(err)
// })
(async () => {
    try {
        // await dbManager.stopDbInstance();
        console.log('Checking database status...');
        const status = await dbManager.getDbStatus();
        console.log(`Current database status: ${status}`);
            
        if (status !== 'IDLE') {
                console.log('Starting database instance...');
                await dbManager.stopDbInstance();
        }
    
        console.log('Connecting to MongoDB...');
        await connectToMongoDB(dbUrl);
    
        console.log('Server starting...');
        app.listen(8000, () => {
            console.log(`Server running on http://localhost:8000`);
        });
    } catch (error) {
        console.error('Error during startup:', error);
    }
    })();

