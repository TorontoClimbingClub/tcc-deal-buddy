import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp, DollarSign, Calendar, Clock } from 'lucide-react';
import { ProductPriceHistory } from '@/hooks/usePriceHistory';

interface PriceHistoryChartProps {
  priceHistory: ProductPriceHistory;
  onClose?: () => void;
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ priceHistory, onClose }) => {
  const { historicalPrices, priceRange, currentPrice } = priceHistory;
  
  // Calculate chart dimensions
  const chartHeight = 200;
  const chartWidth = 600;
  const padding = 40;
  
  // Find min and max for scaling, including current price for proper chart scaling
  const historicalPricesOnly = historicalPrices.map(p => p.price);
  const allPrices = [...historicalPricesOnly, currentPrice.price].filter(p => p > 0);
  const minPrice = Math.min(...allPrices) * 0.9;
  const maxPrice = Math.max(...allPrices) * 1.1;
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
  
  // Calculate price change from historical data to current price
  const lastHistoricalPrice = historicalPrices[historicalPrices.length - 1]?.price || currentPrice.price;
  const priceChange = currentPrice.price - lastHistoricalPrice;
  const priceChangePercent = lastHistoricalPrice > 0 ? ((priceChange / lastHistoricalPrice) * 100).toFixed(1) : '0';
  
  // Calculate current price position for chart indicator
  const currentPriceY = chartHeight - padding - ((currentPrice.price - minPrice) / priceRangeChart) * (chartHeight - 2 * padding);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{priceHistory.productName}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span>SKU: {priceHistory.productSku}</span>
            </CardDescription>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          )}
        </div>
        
        {/* Current Price Display */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Current Price
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-bold text-blue-900">
                  {formatPrice(currentPrice.price)}
                </span>
                {currentPrice.isOnSale && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(currentPrice.retailPrice)}
                    </span>
                    <Badge className="bg-green-500 text-white">
                      -{currentPrice.discountPercent}% OFF
                    </Badge>
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                {priceChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-red-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-600" />
                )}
                <span className={`text-lg font-bold ${priceChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {priceChangePercent}%
                </span>
              </div>
              <p className="text-xs text-gray-500">vs last historical</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Historical Price Statistics */}
        <div className="mb-6">
          <h4 className="font-medium text-sm text-gray-700 mb-3">Historical Price Statistics</h4>
          {historicalPrices.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Historical Low</p>
                <p className="text-lg font-bold text-green-600">{formatPrice(priceRange.min)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Historical High</p>
                <p className="text-lg font-bold text-red-600">{formatPrice(priceRange.max)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Historical Average</p>
                <p className="text-lg font-bold">{formatPrice(priceRange.average)}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded">
              No historical price data available yet
            </p>
          )}
        </div>

        {/* Price Chart */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-sm text-gray-700 mb-2">Historical Price Trend</h4>
          {historicalPrices.length > 0 ? (
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
              
              {/* Current price indicator line */}
              <line
                x1={padding}
                x2={chartWidth - padding}
                y1={currentPriceY}
                y2={currentPriceY}
                stroke="#1d4ed8"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.7"
              />
              <text
                x={chartWidth - padding + 5}
                y={currentPriceY + 4}
                fontSize="12"
                fill="#1d4ed8"
                fontWeight="bold"
              >
                Current: {formatPrice(currentPrice.price)}
              </text>
              
              {/* Historical price line */}
              {historicalPrices.length > 1 && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#6b7280"
                  strokeWidth="2"
                />
              )}
              
              {/* Historical data points */}
              {historicalPrices.map((point, index) => (
                <g key={index}>
                  <circle
                    cx={scaleX(index)}
                    cy={scaleY(point.price)}
                    r="4"
                    fill={point.onSale ? '#10b981' : '#6b7280'}
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
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg">No historical data available</p>
                <p className="text-sm">Price tracking will begin with future syncs</p>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        {historicalPrices.length > 0 && (
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Historical Prices</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Sale Prices</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-blue-600 border-dashed border-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Current Price</span>
            </div>
          </div>
        )}

        {/* Recent Price Events */}
        {historicalPrices.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Recent Historical Price Changes</h4>
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
        )}
      </CardContent>
    </Card>
  );
};