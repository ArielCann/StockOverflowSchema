import { parentPort, workerData } from "worker_threads";

import { StockDataExecutor } from "./StockDataCommand";
import { IAPI_Command } from "./IAPI_Executor";

/**
 * this method is responsible for calling the StockDataExecutor to execucute an API (command). This method is called by the different worker 
 * threads to create concurrency 
 * @param data a JSON object that includes the type of API to invoke and the ticker
 * @returns 
 */
async function processTask(data: any): Promise<any> {
    console.log(data)
    const command: IAPI_Command = new StockDataExecutor(data.data.API);
    const result: any = await command.get_data(data.data.Data)
    console.log('dfd')
    return {Name: result.Name, Data: result};
}

// Notify the main thread with the result
if (parentPort) {
  processTask(workerData).then((result) => {parentPort?.postMessage(result)}).catch((error) => parentPort?.postMessage({error: error.message}));
}