import * as policy from "./config/policy.json";

/**
 * Reads policy from policy.json file, which should be abstracted from other classes.
 */
class PolicyReader {
    /**
     * Retrieves the configured time to live in the stock data cache, in seconds.
     * If the number is 0 or fewer seconds, or a decimal it will default to 120 seconds.
     */
    public static getTTL(): number{
        if(policy.TTL > 0 && Number.isInteger(policy.TTL)){
            return policy.TTL;
        }
        else{
            return 120;
        }
    }

    /**
     * Retrieves which trends should be sent to the trending stock page,
     * defaulting to only sending the 52-week-high stocks if no valid trends are listed in policy.json.
     */
    public static getTrends(): string[]{
        const validTrends: string[] = []
        for(const trend of policy.Trends){
            if (["MostActive", "PctChgGainers", "PctChgLosers", "NetGainers", "NetLosers", "High52Wk", "Low52Wk"].includes(trend)){
                validTrends.push(trend);
            }
        }
        if(validTrends.length > 0) {
            return validTrends;
        }
        else return ["High52Wk"];
    }

    /**
     * Retrieves number of news articles to be returned to client.
     * Will default to 20 if the configured number is a decimal or negative.
     */
    public static getArticleNum(): number{
        if(policy.NewsArticles > 0 && Number.isInteger(policy.NewsArticles)){
            return policy.NewsArticles;
        }
        else{
            return 20;
        }
    }
    /**
     * Retrieves time to Cron schedule database start
     * @returns a proper cron string, resorting to default if the configured one is invalid
     */
    public static getDbStart(): string{
        if(this.checkCron(policy.CronStartDB)){
            return policy.CronStartDB;
        }
        else{
            return "30 22 * * *";
        }
    }
    /**
     * Retrieves time to Cron schedule database stop
     * @returns a proper cron string, resorting to default if the configured one is invalid
     */
    public static getDbStop(): string{
        if(this.checkCron(policy.CronStopDB)){
            return policy.CronStopDB;
        }
        else{
            return "25 22 * * *";
        }
    }
    /**
     * Retrieves time to Cron schedule SNS stock news notifications
     * @returns a proper cron string, resorting to default if the configured one is invalid
     */
    public static getSNStime(): string{
        console.log(this.checkCron(policy.CronSNS))
        if(this.checkCron(policy.CronSNS)){
            return policy.CronSNS;
        }
        else{
            return "37 16 * * *";
        }
    }
    /**
     * @param cronString A configured cron string
     * @returns true if formatted properly, false otherwise.
     */
    private static checkCron(cronString: string): boolean{
        const cronStrings = cronString.split(' ');
        if(cronStrings.length != 5){
            return false;
        }
        let firstTime: number;
        let secondTime: number;
        try{
         firstTime = parseInt(cronStrings[0]);
         secondTime = parseInt(cronStrings[1]);
        }catch(err){
            return false;
        }
        if (firstTime < 0 || secondTime < 0){
            return false;
        }
        cronStrings.slice(2).forEach(asterisk =>{
            if(asterisk != "*"){
                return false;
            }
        })
        return true;
    }
}
export default PolicyReader;