'use client';
import { PriceTrend } from '@/types/product';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface TrendChartProps {
    trends: PriceTrend[];
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const productCount = payload[0].payload.productCount;
    return (
      <div className="p-2 bg-card/80 border border-border rounded-lg text-sm backdrop-blur-sm shadow-lg">
        <div className="flex justify-between items-center font-bold mb-2">
          <p className="label text-card-foreground">{`${label}`}</p>
          {productCount > 0 && (
            <p className="text-xs text-muted-foreground ml-4">
              총 {productCount}개
            </p>
          )}
        </div>
        {payload.map((pld: any, index: number) => {
            const trendName = pld.name;
            const regularPrice = pld.payload[`${trendName}_regularPrice`];
            const discountPrice = pld.value;
            const individualProductCount = pld.payload[`${trendName}_productCount`];
            const discountRate = regularPrice && regularPrice > 0 
                ? ((regularPrice - discountPrice) / regularPrice) * 100 
                : 0;

            return (
                <div key={index} className="mt-1">
                    <span style={{ color: pld.color }}>{trendName}: </span>
                    <span className="font-semibold text-card-foreground">
                      {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(discountPrice)}
                    </span>
                    {individualProductCount > 0 && (
                        <span className="text-xs text-muted-foreground ml-2">({individualProductCount}개)</span>
                    )}
                    {discountRate > 0.01 && (
                         <span className="text-xs text-green-500 ml-2">
                            ({discountRate.toFixed(1)}%↓)
                        </span>
                    )}
                </div>
            );
        })}
      </div>
    );
  }
  return null;
};

export default function TrendChart({ trends }: TrendChartProps) {
    if (!trends || trends.length === 0) {
        return <div className="flex items-center justify-center h-full text-muted-foreground">No trend data available for this selection.</div>;
    }

    const allDates = [...new Set(trends.flatMap(t => t.trend.map(d => d.date)))].sort();
    
    const chartData = allDates.map(date => {
        const entry: { [key: string]: any } = { date };
        let totalCount = 0;
        trends.forEach(trend => {
            const dataPoint = trend.trend.find(d => d.date === date);
            entry[trend.name] = dataPoint ? dataPoint.avgDiscountedPrice : null;
            entry[`${trend.name}_regularPrice`] = dataPoint ? dataPoint.avgRegularPrice : null;
            entry[`${trend.name}_productCount`] = dataPoint ? dataPoint.productCount : 0;
            if (dataPoint) {
                totalCount += dataPoint.productCount;
            }
        });
        entry.productCount = totalCount;
        return entry;
    });

    return (
        <div className="relative w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} />
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.6)" />
                    <Tooltip content={<CustomTooltip />} />
                    {trends.map((trend, index) => (
                        <Line 
                            key={trend.name}
                            type="monotone" 
                            dataKey={trend.name} 
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={2}
                            connectNulls
                            dot={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
} 