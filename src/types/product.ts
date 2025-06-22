export interface Product {
    date: string;
    prodId: string;
    cphL1: string;
    cphL2: string;
    cphL3: string;
    cphL4: string;
    prodName: string;
    regularPrice: number;
    discountedPrice: number;
    discountRate: number;
}

export interface PriceChangeInfo {
    prodId: string;
    prodName: string;
    cphHierarchy: string[];
    previousPrice: number;
    currentPrice: number;
    priceChange: number;
    priceChangePercent: number;
    regularPrice: number;
    discountRate: number;
    previousDiscountRate: number;
}

export interface MarketMovers {
    topDiscountRate: PriceChangeInfo[];
    topDiscountAmount: PriceChangeInfo[];
    topGainers: PriceChangeInfo[];
    topLosers: PriceChangeInfo[];
    newDiscounts: PriceChangeInfo[];
    discountsEnded: PriceChangeInfo[];
}

export interface DrilldownItem {
    name: string;
    count: number;
    hasChildren: boolean;
}

export interface DrilldownData {
    level: number;
    items: DrilldownItem[];
}

export interface DailyAveragePrice {
    date: string;
    avgDiscountedPrice: number;
    avgRegularPrice: number;
}

export interface PriceTrend {
    name: string;
    trend: DailyAveragePrice[];
}

export interface ProcessedData {
    lastUpdatedDate: string;
    trends: PriceTrend[];
    marketMovers: MarketMovers;
    drilldown: DrilldownData;
} 