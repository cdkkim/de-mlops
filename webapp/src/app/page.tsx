'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProcessedData } from '@/types/product';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import TrendChart from '@/components/TrendChart';
import MarketMoversCard from '@/components/MarketMoversCard';
import DrilldownNavigator from '@/components/DrilldownNavigator';
import TopProgressBar from '@/components/TopProgressBar';

export default function Home() {
  const [data, setData] = useState<ProcessedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [path, setPath] = useState<string[]>(['All']);
  const [dateRange, setDateRange] = useState<number>(14);

  const fetchData = useCallback(async () => {
    const isInitialLoad = data === null;
    
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setIsUpdating(true);
    }
    setError(null);

    try {
      const pathParam = encodeURIComponent(JSON.stringify(path));
      const response = await fetch(`/api/products?path=${pathParam}&days=${dateRange}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const result: ProcessedData = await response.json();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred');
      console.error(e);
    } finally {
      setLoading(false);
      setIsUpdating(false);
    }
  }, [path, dateRange, data]);

  useEffect(() => {
    fetchData();
  }, [path, dateRange]);

  const handleProductSelect = (hierarchy: string[], productName: string) => {
    const newPath = ['All', ...hierarchy, productName];
    setPath(newPath);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen bg-gray-900 text-red-400">Error: {error}</div>;
  }

  if (!data) {
    return <div className="flex justify-center items-center h-screen bg-gray-900 text-gray-500">No data available.</div>;
  }

  const RANGES = [7, 14, 30, 90];

  return (
    <div className="flex flex-col h-screen">
      <TopProgressBar isLoading={isUpdating} />
      <Header lastUpdatedDate={data.lastUpdatedDate} />
      <main className="flex-1 flex flex-col overflow-hidden px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex-shrink-0">
          <DrilldownNavigator 
            drilldownData={data.drilldown} 
            path={path} 
            setPath={setPath} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 items-end mt-6 mb-3">
          <div className="lg:col-span-2 flex justify-between items-end">
            <h3 className="text-xl font-bold tracking-tight">Price Trends</h3>
            <div className="flex items-center space-x-2">
              {RANGES.map(range => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-opacity-75 border ${
                    dateRange === range
                      ? 'bg-primary/10 text-primary border-primary/20 shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-transparent'
                  }`}
                >
                  {range}D
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold tracking-tight">Market Movers</h3>
          </div>
        </div>

        <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <div className="h-full w-full liquid-glass p-4">
              <TrendChart trends={data.trends} />
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col min-h-0">
            <MarketMoversCard 
              marketMovers={data.marketMovers}
              onProductSelect={handleProductSelect}
            />
          </div>
        </div>
      </main>
    </div>
  );
}