
import React, { useState, useCallback } from 'react';
import { Bell, TrendingDown, TrendingUp, Target, Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PriceAlertModal } from './PriceAlertModal';
import { useGlobalCart } from '@/contexts/CartContext';
import { usePriceIntelligence } from '@/hooks/usePriceIntelligence';

export interface Product {
  id: string;
  sku: string;
  merchant_id: number;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  retail_price?: number;
  originalPrice?: number;
  imageUrl: string;
  image_url?: string;
  affiliateUrl: string;
  buy_url?: string;
  merchant: string;
  merchant_name?: string;
  brand?: string;
  brand_name?: string;
  category: string;
  rating?: number;
  discount?: number;
  discount_percent?: number;
  // Price intelligence fields
  deal_quality_score?: number;
  price_position_percent?: number;
  price_trend_status?: 'great_price' | 'good_price' | 'regular_price' | 'new_item';
  yearly_low?: number;
  yearly_high?: number;
  avg_30_day_price?: number;
}

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  showPriceIntelligence?: boolean;
  viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = React.memo(({ 
  product, 
  onViewDetails, 
  showPriceIntelligence = false,
  viewMode = 'grid'
}) => {
  const { addToCart, isInCart, getCartItemQuantity } = useGlobalCart();
  const { getProductPriceRecommendations } = usePriceIntelligence();
  const [recommendation, setRecommendation] = useState<unknown>(null);

  // Normalize product properties for compatibility
  const currentPrice = product.sale_price || product.price;
  const originalPrice = product.retail_price || product.originalPrice;
  const imageUrl = product.image_url || product.imageUrl;
  const buyUrl = product.buy_url || product.affiliateUrl;
  const merchantName = product.merchant_name || product.merchant;
  const brandName = product.brand_name || product.brand;
  const discountPercent = product.discount_percent || product.discount;
  const isOnSale = originalPrice && currentPrice < originalPrice;
  const isInCartStatus = product.sku && product.merchant_id ? isInCart(product.sku, product.merchant_id) : false;
  const cartQuantity = product.sku && product.merchant_id ? getCartItemQuantity(product.sku, product.merchant_id) : 0;

  const handleAffiliateClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(buyUrl, '_blank', 'noopener,noreferrer');
  }, [buyUrl]);

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.sku || !product.merchant_id) return;

    await addToCart(product.sku, product.merchant_id);
  }, [product.sku, product.merchant_id, addToCart]);

  const loadPriceRecommendation = useCallback(async () => {
    if (product.sku && product.merchant_id && !recommendation) {
      const rec = await getProductPriceRecommendations(product.sku, product.merchant_id);
      setRecommendation(rec);
    }
  }, [product.sku, product.merchant_id, recommendation, getProductPriceRecommendations]);

  // Price trend indicator component
  const PriceTrendIndicator = () => {
    if (!showPriceIntelligence || !product.price_trend_status) return null;

    switch (product.price_trend_status) {
      case 'great_price':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
            <TrendingDown className="h-3 w-3 mr-1" />
            Great Price
          </Badge>
        );
      case 'good_price':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
            <Target className="h-3 w-3 mr-1" />
            Good Price
          </Badge>
        );
      case 'regular_price':
        return (
          <Badge variant="outline" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            Regular
          </Badge>
        );
      case 'new_item':
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
            <Star className="h-3 w-3 mr-1" />
            New
          </Badge>
        );
      default:
        return null;
    }
  };

  // Deal quality indicator
  const DealQualityIndicator = () => {
    if (!showPriceIntelligence || !product.deal_quality_score) return null;

    const score = product.deal_quality_score;
    let colorClass = 'bg-gray-500';
    let label = 'Unknown';
    
    if (score >= 80) {
      colorClass = 'bg-green-500';
      label = 'Excellent';
    } else if (score >= 60) {
      colorClass = 'bg-blue-500';
      label = 'Good';
    } else if (score >= 40) {
      colorClass = 'bg-yellow-500';
      label = 'Fair';
    } else {
      colorClass = 'bg-red-500';
      label = 'Poor';
    }

    return (
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${colorClass}`} />
        <span className="text-xs text-gray-600">{score}% {label}</span>
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <div className="group cursor-pointer bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
        <div className="flex p-4 gap-4">
          {/* Image */}
          <div className="relative flex-shrink-0" onClick={() => onViewDetails(product)}>
            <img
              src={imageUrl}
              alt={product.name}
              className="w-16 h-16 object-cover bg-gray-100 rounded-lg image-crisp"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-product.svg';
              }}
            />
            
            {/* Discount badge */}
            {discountPercent && discountPercent > 0 && (
              <Badge variant="destructive" className="text-xs absolute -top-2 -right-2">
                -{discountPercent}%
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Brand and merchant */}
                <div className="flex items-center gap-2 mb-1">
                  {brandName && (
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      {brandName}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{merchantName}</span>
                </div>

                {/* Product name */}
                <h3 className="text-gray-900 font-medium group-hover:text-gray-700 transition-colors text-sm mb-2 line-clamp-2">
                  {product.name}
                </h3>

                {/* Price intelligence info */}
                {showPriceIntelligence && (
                  <div className="mb-2 flex items-center gap-2">
                    <DealQualityIndicator />
                    <PriceTrendIndicator />
                  </div>
                )}

                {/* Pricing */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-gray-900">
                    ${currentPrice.toFixed(2)}
                  </span>
                  {originalPrice && isOnSale && (
                    <span className="text-sm text-gray-500 line-through">
                      ${originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                {product.sku && product.merchant_id && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAddToCart}
                      className={isInCartStatus ? 'bg-green-50 border-green-200' : ''}
                    >
                      <ShoppingCart 
                        className={`h-4 w-4 ${isInCartStatus ? 'text-green-600' : 'text-gray-500'}`} 
                      />
                      {cartQuantity > 0 && (
                        <span className="ml-1 text-xs font-medium">{cartQuantity}</span>
                      )}
                    </Button>

                    <PriceAlertModal
                      productSku={product.sku}
                      merchantId={product.merchant_id}
                      productName={product.name}
                      currentPrice={currentPrice}
                    >
                      <Button size="sm" variant="outline">
                        <Bell className="h-4 w-4 text-gray-500" />
                      </Button>
                    </PriceAlertModal>
                  </>
                )}
                
                <Button
                  onClick={handleAffiliateClick}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="group cursor-pointer bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="relative mb-3" onClick={() => onViewDetails(product)}>
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-32 object-cover bg-gray-100 rounded-t-lg image-crisp"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-product.svg';
          }}
        />
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {discountPercent && discountPercent > 0 && (
            <Badge variant="destructive" className="text-xs">
              -{discountPercent}% OFF
            </Badge>
          )}
          <PriceTrendIndicator />
        </div>

        {/* Top right actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {product.sku && product.merchant_id && (
            <>
              <Button
                size="sm"
                variant="outline"
                className={`p-1 bg-white/90 hover:bg-white h-6 w-6 ${isInCartStatus ? 'bg-green-50 border-green-200' : ''}`}
                onClick={handleAddToCart}
              >
                <ShoppingCart 
                  className={`h-3 w-3 ${isInCartStatus ? 'text-green-600' : 'text-gray-500'}`} 
                />
              </Button>
              {cartQuantity > 0 && (
                <div className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartQuantity}
                </div>
              )}

              <PriceAlertModal
                productSku={product.sku}
                merchantId={product.merchant_id}
                productName={product.name}
                currentPrice={currentPrice}
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="p-1 bg-white/90 hover:bg-white h-6 w-6"
                >
                  <Bell className="h-3 w-3 text-gray-500" />
                </Button>
              </PriceAlertModal>
            </>
          )}
        </div>
      </div>
      
      <div className="p-3">
        {/* Brand and merchant */}
        <div className="flex items-center justify-between mb-1">
          {brandName && (
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {brandName}
            </span>
          )}
          <span className="text-xs text-gray-400">{merchantName}</span>
        </div>

        {/* Product name */}
        <div className="mb-2">
          <h3 className="text-gray-900 font-medium group-hover:text-gray-700 transition-colors text-sm overflow-hidden line-clamp-2">
            {product.name}
          </h3>
        </div>

        {/* Price intelligence info */}
        {showPriceIntelligence && (
          <div className="mb-2 space-y-1">
            <DealQualityIndicator />
            
            {product.price_position_percent && (
              <div className="text-xs text-gray-500">
                Price position: {product.price_position_percent}% of yearly range
              </div>
            )}

            {product.yearly_low && product.yearly_high && (
              <div className="text-xs text-gray-500">
                Range: ${product.yearly_low.toFixed(2)} - ${product.yearly_high.toFixed(2)}
              </div>
            )}
          </div>
        )}
        
        {/* Price and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-gray-900 font-medium text-lg">
              ${currentPrice.toFixed(2)}
            </span>
            {originalPrice && isOnSale && (
              <span className="text-gray-400 line-through text-sm">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          <Button 
            onClick={handleAffiliateClick}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-xs px-2"
          >
            Buy
          </Button>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
