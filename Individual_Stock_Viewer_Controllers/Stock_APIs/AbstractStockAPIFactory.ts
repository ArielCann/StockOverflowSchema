import { StockBasicDataFactory } from "./StockBasicDataFactory";
import { StockAPIInformationFactory } from "./StockInformationFactory";
import { StockSearcherFactory } from "./StockSearcherFactory";
import { StockTrendingFactory } from "./StockTrendingFactory";


export class AbstractStockAPIFactory {
    public static getTrendingFactory(): StockTrendingFactory {
        return new StockTrendingFactory();
    }
    public static getStockBasicFactory(): StockBasicDataFactory {
        return new StockBasicDataFactory();
    }
    public static getStockInformationFactory(): StockAPIInformationFactory {
        return new StockAPIInformationFactory();
    }
    public static getStockSearcherFactory(): StockSearcherFactory {
        return new StockSearcherFactory();
    }
}