/**
 * this interface is responsible for delegating db actions to different database classes
 */
export interface DbManager {
    /**
     * this method is responsible for starting a database instance 
     */
    startDbInstance(): Promise<void>;

    /**
     * this method is responsible for stopping a database instance 
     */
    stopDbInstance(): Promise<void>;

    /**
     * this method is responsible for getting the status of the database instance 
    */
    getDbStatus(): Promise<string>;
}