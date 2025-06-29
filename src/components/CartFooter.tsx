import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGlobalCart } from '@/contexts/CartContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface CartFooterProps {
  className?: string;
}

export const CartFooter: React.FC<CartFooterProps> = ({ className }) => {
  const {
    cartItems,
    hasItems,
    totalItems,
    totalSavings,
    cartTotal,
    updateQuantity,
    removeFromCart
  } = useGlobalCart();
  const isMobile = useIsMobile();
  
  // Try to get sidebar state, but don't fail if not available
  const [sidebarState, setSidebarState] = useState<'expanded' | 'collapsed'>('expanded');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  useEffect(() => {
    // Check if sidebar exists and get its state from DOM
    const sidebar = document.querySelector('[data-sidebar="sidebar"]');
    const sidebarWrapper = document.querySelector('.group\\/sidebar-wrapper');
    
    if (sidebar && sidebarWrapper) {
      // Get initial state
      const isCollapsed = sidebar.getAttribute('data-state') === 'collapsed';
      setSidebarState(isCollapsed ? 'collapsed' : 'expanded');
      
      let debounceTimer: NodeJS.Timeout;
      
      // Listen for sidebar state changes with debouncing
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-state') {
            const state = (mutation.target as Element).getAttribute('data-state');
            const newState = state === 'collapsed' ? 'collapsed' : 'expanded';
            
            // Clear previous timer
            clearTimeout(debounceTimer);
            
            // Mark as transitioning
            setIsTransitioning(true);
            
            // Update state immediately for responsiveness
            setSidebarState(newState);
            
            // Clear transitioning state after animation completes
            debounceTimer = setTimeout(() => {
              setIsTransitioning(false);
            }, 150); // Match sidebar's duration-150
          }
        });
      });
      
      // Listen for transitionend events for better timing
      const handleTransitionEnd = (e: TransitionEvent) => {
        if (e.target === sidebar && (e.propertyName === 'width' || e.propertyName === 'left')) {
          setIsTransitioning(false);
        }
      };
      
      sidebar.addEventListener('transitionend', handleTransitionEnd);
      observer.observe(sidebar, { attributes: true });
      
      return () => {
        observer.disconnect();
        sidebar.removeEventListener('transitionend', handleTransitionEnd);
        clearTimeout(debounceTimer);
      };
    }
  }, []);

  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Show footer when cart has items
  useEffect(() => {
    setIsVisible(hasItems);
  }, [hasItems]);

  if (!isVisible || !hasItems) {
    return null;
  }

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

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate left offset based on sidebar state (only on desktop)
  const getLeftOffset = () => {
    if (isMobile) return '0'; // No sidebar offset on mobile
    return sidebarState === 'expanded' ? '16rem' : '4rem'; // Match sidebar widths
  };

  // Get the transform value for hardware acceleration
  const getTransformValue = () => {
    if (isMobile) return 'translateX(0)';
    const offset = sidebarState === 'expanded' ? '16rem' : '4rem';
    return `translateX(${offset})`;
  };
  
  // Dynamic transition duration - slightly longer if transitioning for smoothness
  const getTransitionDuration = () => {
    return isTransitioning ? '150ms' : '150ms';
  };

  return (
    <div
      className={`
        fixed bottom-0 z-50 bg-white border-t border-gray-200 shadow-lg
        transition-all duration-150 ease-in-out
        ${isVisible ? 'translate-y-0' : 'translate-y-full'}
        ${className || ''}
      `}
      style={{
        left: 0,
        right: 0,
        transform: `${getTransformValue()} ${isVisible ? 'translateY(0)' : 'translateY(100%)'}`,
        transition: `transform ${getTransitionDuration()} ease-in-out`,
        willChange: 'transform' // Optimize for animations
      }}
    >
      {/* Compact Header Bar - Now includes latest item when cart has items */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          {/* Left: Cart Icon and Summary */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              {totalItems > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {totalItems}
                </Badge>
              )}
            </div>
            
            {/* Enhanced middle section with latest item info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {totalItems} item{totalItems !== 1 ? 's' : ''} in cart
                  </span>
                  {totalSavings > 0 && (
                    <span className="text-xs text-green-600 font-medium">
                      Saving {formatCurrency(totalSavings)}
                    </span>
                  )}
                </div>
                
                {/* Latest item preview when available */}
                {cartItems.length > 0 && (
                  <div className="flex items-center gap-2 ml-4 flex-1 min-w-0">
                    <img
                      src={cartItems[0].product.image_url}
                      alt={cartItems[0].product.name}
                      className="w-8 h-8 object-cover rounded bg-gray-100 flex-shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-product.svg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">
                        {cartItems[0].product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(cartItems[0].product.sale_price)}
                        {cartItems.length > 1 && (
                          <span className="ml-1">+{cartItems.length - 1} more</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Total and Expand Arrow */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(cartTotal)}
              </div>
              {totalSavings > 0 && (
                <div className="text-xs text-gray-500">
                  vs {formatCurrency(cartTotal + totalSavings)}
                </div>
              )}
            </div>
            <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Cart Items */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="max-h-64 overflow-y-auto">
            {cartItems.map((item) => (
              <div key={`${item.product_sku}-${item.merchant_id}`} className="p-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-3">
                  {/* Product Image */}
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded bg-gray-100 flex-shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-product.svg';
                    }}
                  />

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {item.product.merchant_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.product.sale_price)}
                      </span>
                      {item.savings > 0 && (
                        <span className="text-xs text-green-600">
                          Save {formatCurrency(item.savings / item.quantity)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0"
                      onClick={() => handleQuantityChange(item.product_sku, item.merchant_id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0"
                      onClick={() => handleQuantityChange(item.product_sku, item.merchant_id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Remove Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                    onClick={() => handleRemoveItem(item.product_sku, item.merchant_id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Expanded Footer Actions */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {totalItems} item{totalItems !== 1 ? 's' : ''} • {formatCurrency(cartTotal)}
                {totalSavings > 0 && (
                  <span className="text-green-600 ml-2">
                    • {formatCurrency(totalSavings)} saved
                  </span>
                )}
              </div>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  // Navigate to cart page
                  window.location.hash = 'cart';
                }}
              >
                View Cart
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartFooter;