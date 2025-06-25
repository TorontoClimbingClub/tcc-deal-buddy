// React hook for managing user shopping cart in Supabase database

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from './use-toast';

interface CartItem {
  id: string;
  user_id: string;
  product_sku: string;
  merchant_id: number;
  quantity: number;
  added_at: string;
  updated_at: string;
}

interface CartSummary {
  user_id: string;
  item_count: number;
  total_quantity: number;
  cart_total: number;
  total_savings: number;
}

interface UseCartResult {
  cartItems: CartItem[];
  cartSummary: CartSummary | null;
  loading: boolean;
  error: string | null;
  addToCart: (sku: string, merchantId: number, quantity?: number) => Promise<void>;
  removeFromCart: (sku: string, merchantId: number) => Promise<void>;
  updateQuantity: (sku: string, merchantId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCart: () => Promise<void>;
  getCartSummary: () => Promise<void>;
  isInCart: (sku: string, merchantId: number) => boolean;
  getCartItemQuantity: (sku: string, merchantId: number) => number;
}

export function useCart(): UseCartResult {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDatabaseError = useCallback((err: any, action: string) => {
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

  const getCart = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setCartItems([]);
        return;
      }

      const { data, error: queryError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (queryError) {
        throw queryError;
      }

      setCartItems(data || []);
      setError(null);
    } catch (err) {
      handleDatabaseError(err, 'fetch');
    } finally {
      setLoading(false);
    }
  }, [handleDatabaseError]);

  const getCartSummary = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setCartSummary(null);
        return;
      }

      const { data, error: queryError } = await supabase
        .from('user_cart_summary')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (queryError && queryError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw queryError;
      }

      setCartSummary(data || null);
    } catch (err) {
      console.error('Cart summary fetch error:', err);
      // Don't show error toast for summary failures
    }
  }, []);

  const addToCart = useCallback(async (sku: string, merchantId: number, quantity = 1) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to add items to cart.',
          variant: 'destructive',
        });
        return;
      }

      // Check if item already exists in cart
      const existingItem = cartItems.find(
        item => item.product_sku === sku && item.merchant_id === merchantId
      );

      if (existingItem) {
        // Update quantity instead of adding new
        await updateQuantity(sku, merchantId, existingItem.quantity + quantity);
        return;
      }

      const { data, error: insertError } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_sku: sku,
          merchant_id: merchantId,
          quantity
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      if (data) {
        setCartItems(prev => [...prev, data]);
        await getCartSummary(); // Refresh summary
        toast({
          title: 'Added to Cart',
          description: `Product added to your cart (quantity: ${quantity}).`,
        });
      }
    } catch (err) {
      handleDatabaseError(err, 'add to');
    }
  }, [cartItems, handleDatabaseError, toast, getCartSummary]);

  const updateQuantity = useCallback(async (sku: string, merchantId: number, quantity: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return;
      }

      if (quantity <= 0) {
        await removeFromCart(sku, merchantId);
        return;
      }

      const { data, error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_sku', sku)
        .eq('merchant_id', merchantId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      if (data) {
        setCartItems(prev => 
          prev.map(item => 
            item.product_sku === sku && item.merchant_id === merchantId 
              ? { ...item, quantity, updated_at: data.updated_at }
              : item
          )
        );
        await getCartSummary(); // Refresh summary
        toast({
          title: 'Cart Updated',
          description: `Quantity updated to ${quantity}.`,
        });
      }
    } catch (err) {
      handleDatabaseError(err, 'update');
    }
  }, [handleDatabaseError, toast, getCartSummary, removeFromCart]);

  const removeFromCart = useCallback(async (sku: string, merchantId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return;
      }

      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_sku', sku)
        .eq('merchant_id', merchantId);

      if (deleteError) {
        throw deleteError;
      }

      setCartItems(prev => 
        prev.filter(item => !(item.product_sku === sku && item.merchant_id === merchantId))
      );
      
      await getCartSummary(); // Refresh summary
      toast({
        title: 'Removed from Cart',
        description: 'Product removed from your cart.',
      });
    } catch (err) {
      handleDatabaseError(err, 'remove from');
    }
  }, [handleDatabaseError, toast, getCartSummary]);

  const clearCart = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return;
      }

      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      setCartItems([]);
      setCartSummary(null);
      
      toast({
        title: 'Cart Cleared',
        description: 'All items removed from your cart.',
      });
    } catch (err) {
      handleDatabaseError(err, 'clear');
    }
  }, [handleDatabaseError, toast]);

  // Load cart on mount and when user changes
  useEffect(() => {
    getCart();
    getCartSummary();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        getCart();
        getCartSummary();
      } else if (event === 'SIGNED_OUT') {
        setCartItems([]);
        setCartSummary(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [getCart, getCartSummary]);

  return {
    cartItems,
    cartSummary,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCart,
    getCartSummary,
    isInCart,
    getCartItemQuantity
  };
}

export default useCart;