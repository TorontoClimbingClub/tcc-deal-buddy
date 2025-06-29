import React from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGlobalCart } from '@/contexts/CartContext';

interface CartPageProps {
  className?: string;
}

export const CartPage: React.FC<CartPageProps> = ({ className }) => {
  const {
    cartItems,
    cartSummary,
    loading,
    hasItems,
    totalItems,
    totalSavings,
    cartTotal,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useGlobalCart();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateItemSavings = (item: any) => {
    if (!item.product.retail_price || !item.product.sale_price) return 0;
    return (item.product.retail_price - item.product.sale_price) * item.quantity;
  };

  const calculateItemTotal = (item: any) => {
    return item.product.sale_price * item.quantity;
  };

  const handleQuantityChange = async (sku: string, merchantId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(sku, merchantId);
    } else {
      await updateQuantity(sku, merchantId, newQuantity);
    }
  };

  const handleRemoveItem = async (sku: string, merchantId: number) => {
    await removeFromCart(sku, merchantId);
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to remove all items from your cart?')) {
      await clearCart();
    }
  };

  const handleBuyNow = (buyUrl: string) => {
    window.open(buyUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-gray-500">Loading cart...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart
            {hasItems && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 ml-2">
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {hasItems 
              ? `Manage your cart items and see total savings`
              : 'Your cart is empty. Browse products to add items.'
            }
          </CardDescription>
        </CardHeader>
        
        {hasItems && (
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {totalItems} item{totalItems !== 1 ? 's' : ''} in your cart
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {!hasItems ? (
        /* Empty Cart State */
        <Card>
          <CardContent className="p-12">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-4">
                  Browse our products and add items to your cart to start saving money!
                </p>
                <Button
                  onClick={() => window.location.hash = 'all-products'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Browse Products
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-4">
            {cartItems.map((item) => {
              const itemSavings = calculateItemSavings(item);
              const itemTotal = calculateItemTotal(item);
              const originalTotal = item.product.retail_price ? item.product.retail_price * item.quantity : itemTotal;

              return (
                <Card key={`${item.product_sku}-${item.merchant_id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-product.svg';
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              {item.product.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-gray-500">
                                {item.product.merchant_name}
                              </span>
                              {item.product.brand_name && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-sm text-gray-500">
                                    {item.product.brand_name}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Pricing */}
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-xl font-bold text-gray-900">
                                {formatCurrency(item.product.sale_price)}
                              </span>
                              {item.product.retail_price && item.product.retail_price > item.product.sale_price && (
                                <span className="text-lg text-gray-500 line-through">
                                  {formatCurrency(item.product.retail_price)}
                                </span>
                              )}
                              {itemSavings > 0 && (
                                <Badge variant="destructive" className="bg-green-100 text-green-800">
                                  Save {formatCurrency(itemSavings / item.quantity)} each
                                </Badge>
                              )}
                            </div>

                            {/* Quantity and Total */}
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Qty:</span>
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleQuantityChange(item.product_sku, item.merchant_id, item.quantity - 1)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-12 text-center text-sm font-medium">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleQuantityChange(item.product_sku, item.merchant_id, item.quantity + 1)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="text-sm text-gray-600">
                                Subtotal: 
                                <span className="font-medium text-gray-900 ml-1">
                                  {formatCurrency(itemTotal)}
                                </span>
                                {itemSavings > 0 && (
                                  <span className="text-green-600 ml-2">
                                    (Save {formatCurrency(itemSavings)})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleBuyNow(item.product.buy_url)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Buy Now
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveItem(item.product_sku, item.merchant_id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Cart Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Cart Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items ({totalItems}):</span>
                  <span className="font-medium">{formatCurrency(cartTotal)}</span>
                </div>
                
                {totalSavings > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Original Total:</span>
                      <span className="text-gray-500 line-through">
                        {formatCurrency(cartTotal + totalSavings)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 font-medium">Total Savings:</span>
                      <span className="text-green-600 font-medium">
                        -{formatCurrency(totalSavings)}
                      </span>
                    </div>
                  </>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  {totalSavings > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      You're saving {formatCurrency(totalSavings)} compared to retail prices!
                    </p>
                  )}
                </div>

                <div className="pt-4 space-y-2">
                  <p className="text-xs text-gray-500 text-center">
                    * Prices and availability are subject to change. 
                    Click "Buy Now" to purchase items from merchant websites.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default CartPage;