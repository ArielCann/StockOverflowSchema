/**
 * this interface is responsible for delegate the behavior to a class to execute the different stock api's (commandds)
 */
export interface IAPI_Command {
    get_data(ticker: string): Promise<any>;
}