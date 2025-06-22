import fs from 'fs';
import path from 'path';
import Papa, { ParseResult } from 'papaparse';
import { Product, ProcessedData, MarketMovers, DrilldownItem, PriceChangeInfo, PriceTrend, DailyAveragePrice } from '@/types/product';

const CATEGORY_ORDER = ['iPhone', 'iPad', 'Mac', 'Watch', 'AirPods', 'Accessories'];
const CPH_LEVELS: (keyof Product)[] = ['cphL1', 'cphL2', 'cphL3', 'cphL4'];
const DRILLDOWN_LEVELS: (keyof Product | 'prodName')[] = [...CPH_LEVELS, 'prodName'];
const MARKET_MOVERS_LIMIT = 50;

const { dateMap, recentDates } = (() => {
  try {
    const csvPath = path.join(process.cwd(), 'input.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    
    interface RawCsvProduct {
        [key: string]: string;
    }

    const parseResult: ParseResult<RawCsvProduct> = Papa.parse<RawCsvProduct>(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string): string => header.trim(),
    });

    const products: Product[] = parseResult.data.map((item: RawCsvProduct): Product => {
        const regularPrice = parseFloat(String(item['REGULAR PRICE'] || '0').trim()) || 0;
        const discountedPrice = parseFloat(String(item['DISCOUNTED PRICE'] || '0').trim()) || 0;
        
        const discountRate = regularPrice > 0 && regularPrice > discountedPrice
            ? ((regularPrice - discountedPrice) / regularPrice) * 100
            : 0;

        return {
            date: String(item['DATE'] || '').trim(),
            prodId: String(item['PROD ID'] || '').trim(),
            cphL1: String(item['CPH L1'] || '').trim(),
            cphL2: String(item['CPH L2'] || '').trim(),
            cphL3: String(item['CPH L3'] || '').trim(),
            cphL4: String(item['CPH L4'] || '').trim(),
            prodName: String(item['PROD NAME'] || '').trim(),
            regularPrice,
            discountedPrice,
            discountRate,
        }
    }).filter((p: Product) => p.date && p.prodId);

    const dateMap = new Map<string, Product[]>();
    for (const p of products) {
        if (!dateMap.has(p.date)) dateMap.set(p.date, []);
        dateMap.get(p.date)!.push(p);
    }
    const recentDates = Array.from(dateMap.keys()).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    return { dateMap, recentDates };
  } catch (error) {
    console.error('Failed to initialize data service:', error);
    return { dateMap: new Map<string, Product[]>(), recentDates: [] as string[] };
  }
})();

function getMarketMovers(hierarchy: string[]): MarketMovers {
  if (recentDates.length < 2) return { topDiscountRate: [], topDiscountAmount: [], topLosers: [], topGainers: [], newDiscounts: [], discountsEnded: [] };
  
  const filterProductsByHierarchy = (products: Product[]): Product[] => {
    if (!hierarchy || hierarchy.length === 0) {
      return products;
    }
    return products.filter(p => {
      for (let i = 0; i < hierarchy.length; i++) {
        if (p[DRILLDOWN_LEVELS[i] as keyof Product] !== hierarchy[i]) {
          return false;
        }
      }
      return true;
    });
  };

  const latestProducts = filterProductsByHierarchy(dateMap.get(recentDates[0])!);
  const previousProducts = filterProductsByHierarchy(dateMap.get(recentDates[1])!);
  
  const latestProductsMap = new Map(latestProducts.map(p => [p.prodId, p]));
  const previousProductsMap = new Map(previousProducts.map(p => [p.prodId, p]));
  
  const enrichedProducts = Array.from(latestProductsMap.values()).map(p => {
    const prevProd = previousProductsMap.get(p.prodId);
    return {
      ...p,
      priceChange: prevProd ? p.discountedPrice - prevProd.discountedPrice : 0,
      discountAmount: p.regularPrice - p.discountedPrice,
      priceChangePercent: prevProd?.discountedPrice ? ((p.discountedPrice - prevProd.discountedPrice) / prevProd.discountedPrice) * 100 : 0,
      previousPrice: prevProd?.discountedPrice || p.discountedPrice,
      previousDiscountRate: prevProd?.discountRate || 0,
      previousRegularPrice: prevProd?.regularPrice || 0,
      previousDiscountedPrice: prevProd?.discountedPrice || 0,
    };
  });

  const toPriceChangeInfo = (p: typeof enrichedProducts[0]): PriceChangeInfo => ({
    prodId: p.prodId, prodName: p.prodName,
    cphHierarchy: CPH_LEVELS.map(level => p[level] as string).filter(Boolean),
    previousPrice: p.previousPrice, currentPrice: p.discountedPrice,
    priceChange: p.priceChange, priceChangePercent: p.priceChangePercent,
    regularPrice: p.regularPrice, discountRate: p.discountRate, previousDiscountRate: p.previousDiscountRate,
  });

  return {
    topDiscountRate: enrichedProducts.filter(p => p.discountRate > 0).sort((a,b) => b.discountRate - a.discountRate).slice(0, MARKET_MOVERS_LIMIT).map(toPriceChangeInfo),
    topDiscountAmount: enrichedProducts.filter(p => p.discountAmount > 0).sort((a,b) => b.discountAmount - a.discountAmount).slice(0, MARKET_MOVERS_LIMIT).map(toPriceChangeInfo),
    topLosers: enrichedProducts.filter(p => p.priceChange < 0).sort((a, b) => a.priceChangePercent - b.priceChangePercent).slice(0, MARKET_MOVERS_LIMIT).map(toPriceChangeInfo),
    topGainers: enrichedProducts.filter(p => p.priceChange > 0).sort((a, b) => b.priceChangePercent - a.priceChangePercent).slice(0, MARKET_MOVERS_LIMIT).map(toPriceChangeInfo),
    newDiscounts: enrichedProducts.filter(p => 
        p.discountedPrice < p.regularPrice && // Today is discounted
        p.previousDiscountedPrice === p.previousRegularPrice && // Yesterday was not
        p.previousRegularPrice > 0 // Yesterday's data exists
    ).sort((a, b) => b.discountRate - a.discountRate).slice(0, MARKET_MOVERS_LIMIT).map(toPriceChangeInfo),
    discountsEnded: enrichedProducts.filter(p => p.discountRate === 0 && p.previousDiscountRate > 0).sort((a, b) => b.priceChange - a.priceChange).slice(0, MARKET_MOVERS_LIMIT).map(toPriceChangeInfo),
  };
}

