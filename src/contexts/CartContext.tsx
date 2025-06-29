import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useCart } from '../hooks/useCart';

interface CartContextType {
  cartItems: any[];
  cartSummary: any;
  loading: boolean;
  error: string | null;
  isInCart: (sku: string, merchantId: number) => boolean;
  getCartItemQuantity: (sku: string, merchantId: number) => number;
  addToCart: (sku: string, merchantId: number, quantity?: number) => Promise<void>;
  removeFromCart: (sku: string, merchantId: number) => Promise<void>;
  updateQuantity: (sku: string, merchantId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartItems: () => Promise<void>;
  getCartSummary: () => Promise<void>;
  // Computed values for easy access
  totalItems: number;
  totalSavings: number;
  cartTotal: number;
  hasItems: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const cart = useCart();

  // Memoized computed values for performance
  const computedValues = useMemo(() => {
    const totalItems = cart.cartSummary?.item_count || 0;
    const totalSavings = cart.cartSummary?.total_savings || 0;
    const cartTotal = cart.cartSummary?.cart_total || 0;
    const hasItems = totalItems > 0;

    return {
      totalItems,
      totalSavings,
      cartTotal,
      hasItems
    };
  }, [cart.cartSummary]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...cart,
    ...computedValues
  }), [cart, computedValues]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useGlobalCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useGlobalCart must be used within a CartProvider');
  }
  return context;
};

export { CartContext };
export default CartProvider;