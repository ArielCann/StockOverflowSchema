/**
 * this interface is responsible for holding data relevant for managing an atlas mongo database
 */
export interface IAtlasConfig {
    publicKey: string;
    privateKey: string;
    groupId: string; 
    clusterName: string;
}