'use client';

import { useState } from 'react';
import { MarketMovers, PriceChangeInfo } from '@/types/product';
import { ArrowDown, ArrowUp, Sparkles, XCircle, Percent, Tag } from 'lucide-react';

interface MarketMoversCardProps {
  marketMovers: MarketMovers;
  onProductSelect: (hierarchy: string[], productName: string) => void;
}

type MoverCategory = 'topDiscountRate' | 'topDiscountAmount' | 'topLosers' | 'topGainers' | 'newDiscounts' | 'discountsEnded';

const categoryDetails: { [key in MoverCategory]: { title: string; icon: React.ElementType; color: string; dataKey: keyof MarketMovers } } = {
  topDiscountRate: { title: '최고 할인율', icon: Percent, color: 'text-teal-400', dataKey: 'topDiscountRate' },
  topDiscountAmount: { title: '최대 할인가', icon: Tag, color: 'text-cyan-400', dataKey: 'topDiscountAmount' },
  topLosers: { title: '가격 하락', icon: ArrowDown, color: 'text-blue-400', dataKey: 'topLosers' },
  topGainers: { title: '가격 상승', icon: ArrowUp, color: 'text-red-400', dataKey: 'topGainers' },
  newDiscounts: { title: '신규 할인', icon: Sparkles, color: 'text-green-400', dataKey: 'newDiscounts' },
  discountsEnded: { title: '할인 종료', icon: XCircle, color: 'text-yellow-400', dataKey: 'discountsEnded' },
};

const row1Keys: MoverCategory[] = ['topDiscountRate', 'topDiscountAmount', 'newDiscounts'];
const row2Keys: MoverCategory[] = ['topLosers', 'topGainers', 'discountsEnded'];

const MarketMoversCard = ({ marketMovers, onProductSelect }: MarketMoversCardProps) => {
  const [activeTab, setActiveTab] = useState<MoverCategory>('topDiscountRate');
  const activeMovers = marketMovers[activeTab] || [];

  return (
    <div className="liquid-glass flex flex-col p-4 h-full">
      <div className="flex-shrink-0">
        <nav className="flex flex-col gap-2" aria-label="Tabs">
          <div className="flex gap-2">
            {row1Keys.map((key) => {
                const tab = categoryDetails[key];
                return <TabButton key={key} tabKey={key} tab={tab} activeTab={activeTab} setActiveTab={setActiveTab} />
            })}
          </div>
          <div className="flex gap-2">
            {row2Keys.map((key) => {
                const tab = categoryDetails[key];
                return <TabButton key={key} tabKey={key} tab={tab} activeTab={activeTab} setActiveTab={setActiveTab} />
            })}
          </div>
        </nav>
      </div>
      <div className="overflow-y-auto custom-scrollbar flex-grow mt-4">
        <ul>
          {activeMovers.length > 0 ? (
            activeMovers.map((mover) => {
              const formatCurrency = (n: number) => new Intl.NumberFormat('ko-KR').format(n);
              const priceChangePositive = mover.priceChange > 0;
              const changeColor = priceChangePositive ? 'text-red-500' : 'text-blue-500';

              return (
                <li key={mover.prodId} className="animate-fade-in border-b border-border/60 last:border-none">
                  <button 
                    onClick={() => onProductSelect(mover.cphHierarchy, mover.prodName)}
                    className="w-full text-left p-2.5 transition-colors rounded-md hover:bg-muted/50"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1 truncate pr-4">
                        <p className="font-semibold truncate text-sm text-card-foreground">{mover.prodName}</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          정가: {formatCurrency(mover.regularPrice)}원
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                          <p className="font-semibold text-card-foreground text-base">
                              {formatCurrency(mover.currentPrice)}원
                          </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-1.5 text-xs">
                        <p className="text-muted-foreground truncate">{mover.cphHierarchy.join(' › ')}</p>
                        <div className="text-right flex-shrink-0 font-mono">
                            {mover.discountRate > 0 && (
                                <span className="text-green-500">
                                    ▼ {formatCurrency(mover.regularPrice - mover.currentPrice)} (-{mover.discountRate.toFixed(1)}%) <span className="text-muted-foreground text-[0.65rem] leading-[0.8rem]">(정가)</span>
                                </span>
                            )}
                            {isFinite(mover.priceChange) && mover.priceChange !== 0 && mover.discountRate > 0 && <span className="text-muted-foreground/50 mx-1.5">|</span>}
                            {isFinite(mover.priceChange) && mover.priceChange !== 0 && (
                                <span className={`${changeColor}`}>
                                  {priceChangePositive ? '▲' : '▼'} {formatCurrency(Math.abs(mover.priceChange))} ({priceChangePositive ? '+' : ''}{mover.priceChangePercent.toFixed(1)}%) <span className="text-muted-foreground text-[0.65rem] leading-[0.8rem]">(전일)</span>
                                </span>
                            )}
                        </div>
                    </div>
                  </button>
                </li>
              );
            })
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>데이터가 없습니다.</p>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
};

interface TabButtonProps {
  tabKey: MoverCategory;
  tab: { title: string; icon: React.ElementType; color: string; };
  activeTab: MoverCategory;
  setActiveTab: (key: MoverCategory) => void;
}

const TabButton = ({ tabKey, tab, activeTab, setActiveTab }: TabButtonProps) => {
  const { title, icon: Icon, color } = tab;
  const isActive = activeTab === tabKey;
  return (
    <button
      onClick={() => setActiveTab(tabKey)}
      className={`flex-1 whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-opacity-75 flex items-center justify-center border ${
        isActive
          ? 'bg-primary/10 text-primary border-primary/20 shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-transparent'
      }`}
    >
      <Icon className={`w-4 h-4 mr-2 transition-colors ${isActive ? 'text-primary' : ''}`} />
      {title}
    </button>
  );
};

export default MarketMoversCard;
 