// React hook for managing products from Supabase database

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Product } from '../components/ProductCard';
import { applyDealFilters, DEAL_FILTERS, getDealDateFilter } from '../utils/dealFilters';

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  getCurrentDeals: () => Promise<void>;
  getProductsByMerchant: (merchantId: number) => Promise<void>;
  searchProducts: (searchTerm: string) => Promise<void>;
  searchAllProducts: (searchTerm: string, page?: number) => Promise<void>;
  getAllProducts: (page?: number) => Promise<void>;
  refreshProducts: () => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  
  // Hook created

  const transformDatabaseProduct = (dbProduct: DatabaseProduct): Product => ({
    id: dbProduct.sku, // Use SKU as ID for compatibility
    sku: dbProduct.sku,
    merchant_id: dbProduct.merchant_id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    price: dbProduct.sale_price || dbProduct.retail_price || 0,
    originalPrice: dbProduct.sale_price ? dbProduct.retail_price || undefined : undefined,
    imageUrl: dbProduct.image_url || '/placeholder.svg',
    affiliateUrl: dbProduct.buy_url || '#',
    merchant: dbProduct.merchant_name,
    brand: dbProduct.brand_name || undefined,
    category: dbProduct.category || 'General',
    rating: undefined, // Not available in database
    discount: dbProduct.discount_percent || undefined
  });

  const handleDatabaseError = useCallback((err: any) => {
    console.error('Database Error:', err);
    setError(err.message || 'Failed to fetch products from database');
    setProducts([]);
    setTotalProducts(0);
  }, []);

  const getCurrentDeals = useCallback(async (page: number = currentPage) => {
    console.log('getCurrentDeals called, page:', page);
    setLoading(true);
    setError(null);

    try {
      // First, get total count of current deals (sale items only) using shared filters
      const countQuery = supabase
        .from('current_deals')
        .select('*', { count: 'exact', head: true });
      const { count, error: countError } = await applyDealFilters(countQuery);

      if (countError) {
        throw countError;
      }

      const total = count || 0;
      setTotalProducts(total);
      setTotalPages(Math.ceil(total / pageSize));

      // Then get paginated data using shared filters
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const dataQuery = supabase
        .from('current_deals')
        .select('*')
        .order('calculated_discount_percent', { ascending: false })
        .range(from, to);
      const { data, error: queryError } = await applyDealFilters(dataQuery);

      if (queryError) {
        throw queryError;
      }

      if (data) {
        console.log('getCurrentDeals success:', {
          dataLength: data.length,
          totalCount: total,
          totalPages: Math.ceil(total / pageSize),
          currentPage: page
        });
        const transformedProducts = data.map(transformDatabaseProduct);
        setProducts(transformedProducts);
        setCurrentPage(page);
        setError(null);
      } else {
        console.log('getCurrentDeals: No data returned');
      }
    } catch (err) {
      handleDatabaseError(err);
    } finally {
      setLoading(false);
    }
  }, [handleDatabaseError, currentPage, pageSize]);

  const getProductsByMerchant = useCallback(async (merchantId: number) => {
    setLoading(true);
    setError(null);

    // Only allow valid merchant
    if (merchantId !== DEAL_FILTERS.MERCHANT_ID) {
      setError('Invalid merchant ID');
      setLoading(false);
      return;
    }

    try {
      const { data, error: queryError } = await supabase
        .from('products')
        .select('*')
        .eq('merchant_id', DEAL_FILTERS.MERCHANT_ID) // Only valid merchant
        .gte('last_sync_date', getDealDateFilter()) // Last 7 days
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
        .eq('merchant_id', DEAL_FILTERS.MERCHANT_ID) // Only valid merchant
        .gte('last_sync_date', getDealDateFilter()) // Last 7 days
        .or(`name.ilike.%${searchTerm}%,brand_name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
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

  const getAllProducts = useCallback(async (page: number = currentPage) => {
    console.log('getAllProducts called, page:', page);
    
    // Prevent too frequent requests
    const now = Date.now();
    if (now - lastRequestTime < 500) {
      console.log('getAllProducts: Request throttled');
      return;
    }
    setLastRequestTime(now);
    
    setLoading(true);
    setError(null);

    try {
      // First, get total count
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', DEAL_FILTERS.MERCHANT_ID) // Only valid merchant
        .gte('last_sync_date', getDealDateFilter()); // Last 7 days

      if (countError) {
        throw countError;
      }

      const total = count || 0;
      setTotalProducts(total);
      setTotalPages(Math.ceil(total / pageSize));

      // Then get paginated data
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error: queryError } = await supabase
        .from('products')
        .select('*')
        .eq('merchant_id', DEAL_FILTERS.MERCHANT_ID) // Only valid merchant
        .gte('last_sync_date', getDealDateFilter()) // Last 7 days
        .order('name', { ascending: true })
        .range(from, to);

      if (queryError) {
        throw queryError;
      }

      if (data) {
        const transformedProducts = data.map(transformDatabaseProduct);
        setProducts(transformedProducts);
        setCurrentPage(page);
        setError(null);
      }
    } catch (err) {
      handleDatabaseError(err);
    } finally {
      setLoading(false);
    }
  }, [handleDatabaseError, currentPage, pageSize]);

  const searchAllProducts = useCallback(async (searchTerm: string, page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      // First, get total count for search
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', DEAL_FILTERS.MERCHANT_ID) // Only valid merchant
        .gte('last_sync_date', getDealDateFilter()) // Last 7 days
        .or(`name.ilike.%${searchTerm}%,brand_name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);

      if (countError) {
        throw countError;
      }

      const total = count || 0;
      setTotalProducts(total);
      setTotalPages(Math.ceil(total / pageSize));

      // Then get paginated search results
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error: queryError } = await supabase
        .from('products')
        .select('*')
        .eq('merchant_id', DEAL_FILTERS.MERCHANT_ID) // Only valid merchant
        .gte('last_sync_date', getDealDateFilter()) // Last 7 days
        .or(`name.ilike.%${searchTerm}%,brand_name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
        .order('name', { ascending: true })
        .range(from, to);

      if (queryError) {
        throw queryError;
      }

      if (data) {
        const transformedProducts = data.map(transformDatabaseProduct);
        setProducts(transformedProducts);
        setCurrentPage(page);
        setError(null);
      }
    } catch (err) {
      handleDatabaseError(err);
    } finally {
      setLoading(false);
    }
  }, [handleDatabaseError, pageSize]);

  const refreshProducts = useCallback(async () => {
    await getCurrentDeals();
  }, [getCurrentDeals]);

  // Pagination helpers
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  // Auto-load removed - let components control which data to load

  return {
    products,
    loading,
    error,
    totalProducts,
    currentPage,
    totalPages,
    pageSize,
    getCurrentDeals,
    getProductsByMerchant,
    searchProducts,
    searchAllProducts,
    getAllProducts,
    refreshProducts,
    setPage,
    setPageSize
  };
}

export default useProducts;
