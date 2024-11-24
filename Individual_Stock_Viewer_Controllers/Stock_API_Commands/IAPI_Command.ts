export interface IAPI_Command {
    get_data(ticker: string): Promise<any>;
}