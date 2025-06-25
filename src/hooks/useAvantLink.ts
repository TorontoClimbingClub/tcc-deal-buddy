// React hook for managing AvantLink API data and state

import { useState, useEffect, useCallback, useRef } from 'react';
import { avantLinkService, AvantLinkApiResponse, ProductSearchParams } from '../services/avantlink';
import { transformAvantLinkProducts } from '../utils/productTransform';
import { Product } from '../components/ProductCard';

interface UseAvantLinkResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  totalResults: number;
  currentPage: number;
  hasNextPage: boolean;
  searchProducts: (params: ProductSearchParams) => Promise<void>;
  getPopularProducts: (category?: string) => Promise<void>;
  getSaleProducts: () => Promise<void>;
  getSaleProductsByMerchants: (merchantIds: string[], searchTerm?: string) => Promise<void>;
  clearProducts: () => void;
  isConfigured: boolean;
}

interface UseAvantLinkOptions {
  autoFetch?: boolean;
  defaultSearchTerm?: string;
  resultsPerPage?: number;
}

export function useAvantLink(options: UseAvantLinkOptions = {}): UseAvantLinkResult {
  const {
    autoFetch = false,
    defaultSearchTerm = 'popular',
    resultsPerPage = 20
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Rate limiting state
  const lastRequestTime = useRef<number>(0);
  const requestQueue = useRef<Promise<any> | null>(null);
  const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

  // Check if AvantLink is configured
  const isConfigured = avantLinkService.isConfigured();

  // Rate limiting wrapper
  const withRateLimit = useCallback(async <T>(apiCall: () => Promise<T>): Promise<T> => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;

    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const delay = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`⏱️ Rate limiting: waiting ${delay}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Queue requests to prevent concurrent API calls
    if (requestQueue.current) {
      await requestQueue.current.catch(() => {}); // Ignore errors from previous requests
    }

    const request = apiCall();
    requestQueue.current = request;
    lastRequestTime.current = Date.now();

    return request;
  }, []);

  const handleApiResponse = useCallback((response: AvantLinkApiResponse) => {
    const transformedProducts = transformAvantLinkProducts(response.products);
    setProducts(transformedProducts);
    setTotalResults(response.totalResults);
    setCurrentPage(response.currentPage);
    setError(null);
  }, []);

  const handleApiError = useCallback((err: any) => {
    console.error('AvantLink API Error:', err);
    setError(err.message || 'Failed to fetch products');
    setProducts([]);
    setTotalResults(0);
  }, []);

  const searchProducts = useCallback(async (params: ProductSearchParams) => {
    if (!isConfigured) {
      setError('AvantLink API not configured. Please check your environment variables.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await withRateLimit(() => avantLinkService.searchProducts({
        ...params,
        resultsPerPage: params.resultsPerPage || resultsPerPage
      }));
      handleApiResponse(response);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  }, [isConfigured, resultsPerPage, handleApiResponse, handleApiError, withRateLimit]);

  const getPopularProducts = useCallback(async (category?: string) => {
    if (!isConfigured) {
      setError('AvantLink API not configured. Please check your environment variables.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await withRateLimit(() => avantLinkService.getPopularProducts(category));
      handleApiResponse(response);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  }, [isConfigured, handleApiResponse, handleApiError, withRateLimit]);

  const getSaleProducts = useCallback(async () => {
    if (!isConfigured) {
      setError('AvantLink API not configured. Please check your environment variables.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await withRateLimit(() => avantLinkService.getSaleProducts());
      handleApiResponse(response);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  }, [isConfigured, handleApiResponse, handleApiError, withRateLimit]);

  const getSaleProductsByMerchants = useCallback(async (merchantIds: string[], searchTerm = 'sale') => {
    if (!isConfigured) {
      setError('AvantLink API not configured. Please check your environment variables.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await withRateLimit(() => avantLinkService.getSaleProductsByMerchants(merchantIds, searchTerm));
      handleApiResponse(response);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  }, [isConfigured, handleApiResponse, handleApiError, withRateLimit]);

  const clearProducts = useCallback(() => {
    setProducts([]);
    setTotalResults(0);
    setCurrentPage(1);
    setError(null);
  }, []);

  // Auto-fetch popular products on mount if configured
  useEffect(() => {
    if (autoFetch && isConfigured && products.length === 0) {
      getPopularProducts();
    }
  }, [autoFetch, isConfigured, products.length, getPopularProducts]);

  // Calculate if there's a next page
  const hasNextPage = currentPage * resultsPerPage < totalResults;

  return {
    products,
    loading,
    error,
    totalResults,
    currentPage,
    hasNextPage,
    searchProducts,
    getPopularProducts,
    getSaleProducts,
    getSaleProductsByMerchants,
    clearProducts,
    isConfigured
  };
}

export default useAvantLink;