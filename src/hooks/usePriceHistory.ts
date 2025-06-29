import { useState, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface PricePoint {
  date: string;
  price: number;
  salePrice?: number;
  retailPrice?: number;
  onSale: boolean;
  discountPercent?: number;
}

export interface CurrentPrice {
  price: number;
  retailPrice: number;
  isOnSale: boolean;
  discountPercent: number;
  lastUpdated?: string;
}

export interface ProductPriceHistory {
  productSku: string;
  productName: string;
  currentPrice: CurrentPrice;
  historicalPrices: PricePoint[];
  priceRange: {
    min: number;
    max: number;
    average: number;
    includesCurrentPrice: boolean;
  };
}

interface UsePriceHistoryResult {
  fetchPriceHistory: (productSku: string, merchantId: number) => Promise<ProductPriceHistory | null>;
  loading: boolean;
  error: string | null;
}

export function usePriceHistory(): UsePriceHistoryResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPriceHistory = useCallback(async (productSku: string, merchantId: number): Promise<ProductPriceHistory | null> => {
    console.log('🔍 usePriceHistory: Fetching for SKU:', productSku, 'Merchant ID:', merchantId);
    setLoading(true);
    setError(null);

    try {
      // First get product details
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('name, sale_price, retail_price, updated_at')
        .eq('sku', productSku)
        .eq('merchant_id', merchantId)
        .single();

      if (productError) throw productError;

      // Get historical price data from price_history table
      // Exclude today's date to prevent duplicates with current price
      const today = new Date().toISOString().split('T')[0];
      const { data: priceHistory, error: historyError } = await supabase
        .from('price_history')
        .select('*')
        .eq('product_sku', productSku)
        .eq('merchant_id', merchantId)
        .lt('recorded_date', today) // Only get historical data before today
        .order('recorded_date', { ascending: true });

      if (historyError) throw historyError;

      // Transform the data into price points
      const historicalPrices: PricePoint[] = priceHistory?.map(record => ({
        date: record.recorded_date,
        price: record.price,
        salePrice: record.price,
        retailPrice: product?.retail_price || record.price,
        onSale: record.is_sale,
        discountPercent: record.discount_percent || 0
      })) || [];

      // Create current price object
      const currentPrice: CurrentPrice = {
        price: product?.sale_price || 0,
        retailPrice: product?.retail_price || product?.sale_price || 0,
        isOnSale: product?.sale_price < product?.retail_price,
        discountPercent: product?.retail_price 
          ? Math.round(((product.retail_price - product.sale_price) / product.retail_price) * 100)
          : 0,
        lastUpdated: product?.updated_at
      };

      // Calculate price range statistics from historical data only
      const historicalPricesOnly = historicalPrices.map(p => p.price).filter(p => p > 0);
      
      // If we have historical prices, calculate range from them
      // Otherwise, use current price for initial range
      let priceRange;
      if (historicalPricesOnly.length > 0) {
        priceRange = {
          min: Math.min(...historicalPricesOnly),
          max: Math.max(...historicalPricesOnly),
          average: historicalPricesOnly.reduce((sum, p) => sum + p, 0) / historicalPricesOnly.length,
          includesCurrentPrice: false
        };
      } else {
        // No historical data, create empty range stats
        priceRange = {
          min: 0,
          max: 0,
          average: 0,
          includesCurrentPrice: false
        };
      }

      return {
        productSku,
        productName: product?.name || 'Unknown Product',
        currentPrice,
        historicalPrices,
        priceRange
      };

    } catch (err: any) {
      console.error('Price history fetch error:', err);
      setError(err.message || 'Failed to fetch price history');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    fetchPriceHistory,
    loading,
    error
  };
}

export default usePriceHistory;