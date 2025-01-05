/**
 * this file is resposible for doing database management 
 */

import { DbManager } from "./DbManager";
import { MongodbManager } from "./MongodbManager";
import { connectToMongoDB, disconnectFromMongoDB } from "./MongooseInstance";


// const dbManager: DbManager = MongodbManager.getMongodbManager({publicKey: process.env.DB_PUBLIC_KEY || '',
//     privateKey: process.env.DB_PRIVATE_KEY || '',
//     groupId: process.env.GROUP_ID || '',
//     clusterName: process.env.CLUSTER_NAME || ''});
    
export async function startUpServer(dbManager: DbManager) {
    const dbUrl = process.env.DB_CONNECTION_URL || '';
    console.log('Checking database status...');
        const status = await dbManager.getDbStatus();
        console.log(`Current database status: ${status}`);
        console.log(status)
            
        if (status.paused) {
            console.log('Starting database instance...');
            await dbManager.startDbInstance();
        }
        while ((await dbManager.getDbStatus()).status !== 'IDLE') {
            await sleep(7700);
            console.log('Waiting to start up server');
        }
        console.log('Connecting to MongoDB...');
        await connectToMongoDB(dbUrl);
    
        console.log('Server starting...');
}
export async function stopServer(dbManager: DbManager) {
    const status = await dbManager.getDbStatus();
        console.log(`Current database status: ${status}`);
        console.log(status)
        await disconnectFromMongoDB()
        if (!status.paused) {
            console.log('stopping database instance...');
            await dbManager.stopDbInstance();
            while ((await dbManager.getDbStatus()).status !== 'IDLE') {
                await sleep(7700);
                console.log('Waiting to stop server');
            }
        }
        console.log('Successfully stopped Database, doing repairs now...')
}
function sleep(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}