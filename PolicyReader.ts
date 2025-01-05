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
}
export default PolicyReader;