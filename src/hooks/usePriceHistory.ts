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

export interface ProductPriceHistory {
  productSku: string;
  productName: string;
  currentPrice: number;
  historicalPrices: PricePoint[];
  priceRange: {
    min: number;
    max: number;
    average: number;
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
    setLoading(true);
    setError(null);

    try {
      // First get product details
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('name, sale_price, retail_price')
        .eq('sku', productSku)
        .eq('merchant_id', merchantId)
        .single();

      if (productError) throw productError;

      // Get historical price data from price_history table
      const { data: priceHistory, error: historyError } = await supabase
        .from('price_history')
        .select('*')
        .eq('product_sku', productSku)
        .eq('merchant_id', merchantId)
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

      // Add current price as the most recent point if not already included
      const today = new Date().toISOString().split('T')[0];
      const hasToday = historicalPrices.some(p => p.date === today);
      
      if (!hasToday && product) {
        historicalPrices.push({
          date: today,
          price: product.sale_price || 0,
          salePrice: product.sale_price,
          retailPrice: product.retail_price,
          onSale: product.sale_price < product.retail_price,
          discountPercent: product.retail_price 
            ? Math.round(((product.retail_price - product.sale_price) / product.retail_price) * 100)
            : 0
        });
      }

      // Calculate price range statistics
      const prices = historicalPrices.map(p => p.price).filter(p => p > 0);
      const priceRange = {
        min: Math.min(...prices),
        max: Math.max(...prices),
        average: prices.reduce((sum, p) => sum + p, 0) / prices.length
      };

      return {
        productSku,
        productName: product?.name || 'Unknown Product',
        currentPrice: product?.sale_price || 0,
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