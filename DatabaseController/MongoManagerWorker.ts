//this file is responsible for doing db management on a seperate thread
import axios from "axios";
import { IAtlasConfig } from "./IAtlasConfiguration";
import { response } from "express";
import { parentPort, workerData } from "worker_threads";
import AxiosDigestAuth from '@mhoc/axios-digest-auth';
import { error } from "console";
import { header } from "express-validator";

/**
 * this method is reponsivle for getting the Authorization header  
 * @param atlasConfiguration 
 * @returns 
 */
function getAuthHeader(atlasConfiguration: IAtlasConfig): string {
    const credentials = `conepklj:77c88505-2337-42b6-bc79-f9076ed7d722`;
    return `Basic ${Buffer.from(credentials).toString('base64')}`;
} 
/**
 * this method is responsible for starting or stopping a database instance 
 * @param atlasConfiguration the api credentials 
 * @param dbURL 
 * @param isBeingStopped 
 */
async function startStopDbInstance(atlasConfiguration: IAtlasConfig, dbURL: string, isBeingStopped: boolean) {
    try {
        const digestAuth = new AxiosDigestAuth({
            username: atlasConfiguration.publicKey,
            password: atlasConfiguration.privateKey,
          });
        const response = await digestAuth.request({
            method: 'PATCH',
            url: `${dbURL}/groups/${atlasConfiguration.groupId}/clusters/${atlasConfiguration.clusterName}`,
            data: {paused: isBeingStopped},
            headers: {
                'Content-Type': 'application/json',
            }
        })
        console.log(response)
    } catch (error) {
        console.log('there was an error ')
        console.log(response)
    }
}
async function getDbStatus(atlasConfiguration: IAtlasConfig, dbURL: string): Promise<string> {
    try {  
        const digestAuth = new AxiosDigestAuth({
            username: atlasConfiguration.publicKey,
            password: atlasConfiguration.privateKey,
          });
        const response = await digestAuth.request({
            method: 'GET',
            url: `${dbURL}/groups/${atlasConfiguration.groupId}/clusters/${atlasConfiguration.clusterName}`

        })
        console.log('current statys')
        const currentstate = response.data.stateName;
        console.log(currentstate)
        return currentstate;
    } catch (error) {
        console.log(error);
        return 'ERROR'
    }
}
if (parentPort) {
    if (workerData.startStopDbInstance) {
        startStopDbInstance(workerData.atlasConfiguration, workerData.dbURL, workerData.isBeingStopped)
        .then(() => {
            parentPort?.postMessage({success: true});
        })
        .catch((err) => {
            parentPort?.postMessage({success: false, error: err.message});
        })
    } else {
        getDbStatus(workerData.atlasConfiguration, workerData.dbURL)
        .then((status: string) => {
            parentPort?.postMessage({success: true, status: status});
        })
        .catch((err) => {
            parentPort?.postMessage({success: false, error: err.message});
        })
    }
}
