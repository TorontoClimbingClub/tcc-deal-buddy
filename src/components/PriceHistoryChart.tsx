import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { ProductPriceHistory } from '@/hooks/usePriceHistory';

interface PriceHistoryChartProps {
  priceHistory: ProductPriceHistory;
  onClose?: () => void;
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ priceHistory, onClose }) => {
  const { historicalPrices, priceRange } = priceHistory;
  
  // Calculate chart dimensions
  const chartHeight = 200;
  const chartWidth = 600;
  const padding = 40;
  
  // Find min and max for scaling
  const prices = historicalPrices.map(p => p.price);
  const minPrice = Math.min(...prices) * 0.9;
  const maxPrice = Math.max(...prices) * 1.1;
  const priceRangeChart = maxPrice - minPrice;
  
  // Scale functions
  const scaleX = (index: number) => {
    return padding + (index * (chartWidth - 2 * padding)) / (historicalPrices.length - 1 || 1);
  };
  
  const scaleY = (price: number) => {
    return chartHeight - padding - ((price - minPrice) / priceRangeChart) * (chartHeight - 2 * padding);
  };
  
  // Create SVG path
  const linePath = historicalPrices
    .map((point, index) => {
      const x = scaleX(index);
      const y = scaleY(point.price);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
  
  // Format currency
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  
  // Calculate price change
  const firstPrice = historicalPrices[0]?.price || 0;
  const lastPrice = historicalPrices[historicalPrices.length - 1]?.price || 0;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? ((priceChange / firstPrice) * 100).toFixed(1) : '0';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{priceHistory.productName}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span>SKU: {priceHistory.productSku}</span>
              <span>•</span>
              <span>Current: {formatPrice(priceHistory.currentPrice)}</span>
            </CardDescription>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Price Statistics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Lowest</p>
            <p className="text-lg font-bold text-green-600">{formatPrice(priceRange.min)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Highest</p>
            <p className="text-lg font-bold text-red-600">{formatPrice(priceRange.max)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Average</p>
            <p className="text-lg font-bold">{formatPrice(priceRange.average)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Change</p>
            <div className="flex items-center justify-center gap-1">
              {priceChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-red-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-600" />
              )}
              <p className={`text-lg font-bold ${priceChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {priceChangePercent}%
              </p>
            </div>
          </div>
        </div>

        {/* Price Chart */}
        <div className="bg-gray-50 rounded-lg p-4">
          <svg width={chartWidth} height={chartHeight} className="w-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(fraction => {
              const y = padding + fraction * (chartHeight - 2 * padding);
              const price = maxPrice - fraction * priceRangeChart;
              return (
                <g key={fraction}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeDasharray="2,2"
                  />
                  <text
                    x={padding - 5}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="12"
                    fill="#6b7280"
                  >
                    {formatPrice(price)}
                  </text>
                </g>
              );
            })}
            
            {/* Price line */}
            <path
              d={linePath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />
            
            {/* Data points */}
            {historicalPrices.map((point, index) => (
              <g key={index}>
                <circle
                  cx={scaleX(index)}
                  cy={scaleY(point.price)}
                  r="4"
                  fill={point.onSale ? '#10b981' : '#3b82f6'}
                  stroke="white"
                  strokeWidth="2"
                />
                {/* Date labels for first, last, and every 3rd point */}
                {(index === 0 || index === historicalPrices.length - 1 || index % 3 === 0) && (
                  <text
                    x={scaleX(index)}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#6b7280"
                  >
                    {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Regular Price</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Sale Price</span>
          </div>
        </div>

        {/* Recent Price Events */}
        <div className="mt-6">
          <h4 className="font-medium text-sm text-gray-700 mb-2">Recent Price Changes</h4>
          <div className="space-y-2">
            {historicalPrices.slice(-5).reverse().map((point, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600">{new Date(point.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatPrice(point.price)}</span>
                  {point.onSale && (
                    <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">
                      Sale
                    </Badge>
                  )}
                  {point.discountPercent > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      -{point.discountPercent}%
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};