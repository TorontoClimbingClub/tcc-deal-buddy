// Dedicated hook for All Products page - lightweight and focused
import { useState, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Product } from '../components/ProductCard';

// Filter interface for unified filtering
interface ProductFilters {
  search?: string;
  categories?: string[];
  brands?: string[];
  priceRange?: { min: number; max: number };
  discountMin?: number;
  onSale?: boolean;
}

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
  loadFilteredProducts: (filters: ProductFilters, page?: number) => Promise<void>;
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

  // Build database query with all filters applied
  const buildFilteredQuery = useCallback((filters: ProductFilters) => {
    let query = supabase
      .from('products')
      .select('*')
      .eq('merchant_id', 18557)
      .gte('last_sync_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    let countQuery = supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('merchant_id', 18557)
      .gte('last_sync_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    // Search filter
    if (filters.search && filters.search.trim()) {
      const searchCondition = `name.ilike.%${filters.search}%,brand_name.ilike.%${filters.search}%,category.ilike.%${filters.search}%`;
      query = query.or(searchCondition);
      countQuery = countQuery.or(searchCondition);
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      const categoryCondition = filters.categories.map(cat => `category.ilike.%${cat}%`).join(',');
      // Only apply if no search is active, otherwise combine with AND logic
      if (!filters.search || !filters.search.trim()) {
        query = query.or(categoryCondition);
        countQuery = countQuery.or(categoryCondition);
      } else {
        // When search is active, categories should be AND with search
        query = query.or(categoryCondition);
        countQuery = countQuery.or(categoryCondition);
      }
    }

    // Brand filter
    if (filters.brands && filters.brands.length > 0) {
      query = query.in('brand_name', filters.brands);
      countQuery = countQuery.in('brand_name', filters.brands);
    }

    // Price range filter - simplified for now, client-side filtering will handle complex price logic
    if (filters.priceRange && filters.priceRange.min > 0) {
      query = query.gte('retail_price', filters.priceRange.min);
      countQuery = countQuery.gte('retail_price', filters.priceRange.min);
    }
    if (filters.priceRange && filters.priceRange.max < 10000) {
      query = query.lte('retail_price', filters.priceRange.max);
      countQuery = countQuery.lte('retail_price', filters.priceRange.max);
    }

    // On sale filter
    if (filters.onSale) {
      query = query.not('sale_price', 'is', null);
      query = query.not('retail_price', 'is', null);
      // Add condition where sale_price < retail_price
      countQuery = countQuery.not('sale_price', 'is', null);
      countQuery = countQuery.not('retail_price', 'is', null);
    }

    // Discount filter
    if (filters.discountMin && filters.discountMin > 0) {
      query = query.gte('discount_percent', filters.discountMin);
      countQuery = countQuery.gte('discount_percent', filters.discountMin);
    }

    return { query, countQuery };
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

  const loadFilteredProducts = useCallback(async (filters: ProductFilters, page: number = 1) => {
    // Load products with all filters applied at database level
    
    // Request throttling
    const now = Date.now();
    if (now - lastRequestTime < 1000) {
      console.log('useAllProducts: Filtered request throttled');
      return;
    }
    setLastRequestTime(now);

    setLoading(true);
    setError(null);

    try {
      const { query, countQuery } = buildFilteredQuery(filters);

      // Get total count with filters applied
      const { count, error: countError } = await countQuery;

      if (countError) {
        throw countError;
      }

      const total = count || 0;
      setTotalProducts(total);
      setTotalPages(Math.ceil(total / pageSize));

      // Get paginated filtered results
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error: queryError } = await query
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
  }, [buildFilteredQuery, handleDatabaseError, pageSize, lastRequestTime, transformDatabaseProduct]);

  const searchProducts = useCallback(async (searchTerm: string, page: number = 1) => {
    // Legacy function - now uses unified filtering
    await loadFilteredProducts({ search: searchTerm }, page);
  }, [loadFilteredProducts]);

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
    loadFilteredProducts,
    setPage,
    setPageSize,
    autoLoadProducts
  };
}

export default useAllProducts;