import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface RecentActivity {
  id: string;
  item: string;
  change: string;
  time: string;
  type: 'new_deal' | 'price_drop' | 'sale_start' | 'alert';
  timestamp: Date;
}

interface UseRecentActivityResult {
  activities: RecentActivity[];
  loading: boolean;
  error: string | null;
  refreshActivities: () => Promise<void>;
}

export function useRecentActivity(): UseRecentActivityResult {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    return date.toLocaleDateString();
  };

  const fetchRecentActivity = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const allActivities: RecentActivity[] = [];

      // 1. Get products that recently went on sale (price drops in last 7 days)
      const { data: priceDrops, error: priceDropError } = await supabase
        .from('price_history')
        .select('product_sku, merchant_id, price, discount_percent, recorded_date, is_sale')
        .eq('is_sale', true)
        .gte('recorded_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('recorded_date', { ascending: false })
        .limit(20);

      if (priceDropError) throw priceDropError;

      if (priceDrops && priceDrops.length > 0) {
        // Get unique SKUs to fetch product names
        const uniqueSkus = [...new Set(priceDrops.map(drop => drop.product_sku))];
        
        const { data: products } = await supabase
          .from('products')
          .select('sku, name, sale_price, retail_price')
          .in('sku', uniqueSkus);

        const productMap = new Map(products?.map(p => [p.sku, p]) || []);

        // Group by product to get the most recent sale event
        const recentSales = new Map<string, any>();
        
        priceDrops.forEach(drop => {
          const key = drop.product_sku;
          if (!recentSales.has(key) || new Date(drop.recorded_date) > new Date(recentSales.get(key).recorded_date)) {
            recentSales.set(key, drop);
          }
        });

        // Convert to activities
        recentSales.forEach((sale, sku) => {
          const product = productMap.get(sku);
          if (product) {
            const discountText = sale.discount_percent > 0 
              ? `-${sale.discount_percent}%` 
              : product.retail_price && product.sale_price < product.retail_price
                ? `-${Math.round(((product.retail_price - product.sale_price) / product.retail_price) * 100)}%`
                : 'On Sale';

            allActivities.push({
              id: `sale_${sku}_${sale.recorded_date}`,
              item: product.name,
              change: discountText,
              time: formatTimeAgo(new Date(sale.recorded_date + 'T00:00:00')),
              type: 'price_drop',
              timestamp: new Date(sale.recorded_date + 'T00:00:00')
            });
          }
        });
      }

      // 2. Get newly added products (last 3 days)
      const { data: newProducts, error: newProductsError } = await supabase
        .from('products')
        .select('name, created_at, sku, sale_price, retail_price')
        .gte('created_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())
        .not('sale_price', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (newProductsError) throw newProductsError;

      if (newProducts) {
        newProducts.forEach(product => {
          // Only show as "New Deal" if it has a discount
          if (product.retail_price && product.sale_price < product.retail_price) {
            allActivities.push({
              id: `new_${product.sku}`,
              item: product.name,
              change: 'New Deal',
              time: formatTimeAgo(new Date(product.created_at)),
              type: 'new_deal',
              timestamp: new Date(product.created_at)
            });
          }
        });
      }

      // Sort by timestamp and limit to 6 most recent
      const sortedActivities = allActivities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 6);

      setActivities(sortedActivities);
      setError(null);

    } catch (err: any) {
      console.error('❌ Recent activity error:', err);
      setError(`Error: ${err.message}`);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchRecentActivity();
  }, [fetchRecentActivity]);

  // Refresh every 10 minutes
  useEffect(() => {
    const interval = setInterval(fetchRecentActivity, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchRecentActivity]);

  return {
    activities,
    loading,
    error,
    refreshActivities: fetchRecentActivity
  };
}

export default useRecentActivity;