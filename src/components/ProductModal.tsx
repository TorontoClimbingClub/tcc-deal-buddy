
import React, { useEffect, useState } from 'react';
import { X, ExternalLink, ShoppingCart, Star, TrendingDown, TrendingUp, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from './ProductCard';
import { usePriceHistory, type ProductPriceHistory } from '../hooks/usePriceHistory';
import { NewSales } from '../hooks/useNewSales';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  saleContext?: NewSales; // Optional context about why this is a new sale
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, saleContext }) => {
  const { fetchPriceHistory, loading: priceLoading } = usePriceHistory();
  const [priceHistory, setPriceHistory] = useState<ProductPriceHistory | null>(null);
  
  // Fetch price history when modal opens
  useEffect(() => {
    console.log('🔍 ProductModal: Price history effect triggered');
    console.log('🔍 isOpen:', isOpen);
    console.log('🔍 product:', product);
    console.log('🔍 saleContext:', saleContext);
    
    if (isOpen && product && saleContext?.product_sku && saleContext?.merchant_id) {
      console.log('🔍 ProductModal: Fetching price history for:', saleContext.product_sku, saleContext.merchant_id);
      fetchPriceHistory(saleContext.product_sku, saleContext.merchant_id)
        .then((result) => {
          console.log('🔍 ProductModal: Price history result:', result);
          setPriceHistory(result);
        })
        .catch(console.error);
    } else {
      console.log('🔍 ProductModal: Price history conditions not met');
    }
  }, [isOpen, product, saleContext, fetchPriceHistory]);

  if (!product) return null;

  const handleAffiliateClick = () => {
    window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  const getSaleContextMessage = (): string => {
    if (!saleContext) return '';
    
    switch (saleContext.type) {
      case 'new_deal':
        return 'This product just went on sale for the first time!';
      case 'price_drop':
        return `Price dropped by ${saleContext.discount_percent || 0}% from $${saleContext.previous_price?.toFixed(2) || '0.00'}`;
      case 'sale_start':
        return 'Sale just started - limited time offer!';
      default:
        return 'New deal detected!';
    }
  };

  const formatPriceChange = (current: number, previous?: number): { text: string; trend: 'up' | 'down' | 'neutral' } => {
    if (!previous) return { text: 'New price', trend: 'neutral' };
    
    const change = current - previous;
    const percent = Math.abs((change / previous) * 100);
    
    if (change < 0) {
      return { text: `-$${Math.abs(change).toFixed(2)} (-${percent.toFixed(1)}%)`, trend: 'down' };
    } else if (change > 0) {
      return { text: `+$${change.toFixed(2)} (+${percent.toFixed(1)}%)`, trend: 'up' };
    }
    return { text: 'No change', trend: 'neutral' };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {product.name}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Product details and pricing information
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="relative">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-80 object-contain bg-gray-50 rounded-lg image-quality"
              loading="eager"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-product.svg';
              }}
            />
            {product.discount && (
              <Badge className="absolute top-4 left-4 bg-red-500 text-white text-lg px-3 py-1">
                -{product.discount}% OFF
              </Badge>
            )}
          </div>
          
          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <Badge variant="outline" className="mb-2">
                {product.merchant}
              </Badge>
              <Badge variant="secondary" className="ml-2">
                {product.category}
              </Badge>
            </div>
            
            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400 text-lg">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < Math.floor(product.rating!) ? 'fill-current' : ''}`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  ({product.rating.toFixed(1)}/5)
                </span>
              </div>
            )}
            
            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-green-600">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            
            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Sale Context - Why this is a new sale */}
            {saleContext && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Why this is a new sale</h3>
                </div>
                <p className="text-blue-800 mb-2">{getSaleContextMessage()}</p>
                {saleContext.previous_price && saleContext.current_price && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-blue-700">Price change:</span>
                    {(() => {
                      const change = formatPriceChange(saleContext.current_price, saleContext.previous_price);
                      return (
                        <div className="flex items-center gap-1">
                          {change.trend === 'down' && <TrendingDown className="w-4 h-4 text-green-600" />}
                          {change.trend === 'up' && <TrendingUp className="w-4 h-4 text-red-600" />}
                          <span className={`text-sm font-medium ${
                            change.trend === 'down' ? 'text-green-600' : 
                            change.trend === 'up' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {change.text}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                )}
                <p className="text-xs text-blue-600 mt-2">
                  Sale detected: {saleContext.time}
                </p>
              </div>
            )}

            {/* Price History */}
            {priceHistory && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Price History</h3>
                
                {/* Price Range Summary */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Lowest</p>
                    <p className="font-semibold text-green-600">${priceHistory.priceRange.min.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Average</p>
                    <p className="font-semibold text-gray-700">${priceHistory.priceRange.average.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Highest</p>
                    <p className="font-semibold text-red-600">${priceHistory.priceRange.max.toFixed(2)}</p>
                  </div>
                </div>

                {/* Recent Price Points */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Recent Price Changes</h4>
                  <div className="max-h-24 overflow-y-auto space-y-1">
                    {priceHistory.historicalPrices.slice(-5).reverse().map((point, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          {new Date(point.date).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${point.onSale ? 'text-green-600' : 'text-gray-900'}`}>
                            ${point.price.toFixed(2)}
                          </span>
                          {point.onSale && (
                            <Badge variant="secondary" className="text-xs">
                              {point.discountPercent}% off
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {priceLoading && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600 text-center">Loading price history...</p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                size="lg" 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleAffiliateClick}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Buy Now
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleAffiliateClick}
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                View on {product.merchant}
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              * This is an affiliate link. We may earn a commission if you make a purchase.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
