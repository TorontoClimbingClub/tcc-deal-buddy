
import React from 'react';
import { X, ExternalLink, ShoppingCart, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from './ProductCard';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  if (!product) return null;

  const handleAffiliateClick = () => {
    window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {product.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="relative">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-80 object-cover rounded-lg"
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
