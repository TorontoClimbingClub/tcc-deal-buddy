// React hook for managing shopping cart in local state (no authentication required)

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from './use-toast';

interface CartItem {
  product_sku: string;
  merchant_id: number;
  quantity: number;
  added_at: string;
  updated_at: string;
}

interface CartItemWithProduct extends CartItem {
  product: {
    name: string;
    sale_price: number;
    retail_price: number;
    image_url: string;
    merchant_name: string;
    brand_name?: string;
    buy_url: string;
  };
  savings: number;
  total_price: number;
}

interface CartSummary {
  item_count: number;
  total_quantity: number;
  cart_total: number;
  total_savings: number;
}

interface UseCartResult {
  cartItems: CartItemWithProduct[];
  cartSummary: CartSummary | null;
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
}

// Local storage key
const CART_STORAGE_KEY = 'tcc-deal-buddy-cart';

export function useCart(): UseCartResult {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Calculate cart summary from items
  const calculateSummary = useCallback((items: CartItemWithProduct[]) => {
    const summary: CartSummary = {
      item_count: items.length,
      total_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      cart_total: items.reduce((sum, item) => sum + (item.product.sale_price * item.quantity), 0),
      total_savings: items.reduce((sum, item) => sum + item.savings, 0)
    };
    setCartSummary(summary);
  }, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
        calculateSummary(parsedCart);
      } catch (e) {
        console.error('Failed to parse saved cart:', e);
      }
    }
  }, [calculateSummary]);

  // Save cart to localStorage whenever it changes
  const saveCartToStorage = useCallback((items: CartItemWithProduct[]) => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, []);

  const handleError = useCallback((err: any, action: string) => {
    console.error(`Cart ${action} Error:`, err);
    setError(err.message || `Failed to ${action} cart`);
    toast({
      title: 'Error',
      description: `Failed to ${action} cart. Please try again.`,
      variant: 'destructive',
    });
  }, [toast]);

  const isInCart = useCallback((sku: string, merchantId: number): boolean => {
    return cartItems.some(item => item.product_sku === sku && item.merchant_id === merchantId);
  }, [cartItems]);

  const getCartItemQuantity = useCallback((sku: string, merchantId: number): number => {
    const item = cartItems.find(item => item.product_sku === sku && item.merchant_id === merchantId);
    return item ? item.quantity : 0;
  }, [cartItems]);

  const getCartItems = useCallback(async () => {
    // This is now just a placeholder for consistency
    // Cart items are already loaded from local storage
    return Promise.resolve();
  }, []);

  const getCartSummary = useCallback(async () => {
    // Summary is calculated from local cart items
    return Promise.resolve();
  }, []);

  const addToCart = useCallback(async (sku: string, merchantId: number, quantity: number = 1) => {
    try {
      console.log('🛒 AddToCart called:', { sku, merchantId, quantity });
      setLoading(true);
      
      // Check if item already in cart
      const existingItemIndex = cartItems.findIndex(item => 
        item.product_sku === sku && item.merchant_id === merchantId
      );

      console.log('🛒 Existing item check:', { existingItemIndex, cartItemsLength: cartItems.length });

      if (existingItemIndex !== -1) {
        console.log('🛒 Updating existing item quantity');
        // Update quantity instead of adding duplicate
        const newQuantity = cartItems[existingItemIndex].quantity + quantity;
        const updatedCart = cartItems.map((item, index) => {
          if (index === existingItemIndex) {
            const savings = item.product.retail_price && item.product.sale_price 
              ? (item.product.retail_price - item.product.sale_price) * newQuantity
              : 0;
            return {
              ...item,
              quantity: newQuantity,
              savings,
              total_price: item.product.sale_price * newQuantity,
              updated_at: new Date().toISOString()
            };
          }
          return item;
        });
        
        setCartItems(updatedCart);
        saveCartToStorage(updatedCart);
        calculateSummary(updatedCart);
        
        toast({
          title: 'Cart Updated',
          description: 'Product quantity updated.',
        });
        return;
      }

      // Fetch product details from database (no auth required for reading)
      const currentDate = new Date().toISOString().split('T')[0];
      console.log('🛒 Fetching product data:', { sku, merchantId, currentDate });
      
      // Try to find product with current date first, then fallback to most recent
      let { data: products, error: fetchError } = await supabase
        .from('products')
        .select('name, sale_price, retail_price, image_url, merchant_name, brand_name, buy_url')
        .eq('sku', sku)
        .eq('merchant_id', merchantId)
        .eq('last_sync_date', currentDate)
        .single();

      console.log('🛒 Current date query result:', { products, fetchError });

      // If no product found for current date, try to get the most recent one
      if (fetchError && fetchError.code === 'PGRST116') {
        console.log('🛒 No product for current date, trying most recent...');
        const { data: recentProducts, error: recentError } = await supabase
          .from('products')
          .select('name, sale_price, retail_price, image_url, merchant_name, brand_name, buy_url')
          .eq('sku', sku)
          .eq('merchant_id', merchantId)
          .order('last_sync_date', { ascending: false })
          .limit(1)
          .single();

        products = recentProducts;
        fetchError = recentError;
        console.log('🛒 Most recent query result:', { products, fetchError });
      }

      if (fetchError) {
        console.error('🛒 Supabase fetch error:', fetchError);
        throw new Error(`Database error: ${fetchError.message}`);
      }

      if (!products) {
        console.error('🛒 No product found for:', { sku, merchantId });
        throw new Error(`Product not found: SKU ${sku}, Merchant ${merchantId}`);
      }

      // Create new cart item with fallback values for missing data
      console.log('🛒 Creating cart item with product data:', products);
      const now = new Date().toISOString();
      
      // Ensure required fields have fallback values
      const productData = {
        name: products.name || 'Unknown Product',
        sale_price: products.sale_price || 0,
        retail_price: products.retail_price || products.sale_price || 0,
        image_url: products.image_url || '/placeholder-product.svg',
        merchant_name: products.merchant_name || 'Unknown Merchant',
        brand_name: products.brand_name || '',
        buy_url: products.buy_url || '#'
      };
      
      const savings = productData.retail_price && productData.sale_price 
        ? (productData.retail_price - productData.sale_price) * quantity
        : 0;

      console.log('🛒 Calculated savings:', { retail: productData.retail_price, sale: productData.sale_price, savings });

      const newItem: CartItemWithProduct = {
        product_sku: sku,
        merchant_id: merchantId,
        quantity: quantity,
        added_at: now,
        updated_at: now,
        product: productData,
        savings: savings,
        total_price: productData.sale_price * quantity
      };

      console.log('🛒 Created new cart item:', newItem);

      const updatedCart = [...cartItems, newItem];
      console.log('🛒 Updated cart:', { oldLength: cartItems.length, newLength: updatedCart.length });
      
      setCartItems(updatedCart);
      saveCartToStorage(updatedCart);
      calculateSummary(updatedCart);

      toast({
        title: 'Added to Cart',
        description: 'Product added to your cart successfully.',
      });
      console.log('🛒 Successfully added to cart');
    } catch (err) {
      console.error('🛒 AddToCart error:', err);
      handleError(err, 'add to');
    } finally {
      setLoading(false);
    }
  }, [cartItems, handleError, toast, saveCartToStorage, calculateSummary]);

  const updateQuantity = useCallback(async (sku: string, merchantId: number, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(sku, merchantId);
        return;
      }

      const updatedCart = cartItems.map(item => {
        if (item.product_sku === sku && item.merchant_id === merchantId) {
          const savings = item.product.retail_price && item.product.sale_price 
            ? (item.product.retail_price - item.product.sale_price) * quantity
            : 0;
          return {
            ...item,
            quantity,
            savings,
            total_price: item.product.sale_price * quantity,
            updated_at: new Date().toISOString()
          };
        }
        return item;
      });

      setCartItems(updatedCart);
      saveCartToStorage(updatedCart);
      calculateSummary(updatedCart);
    } catch (err) {
      handleError(err, 'update');
    }
  }, [cartItems, handleError, saveCartToStorage, calculateSummary]);

  const removeFromCart = useCallback(async (sku: string, merchantId: number) => {
    try {
      const updatedCart = cartItems.filter(item => 
        !(item.product_sku === sku && item.merchant_id === merchantId)
      );

      setCartItems(updatedCart);
      saveCartToStorage(updatedCart);
      calculateSummary(updatedCart);
      
      toast({
        title: 'Removed from Cart',
        description: 'Product removed from your cart.',
      });
    } catch (err) {
      handleError(err, 'remove from');
    }
  }, [cartItems, handleError, toast, saveCartToStorage, calculateSummary]);

  const clearCart = useCallback(async () => {
    try {
      setCartItems([]);
      setCartSummary(null);
      localStorage.removeItem(CART_STORAGE_KEY);
      
      toast({
        title: 'Cart Cleared',
        description: 'All items removed from your cart.',
      });
    } catch (err) {
      handleError(err, 'clear');
    }
  }, [handleError, toast]);

  return {
    cartItems,
    cartSummary,
    loading,
    error,
    isInCart,
    getCartItemQuantity,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItems,
    getCartSummary
  };
}

export default useCart;