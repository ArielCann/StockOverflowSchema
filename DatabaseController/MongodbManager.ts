import { DbManager } from "./DbManager";
import axios from "axios";
import { Worker } from 'worker_threads';
import { IAtlasConfig } from "./IAtlasConfiguration";
import AxiosDigestAuth from '@mhoc/axios-digest-auth';

/**
 * this class is responsible for managing a mongo database instance. Because its managing a database instance, we made it a singleton so it doesn't 
 * lead to additional overhead 
 */
export class MongodbManager implements DbManager {

    private mongoDbURL: string;
    private mongoConfig: IAtlasConfig;
    private static instance: MongodbManager;

    private constructor (mongoConfig: IAtlasConfig) {
        this.mongoDbURL = 'https://cloud.mongodb.com/api/atlas/v1.0';
        this.mongoConfig = mongoConfig;
        console.log(mongoConfig)
    }

    static getMongodbManager(mongoConfig: IAtlasConfig):  MongodbManager{
        if (this.instance) {
            return this.instance;
        }
        else {
            this.instance = new MongodbManager(mongoConfig);
            return this.instance;
        }
    }
    /**
     * this method is responsible for handling the thread that is responsible for starting up the database instance
     */
    async startDbInstance(): Promise<void> {
        try {
            console.log('got here')
            const dbPromise = new Promise<void>((resolve, reject) => {
                const worker = new Worker('./DatabaseController/MongoManagerWorker.ts', {
                    execArgv: ['-r', 'ts-node/register'],
                    workerData: { isBeingStopped: false, atlasConfiguration: this.mongoConfig, dbURL: this.mongoDbURL, startStopDbInstance: true},
                });
                worker.on('message', (data) => {
                    if (data.success) {
                        console.log("Successfully started the DB Instance");
                        resolve();
                    }
                    else {
                        console.log('There was an error starting the Database Instance');
                        reject(data.error);
                    }
                });
                worker.on('error', (error) => {
                    console.error(`Worker error for starting database instance`, error);
                    reject(error);
                });

                worker.on('exit', (code) => {
                    if (code !== 0) {
                        reject(new Error(`Worker stopped with exit code ${code}`));
                    }
                });
            })
            await dbPromise;
            
        } catch (error) {
            console.log("Error starting up the db")
        }
    }
    /**
     * this method is responsible for handling the thread that is responsible for stopping up the database instance
     */
    async stopDbInstance(): Promise<void> {
        try {
            const dbPromise = new Promise<void>((resolve, reject) => {
                const worker = new Worker('./DatabaseController/MongoManagerWorker.ts', {
                    execArgv: ['-r', 'ts-node/register'],
                    workerData: { isBeingStopped: true, atlasConfiguration: this.mongoConfig, dbURL: this.mongoDbURL, startStopDbInstance: true},
                });
                worker.on('message', (data) => {
                    if (data.success) {
                        console.log("Successfully stopping the DB Instance");
                        resolve();
                    }
                    else {
                        console.log('There was an error stopping the Database Instance');
                        reject(data.error);
                    }
                });
                worker.on('error', (error) => {
                    console.error(`Worker error for stopping database instance`, error);
                    reject(error);
                });

                worker.on('exit', (code) => {
                    if (code !== 0) {
                        reject(new Error(`Worker stopped with exit code ${code}`));
                    }
                });
            })
            await dbPromise;
            
        } catch (error) {
            console.log("Error puasing the db")
        }
    }
    async getDbStatus(): Promise<string> {
        try {
            const dbPromise = new Promise<string>((resolve, reject) => {
                const worker = new Worker('./DatabaseController/MongoManagerWorker.ts', {
                    execArgv: ['-r', 'ts-node/register'],
                    workerData: { atlasConfiguration: this.mongoConfig, dbURL: this.mongoDbURL, startStopDbInstance: false},
                });
                worker.on('message', (data) => {
                    if (data.success) {
                        console.log("Successfully stopping the DB Instance");
                        resolve(data.status);
                    }
                    else {
                        console.log('There was an error stopping the Database Instance');
                        reject(data.error);
                    }
                });
                worker.on('error', (error) => {
                    console.error(`Worker error for stopping database instance`, error);
                    reject(error);
                });

                worker.on('exit', (code) => {
                    if (code !== 0) {
                        reject(new Error(`Worker stopped with exit code ${code}`));
                    }
                });
            })
            const status: string = await dbPromise;
            return status;
        } catch (error) {
            console.log("Error puasing the db");
            return 'ERROR'
        }
        
    }
    
}