// Dedicated hook for All Products page - lightweight and focused
import { useState, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Product } from '../components/ProductCard';

interface UseAllProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  loadAllProducts: (page?: number) => Promise<void>;
  searchProducts: (searchTerm: string, page?: number) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  autoLoadProducts: () => Promise<void>;
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

export function useAllProducts(): UseAllProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(20); // Changed from 50 to 20
  const [totalPages, setTotalPages] = useState(0);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [autoLoaded, setAutoLoaded] = useState(false);

  const transformDatabaseProduct = (dbProduct: DatabaseProduct): Product => ({
    id: dbProduct.sku,
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
    rating: undefined,
    discount: dbProduct.discount_percent || undefined
  });

  const handleDatabaseError = useCallback((err: any) => {
    console.error('AllProducts Database Error:', err);
    setError(err.message || 'Failed to fetch products');
    setProducts([]);
    setTotalProducts(0);
  }, []);

  const loadAllProducts = useCallback(async (page: number = 1) => {
    // Load all products from database
    
    // Request throttling
    const now = Date.now();
    if (now - lastRequestTime < 1000) {
      console.log('useAllProducts: Request throttled');
      return;
    }
    setLastRequestTime(now);

    setLoading(true);
    setError(null);

    try {
      // Get total count of ALL products (not just deals)
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', 18557)
        .gte('last_sync_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (countError) {
        throw countError;
      }

      const total = count || 0;
      setTotalProducts(total);
      setTotalPages(Math.ceil(total / pageSize));

      // Get paginated data - ALL products (regular + sale)
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error: queryError } = await supabase
        .from('products')
        .select('*')
        .eq('merchant_id', 18557)
        .gte('last_sync_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('name', { ascending: true })
        .range(from, to);

      if (queryError) {
        throw queryError;
      }

      if (data) {
        // Successfully loaded products
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
  }, [handleDatabaseError, pageSize, lastRequestTime]);

  const searchProducts = useCallback(async (searchTerm: string, page: number = 1) => {
    // Search products by term
    
    // Request throttling
    const now = Date.now();
    if (now - lastRequestTime < 1000) {
      console.log('useAllProducts: Search request throttled');
      return;
    }
    setLastRequestTime(now);

    setLoading(true);
    setError(null);

    try {
      // Get total count for search in ALL products
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', 18557)
        .gte('last_sync_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .or(`name.ilike.%${searchTerm}%,brand_name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);

      if (countError) {
        throw countError;
      }

      const total = count || 0;
      setTotalProducts(total);
      setTotalPages(Math.ceil(total / pageSize));

      // Get paginated search results from ALL products
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error: queryError } = await supabase
        .from('products')
        .select('*')
        .eq('merchant_id', 18557)
        .gte('last_sync_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .or(`name.ilike.%${searchTerm}%,brand_name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
        .order('name', { ascending: true })
        .range(from, to);

      if (queryError) {
        throw queryError;
      }

      if (data) {
        // Search completed successfully
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
  }, [handleDatabaseError, pageSize, lastRequestTime]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  }, []);

  // Auto-load first page when hook is used
  const autoLoadProducts = useCallback(async () => {
    if (!autoLoaded) {
      setAutoLoaded(true);
      // Load first page directly to avoid dependency issues
      const now = Date.now();
      if (now - lastRequestTime < 1000) {
        console.log('useAllProducts: Auto-load request throttled');
        return;
      }
      
      setLoading(true);
      setError(null);

      try {
        // Get total count of ALL products (not just deals)
        const { count, error: countError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('merchant_id', 18557)
          .gte('last_sync_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        if (countError) {
          throw countError;
        }

        const total = count || 0;
        setTotalProducts(total);
        setTotalPages(Math.ceil(total / pageSize));

        // Get first page data
        const { data, error: queryError } = await supabase
          .from('products')
          .select('*')
          .eq('merchant_id', 18557)
          .gte('last_sync_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .order('name', { ascending: true })
          .range(0, pageSize - 1);

        if (queryError) {
          throw queryError;
        }

        if (data) {
          const transformedProducts = data.map(transformDatabaseProduct);
          setProducts(transformedProducts);
          setCurrentPage(1);
          setError(null);
        }
      } catch (err) {
        handleDatabaseError(err);
      } finally {
        setLoading(false);
      }
    }
  }, [autoLoaded, pageSize, lastRequestTime, transformDatabaseProduct, handleDatabaseError]);

  return {
    products,
    loading,
    error,
    totalProducts,
    currentPage,
    totalPages,
    pageSize,
    loadAllProducts,
    searchProducts,
    setPage,
    setPageSize,
    autoLoadProducts
  };
}

export default useAllProducts;