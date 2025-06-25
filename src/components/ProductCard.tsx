
import React from 'react';
import { ShoppingCart, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  affiliateUrl: string;
  merchant: string;
  category: string;
  rating?: number;
  discount?: number;
}

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const handleAffiliateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white border-gray-200">
      <div className="relative overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          onClick={() => onViewDetails(product)}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-product.svg';
          }}
        />
        {product.discount && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white">
            -{product.discount}%
          </Badge>
        )}
        <Button
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-gray-800 hover:bg-white"
          onClick={handleAffiliateClick}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>
      
      <CardContent className="p-4">
        <div className="mb-2">
          <Badge variant="secondary" className="text-xs mb-2">
            {product.merchant}
          </Badge>
          <h3 
            className="font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors"
            onClick={() => onViewDetails(product)}
          >
            {product.name}
          </h3>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-green-600">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleAffiliateClick}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Buy Now
          </Button>
        </div>
        
        {product.rating && (
          <div className="flex items-center mt-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.floor(product.rating!) ? "★" : "☆"}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-1">
              ({product.rating.toFixed(1)})
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;
export type { Product };
