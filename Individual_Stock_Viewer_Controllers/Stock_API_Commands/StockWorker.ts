import { parentPort, workerData } from "worker_threads";

import { StockDataExecutor } from "./StockDataCommand";
import { IAPI_Executor } from "./IAPI_Executor";
import { StockExecutorFactory } from "./StockExecutorFactory";

/**
 * this method is responsible for calling a StockExecutor to execucute an API (command). This method is called by the different worker 
 * threads to create concurrency 
 * @param data a JSON object that includes the type of API to invoke and the ticker
 * @returns 
 */
async function processTask(data: any): Promise<any> {
    console.log(data)
    const StockExecutor: IAPI_Executor = StockExecutorFactory.GetStockExecutor(data.data.ExecutorType, data.data.API)
    const result: any = await StockExecutor.get_data(data.data.Data)
    console.log('dfd')
    return {Name: result.Name, Data: result};
}

// Notify the main thread with the result
if (parentPort) {
  processTask(workerData).then((result) => {parentPort?.postMessage(result)}).catch((error) => parentPort?.postMessage({error: error.message}));
}