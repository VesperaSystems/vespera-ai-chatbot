import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react';

interface ChartStats {
  symbol: string;
  period: string;
  current_price: number;
  price_change: number;
  price_change_pct: number;
  high: number;
  low: number;
  volume_avg: number;
  data_points: number;
  date_range: string;
}

interface ChartDetails {
  symbol: string;
  period: string;
  interval: string;
  chartType: string;
  volume: boolean;
  style: string;
  title: string;
  annotations: number;
  indicators: number;
}

interface ChartDisplayProps {
  chart: {
    data: string;
    type: string;
    filename: string;
  };
  stats: ChartStats;
  details: ChartDetails;
  message: string;
}

export function ChartDisplay({
  chart,
  stats,
  details,
  message,
}: ChartDisplayProps) {
  const isPositive = stats.price_change_pct >= 0;
  const priceChangeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const PriceChangeIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {details.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {details.chartType.toUpperCase()}
            </Badge>
            {details.volume && (
              <Badge variant="secondary" className="text-xs">
                Volume
              </Badge>
            )}
            {details.indicators > 0 && (
              <Badge variant="secondary" className="text-xs">
                {details.indicators} Indicators
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Chart Image */}
        <div className="relative w-full h-96 bg-gray-50 rounded-lg overflow-hidden">
          <Image
            src={`data:${chart.type};base64,${chart.data}`}
            alt={`${stats.symbol} Stock Chart`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Current Price</p>
            <p className="text-lg font-semibold">
              ${stats.current_price.toFixed(2)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-500">Change</p>
            <div className="flex items-center gap-1">
              <PriceChangeIcon className={`size-4 ${priceChangeColor}`} />
              <span className={`text-lg font-semibold ${priceChangeColor}`}>
                {isPositive ? '+' : ''}
                {stats.price_change.toFixed(2)} ({isPositive ? '+' : ''}
                {stats.price_change_pct.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-500">High</p>
            <p className="text-lg font-semibold">${stats.high.toFixed(2)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-500">Low</p>
            <p className="text-lg font-semibold">${stats.low.toFixed(2)}</p>
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Period</p>
              <p className="font-medium">{stats.period}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Activity className="size-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Avg Volume</p>
              <p className="font-medium">{stats.volume_avg.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Data Points</p>
              <p className="font-medium">{stats.data_points}</p>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="text-center text-sm text-gray-500 pt-2 border-t">
          {stats.date_range}
        </div>

        {/* Chart Configuration */}
        <div className="text-xs text-gray-400 space-y-1 pt-2 border-t">
          <p>
            Chart Type: {details.chartType} | Style: {details.style} | Interval:{' '}
            {details.interval}
          </p>
          {details.annotations > 0 && <p>Annotations: {details.annotations}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
