// React hook for managing AvantLink API data and state

import { useState, useEffect, useCallback } from 'react';
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

  // Check if AvantLink is configured
  const isConfigured = avantLinkService.isConfigured();

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
      const response = await avantLinkService.searchProducts({
        ...params,
        resultsPerPage: params.resultsPerPage || resultsPerPage
      });
      handleApiResponse(response);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  }, [isConfigured, resultsPerPage, handleApiResponse, handleApiError]);

  const getPopularProducts = useCallback(async (category?: string) => {
    if (!isConfigured) {
      setError('AvantLink API not configured. Please check your environment variables.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await avantLinkService.getPopularProducts(category);
      handleApiResponse(response);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  }, [isConfigured, handleApiResponse, handleApiError]);

  const getSaleProducts = useCallback(async () => {
    if (!isConfigured) {
      setError('AvantLink API not configured. Please check your environment variables.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await avantLinkService.getSaleProducts();
      handleApiResponse(response);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  }, [isConfigured, handleApiResponse, handleApiError]);

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
    clearProducts,
    isConfigured
  };
}

export default useAvantLink;