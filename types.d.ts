import axios from "axios";
interface ClusterStatusResponse {
    name: string;
    paused: boolean;
    stateName: string;
    // Add other fields based on the API response
  }
async function getDbStatus(): Promise<string> {
    try {  
        const response = await axios.get<ClusterStatusResponse>(`https://cloud.mongodb.com/api/atlas/v1.0/groups/67351c65eb63422e1920818d/clusters/StockOverflow`,
            {auth: {
                username: 'conepklj',
                password: '77c88505-2337-42b6-bc79-f9076ed7d722'
                },
                headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }}
        )
        console.log('current statys')
        const currentstate = response.data.stateName;
        console.log(currentstate)
        return currentstate;
    } catch (error) {
        console.log(error);
        return 'ERROR'
    }
}
(async () => {
    try {
        console.log('Checking database status...');
        const status = await getDbStatus();
        // console.log(`Current database status: ${status}`);
            
        // if (status !== 'IDLE') {
        //         console.log('Starting database instance...');
        //         await dbManager.startDbInstance();
        // }
    
        // console.log('Connecting to MongoDB...');
        // await connectToMongoDB(dbUrl);
    
       
    } catch (error) {
        console.error('Error during startup:', error);
    }
 })();