/**
 * this interface is for any Stock API's that are components in the Individual Stock page 
 */
export interface IIndividualStockPageAPIInformation {
    getStockData(ticker: string);
}
