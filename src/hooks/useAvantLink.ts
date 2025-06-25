import { useState, useCallback } from 'react';
import avantLinkService from '../services/avantlink';
import { Product } from '../components/ProductCard';

interface UseAvantLinkResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
  totalProducts: number;
  searchProducts: (params: {
    searchTerm?: string;
    onSaleOnly?: boolean;
    merchantIds?: string[];
    resultsPerPage?: number;
  }) => Promise<void>;
  loadPopularProducts: () => Promise<void>;
  clearProducts: () => void;
}

export function useAvantLink(): UseAvantLinkResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);

  // Check if API is configured
  const isConfigured = !!(
    import.meta.env.VITE_AVANTLINK_AFFILIATE_ID && 
    import.meta.env.VITE_AVANTLINK_API_KEY
  );

  console.log('🔧 AvantLink Configuration Check:', {
    affiliateId: import.meta.env.VITE_AVANTLINK_AFFILIATE_ID,
    apiKeyExists: !!import.meta.env.VITE_AVANTLINK_API_KEY,
    isConfigured
  });

  const handleApiCall = useCallback(async (apiCall: () => Promise<any>) => {
    if (!isConfigured) {
      setError('AvantLink API credentials not configured');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Making AvantLink API call...');
      const result = await apiCall();
      console.log('✅ API Response:', result);
      
      if (result && result.products) {
        setProducts(result.products);
        setTotalProducts(result.totalProducts || result.products.length);
        setError(null);
        console.log(`📦 Loaded ${result.products.length} products`);
      } else {
        console.warn('⚠️ No products in API response:', result);
        setProducts([]);
        setTotalProducts(0);
        setError('No products found');
      }
    } catch (err: any) {
      console.error('❌ AvantLink API Error:', err);
      setError(err.message || 'Failed to fetch products');
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  }, [isConfigured]);

  const searchProducts = useCallback(async (params: {
    searchTerm?: string;
    onSaleOnly?: boolean;
    merchantIds?: string[];
    resultsPerPage?: number;
  }) => {
    console.log('🔍 Search Products called with params:', params);
    const searchTerm = params.searchTerm || 'deals';
    await handleApiCall(() => avantLinkService.searchProducts({
      ...params,
      searchTerm
    }));
  }, [handleApiCall]);

  const loadPopularProducts = useCallback(async () => {
    console.log('🌟 Load Popular Products called');
    await handleApiCall(() => avantLinkService.searchProducts({
      searchTerm: 'outdoor gear',
      onSaleOnly: true,
      resultsPerPage: 20
    }));
  }, [handleApiCall]);

  const clearProducts = useCallback(() => {
    console.log('🧹 Clearing products');
    setProducts([]);
    setTotalProducts(0);
    setError(null);
  }, []);

  return {
    products,
    loading,
    error,
    isConfigured,
    totalProducts,
    searchProducts,
    loadPopularProducts,
    clearProducts
  };
}

export default useAvantLink;
