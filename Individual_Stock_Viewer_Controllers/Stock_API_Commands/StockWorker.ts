import { parentPort, workerData } from "worker_threads";

import { StockDataCommand } from "./StockDataCommand";
import { IAPI_Command } from "./IAPI_Command";


async function processTask(data: any): Promise<any> {
    console.log(data)
    const command: IAPI_Command = new StockDataCommand(data.data.API);
    const result: any = await command.get_data(data.data.Data)
    console.log('dfd')
    return {Name: result.Name, Data: result};
}

// Notify the main thread with the result
if (parentPort) {
  processTask(workerData).then((result) => {parentPort?.postMessage(result)}).catch((error) => parentPort?.postMessage({error: error.message}));
}