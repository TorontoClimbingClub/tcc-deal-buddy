// React hook for managing products from Supabase database

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Product } from '../components/ProductCard';

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  totalProducts: number;
  getCurrentDeals: () => Promise<void>;
  getProductsByMerchant: (merchantId: number) => Promise<void>;
  searchProducts: (searchTerm: string) => Promise<void>;
  refreshProducts: () => Promise<void>;
}

interface DatabaseProduct {
  id: string;
  sku: string;
  merchant_id: number;
  merchant_name: string;
  name: string;
  brand_name: string | null;
  sale_price: number | null;
  retail_price: number | null;
  discount_percent: number | null;
  discount_amount: number | null;
  image_url: string | null;
  buy_url: string | null;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  last_sync_date: string;
  created_at: string;
  updated_at: string;
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);

  const transformDatabaseProduct = (dbProduct: DatabaseProduct): Product => ({
    id: dbProduct.sku, // Use SKU as ID for compatibility
    title: dbProduct.name,
    price: dbProduct.sale_price || 0,
    originalPrice: dbProduct.retail_price || undefined,
    discountPercentage: dbProduct.discount_percent || undefined,
    image: dbProduct.image_url || '/placeholder.svg',
    link: dbProduct.buy_url || '#',
    description: dbProduct.description || '',
    brand: dbProduct.brand_name || undefined,
    category: dbProduct.category || undefined,
    merchantName: dbProduct.merchant_name,
    merchantId: dbProduct.merchant_id.toString(),
    sku: dbProduct.sku
  });

  const handleDatabaseError = useCallback((err: any) => {
    console.error('Database Error:', err);
    setError(err.message || 'Failed to fetch products from database');
    setProducts([]);
    setTotalProducts(0);
  }, []);

  const getCurrentDeals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('current_deals')
        .select('*')
        .order('calculated_discount_percent', { ascending: false })
        .limit(100);

      if (queryError) {
        throw queryError;
      }

      if (data) {
        const transformedProducts = data.map(transformDatabaseProduct);
        setProducts(transformedProducts);
        setTotalProducts(data.length);
        setError(null);
      }
    } catch (err) {
      handleDatabaseError(err);
    } finally {
      setLoading(false);
    }
  }, [handleDatabaseError]);

  const getProductsByMerchant = useCallback(async (merchantId: number) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('products')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('last_sync_date', new Date().toISOString().split('T')[0])
        .not('sale_price', 'is', null)
        .order('discount_percent', { ascending: false })
        .limit(100);

      if (queryError) {
        throw queryError;
      }

      if (data) {
        const transformedProducts = data.map(transformDatabaseProduct);
        setProducts(transformedProducts);
        setTotalProducts(data.length);
        setError(null);
      }
    } catch (err) {
      handleDatabaseError(err);
    } finally {
      setLoading(false);
    }
  }, [handleDatabaseError]);

  const searchProducts = useCallback(async (searchTerm: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('products')
        .select('*')
        .eq('last_sync_date', new Date().toISOString().split('T')[0])
        .or(`name.ilike.%${searchTerm}%,brand_name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
        .not('sale_price', 'is', null)
        .order('discount_percent', { ascending: false })
        .limit(100);

      if (queryError) {
        throw queryError;
      }

      if (data) {
        const transformedProducts = data.map(transformDatabaseProduct);
        setProducts(transformedProducts);
        setTotalProducts(data.length);
        setError(null);
      }
    } catch (err) {
      handleDatabaseError(err);
    } finally {
      setLoading(false);
    }
  }, [handleDatabaseError]);

  const refreshProducts = useCallback(async () => {
    await getCurrentDeals();
  }, [getCurrentDeals]);

  // Auto-load current deals on mount
  useEffect(() => {
    getCurrentDeals();
  }, [getCurrentDeals]);

  return {
    products,
    loading,
    error,
    totalProducts,
    getCurrentDeals,
    getProductsByMerchant,
    searchProducts,
    refreshProducts
  };
}

export default useProducts;