function getDrilldownItems(hierarchy: string[], allProds: Product[]): DrilldownItem[] {
  const currentLevelIndex = hierarchy.length;
  if (currentLevelIndex >= DRILLDOWN_LEVELS.length) {
    return []; // End of the line
  }

  // 1. Filter products to match the current path (e.g., ['iPhone', 'iPhone 15 Pro'])
  let prodsInCurrentPath = allProds;
  for (let i = 0; i < hierarchy.length; i++) {
    const levelKey = DRILLDOWN_LEVELS[i] as keyof Product;
    prodsInCurrentPath = prodsInCurrentPath.filter(p => p[levelKey] === hierarchy[i]);
  }
  
  const levelToGetItemsFrom = DRILLDOWN_LEVELS[currentLevelIndex];
  const nextLevelIndex = currentLevelIndex + 1;
  const nextLevelKey = nextLevelIndex < DRILLDOWN_LEVELS.length ? DRILLDOWN_LEVELS[nextLevelIndex] as keyof Product : undefined;

  // 2. Find unique item names for the next level down.
  const itemMap = new Map<string, { count: number; hasChildren: boolean }>();

  for (const product of prodsInCurrentPath) {
    const itemName = product[levelToGetItemsFrom] as string;
    if (itemName) {
      if (!itemMap.has(itemName)) {
        // 3. For each unique item, check if it has children.
        // It has children if ANY product with this name also has a valid value for the NEXT level.
        const hasChildren = nextLevelKey 
          ? prodsInCurrentPath.some(p => p[levelToGetItemsFrom] === itemName && p[nextLevelKey])
          : false;
        itemMap.set(itemName, { count: 0, hasChildren });
      }
      itemMap.get(itemName)!.count++;
    }
  }

  // 4. Convert map to array and sort.
  const items: DrilldownItem[] = Array.from(itemMap.entries()).map(([name, data]) => ({ name, ...data }));
  
  if (levelToGetItemsFrom === 'cphL1') {
    return items.sort((a,b) => (CATEGORY_ORDER.indexOf(a.name) - CATEGORY_ORDER.indexOf(b.name)));
  }
  return items.sort((a, b) => a.name.localeCompare(b.name));
}

function getPriceTrends(hierarchy: string[], drilldownItems: DrilldownItem[], days: number = 14): PriceTrend[] {
    const datesForTrend = recentDates.slice(0, days).reverse();
    if (datesForTrend.length === 0) return [];
    
    let trendCandidates: string[] = drilldownItems.map(item => item.name);
    let isTerminal = false;

    if (trendCandidates.length === 0 && hierarchy.length > 0) {
        trendCandidates = [hierarchy[hierarchy.length - 1]];
        isTerminal = true;
    }

    const trends: PriceTrend[] = [];
    for(const candidate of trendCandidates) {
        const newHierarchy = isTerminal ? hierarchy : [...hierarchy, candidate];
        const trend: DailyAveragePrice[] = [];
        for (const date of datesForTrend) {
            const prodsOnDate = dateMap.get(date) || [];
            let filteredProds = prodsOnDate.filter(p => {
                for (let i = 0; i < newHierarchy.length; i++) {
                    if (p[DRILLDOWN_LEVELS[i] as keyof Product] !== newHierarchy[i]) return false;
                }
                return true;
            });

            if(filteredProds.length > 0) {
                const totalDiscounted = filteredProds.reduce((acc, p) => acc + p.discountedPrice, 0);
                const totalRegular = filteredProds.reduce((acc, p) => acc + p.regularPrice, 0);
                trend.push({ 
                  date, 
                  avgDiscountedPrice: totalDiscounted / filteredProds.length,
                  avgRegularPrice: totalRegular / filteredProds.length 
                });
            }
        }
        if(trend.length > 0) trends.push({ name: candidate, trend });
    }
    return trends;
}

export function getProcessedDataForPath(path: string[], days: number = 14): ProcessedData {
  if (recentDates.length === 0) throw new Error("No data available from source.");
  
  const hierarchy = path.slice(1);
  const latestProds = dateMap.get(recentDates[0])!;
  const drilldownItems = getDrilldownItems(hierarchy, latestProds);

  return {
    lastUpdatedDate: recentDates[0],
    drilldown: { level: hierarchy.length + 1, items: drilldownItems },
    trends: getPriceTrends(hierarchy, drilldownItems, days),
    marketMovers: getMarketMovers(hierarchy),
  };
} 