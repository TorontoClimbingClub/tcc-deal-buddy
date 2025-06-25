
import React from 'react';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  affiliateUrl: string;
  merchant: string;
  brand?: string;
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
    <div className="group cursor-pointer">
      <div className="relative mb-4" onClick={() => onViewDetails(product)}>
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-64 object-cover bg-gray-100"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-product.svg';
          }}
        />
        {product.discount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1">
            -{product.discount}%
          </div>
        )}
      </div>
      
      <div>
        <div className="mb-1">
          <h3 className="text-gray-900 font-normal group-hover:text-gray-700 transition-colors">
            {product.name}
          </h3>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-gray-900 font-medium">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-gray-400 line-through text-sm">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          <button 
            onClick={handleAffiliateClick}
            className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
          >
            Buy →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
