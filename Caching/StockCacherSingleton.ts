import NodeCache from "node-cache"
import policyReader from "../PolicyReader";

/**
 * Singleton class holding the cache for historical stock data.
 */
export default class StockCacherSingleton {
    private static cacher: NodeCache;

    /**
     * Instantiates historical data cache if it doesn't already exist,
     * and returns it in either case.
     */
    public static getCacher() {
        if(this.cacher){
            return this.cacher;
        }
        else{
            this.cacher = new NodeCache({stdTTL: policyReader.getTTL()});
            return this.cacher;
        }
    }
}