// React hook for managing user favorites in Supabase database

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from './use-toast';

interface FavoriteProduct {
  id: string;
  user_id: string;
  product_sku: string;
  merchant_id: number;
  created_at: string;
}

interface UseFavoritesResult {
  favorites: FavoriteProduct[];
  loading: boolean;
  error: string | null;
  isFavorite: (sku: string, merchantId: number) => boolean;
  addToFavorites: (sku: string, merchantId: number) => Promise<void>;
  removeFromFavorites: (sku: string, merchantId: number) => Promise<void>;
  toggleFavorite: (sku: string, merchantId: number) => Promise<void>;
  getFavorites: () => Promise<void>;
  clearFavorites: () => void;
}

export function useFavorites(): UseFavoritesResult {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDatabaseError = useCallback((err: any, action: string) => {
    console.error(`Favorites ${action} Error:`, err);
    setError(err.message || `Failed to ${action} favorites`);
    toast({
      title: 'Error',
      description: `Failed to ${action} favorites. Please try again.`,
      variant: 'destructive',
    });
  }, [toast]);

  const isFavorite = useCallback((sku: string, merchantId: number): boolean => {
    return favorites.some(fav => fav.product_sku === sku && fav.merchant_id === merchantId);
  }, [favorites]);

  const getFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setFavorites([]);
        return;
      }

      const { data, error: queryError } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (queryError) {
        throw queryError;
      }

      setFavorites(data || []);
      setError(null);
    } catch (err) {
      handleDatabaseError(err, 'fetch');
    } finally {
      setLoading(false);
    }
  }, [handleDatabaseError]);

  const addToFavorites = useCallback(async (sku: string, merchantId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to add favorites.',
          variant: 'destructive',
        });
        return;
      }

      // Check if already favorited
      if (isFavorite(sku, merchantId)) {
        toast({
          title: 'Already Favorited',
          description: 'This product is already in your favorites.',
        });
        return;
      }

      const { data, error: insertError } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          product_sku: sku,
          merchant_id: merchantId
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      if (data) {
        setFavorites(prev => [...prev, data]);
        toast({
          title: 'Added to Favorites',
          description: 'Product added to your favorites successfully.',
        });
      }
    } catch (err) {
      handleDatabaseError(err, 'add to');
    }
  }, [isFavorite, handleDatabaseError, toast]);

  const removeFromFavorites = useCallback(async (sku: string, merchantId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return;
      }

      const { error: deleteError } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_sku', sku)
        .eq('merchant_id', merchantId);

      if (deleteError) {
        throw deleteError;
      }

      setFavorites(prev => 
        prev.filter(fav => !(fav.product_sku === sku && fav.merchant_id === merchantId))
      );
      
      toast({
        title: 'Removed from Favorites',
        description: 'Product removed from your favorites.',
      });
    } catch (err) {
      handleDatabaseError(err, 'remove from');
    }
  }, [handleDatabaseError, toast]);

  const toggleFavorite = useCallback(async (sku: string, merchantId: number) => {
    if (isFavorite(sku, merchantId)) {
      await removeFromFavorites(sku, merchantId);
    } else {
      await addToFavorites(sku, merchantId);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    setError(null);
  }, []);

  // Load favorites on mount and when user changes
  useEffect(() => {
    getFavorites();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        getFavorites();
      } else if (event === 'SIGNED_OUT') {
        clearFavorites();
      }
    });

    return () => subscription.unsubscribe();
  }, [getFavorites, clearFavorites]);

  return {
    favorites,
    loading,
    error,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    getFavorites,
    clearFavorites
  };
}

export default useFavorites;