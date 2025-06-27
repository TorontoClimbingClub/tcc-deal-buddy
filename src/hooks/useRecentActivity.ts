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

      // 1. Find products with actual price drops in the last 7 days
      // Get price history data ordered by product and date to analyze price changes
      const { data: priceHistoryData, error: priceDropError } = await supabase
        .from('price_history')
        .select('product_sku, merchant_id, price, recorded_date, created_at, is_sale, discount_percent')
        .gte('recorded_date', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Get 14 days to analyze trends
        .order('product_sku')
        .order('merchant_id')
        .order('recorded_date');

      if (priceDropError) throw priceDropError;

      // Analyze price changes to find actual price drops
      const recentPriceDrops: any[] = [];
      const productPriceMap = new Map<string, any[]>();
      
      console.log(`🔍 Recent Activity: Analyzing ${priceHistoryData?.length || 0} price history records`);
      
      if (priceHistoryData && priceHistoryData.length > 0) {
        // Group price history by product
        priceHistoryData.forEach(record => {
          const key = `${record.product_sku}_${record.merchant_id}`;
          if (!productPriceMap.has(key)) {
            productPriceMap.set(key, []);
          }
          productPriceMap.get(key)!.push(record);
        });

        // Analyze each product's price history for drops
        productPriceMap.forEach((priceHistory, productKey) => {
          // Sort by date to ensure chronological order
          priceHistory.sort((a, b) => new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime());
          
          // Find the most recent price drop in the last 7 days
          for (let i = 1; i < priceHistory.length; i++) {
            const currentRecord = priceHistory[i];
            const previousRecord = priceHistory[i - 1];
            
            // Check if this is a recent record (within 7 days)
            const recordDate = new Date(currentRecord.recorded_date);
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            
            if (recordDate >= sevenDaysAgo) {
              // Check if price dropped from previous record
              if (currentRecord.price < previousRecord.price && previousRecord.price > 0) {
                const dropPercent = ((previousRecord.price - currentRecord.price) / previousRecord.price) * 100;
                
                // Only consider significant drops (5% or more)
                if (dropPercent >= 5) {
                  recentPriceDrops.push({
                    product_sku: currentRecord.product_sku,
                    merchant_id: currentRecord.merchant_id,
                    current_price: currentRecord.price,
                    previous_price: previousRecord.price,
                    drop_percent: Math.round(dropPercent),
                    price_drop_timestamp: currentRecord.created_at,
                    is_sale: currentRecord.is_sale,
                    discount_percent: currentRecord.discount_percent
                  });
                  break; // Only take the most recent drop for each product
                }
              }
            }
          }
        });

        // Sort by most recent price drops first
        recentPriceDrops.sort((a, b) => new Date(b.price_drop_timestamp).getTime() - new Date(a.price_drop_timestamp).getTime());
        
        console.log(`💰 Recent Activity: Found ${recentPriceDrops.length} actual price drops (5%+ drops)`);
        
        // Limit to top 20 most recent drops
        const priceDrops = recentPriceDrops.slice(0, 20);
        
        if (priceDrops.length > 0) {
          // Get unique SKUs to fetch product names
          const uniqueSkus = [...new Set(priceDrops.map(drop => drop.product_sku))];
          
          const { data: products } = await supabase
            .from('products')
            .select('sku, name, sale_price, retail_price, discount_percent, image_url')
            .in('sku', uniqueSkus);

          const productMap = new Map(products?.map(p => [p.sku, p]) || []);

          // Convert to activities using the actual price drop timestamp
          priceDrops.forEach((priceDrop) => {
            const product = productMap.get(priceDrop.product_sku);
            if (product) {
              // Use the calculated drop percentage from price history analysis
              const discountText = `-${priceDrop.drop_percent}%`;

              allActivities.push({
                id: `price_drop_${priceDrop.product_sku}_${priceDrop.price_drop_timestamp}`,
                item: product.name,
                change: discountText,
                time: formatTimeAgo(new Date(priceDrop.price_drop_timestamp)),
                type: 'price_drop',
                timestamp: new Date(priceDrop.price_drop_timestamp)
              });
            }
          });
        } else {
          console.log(`ℹ️ Recent Activity: No significant price drops found, falling back to recent sales`);
          
          // Fallback: Show recent items that are currently on sale
          const { data: fallbackSales } = await supabase
            .from('price_history')
            .select('product_sku, merchant_id, created_at, discount_percent')
            .eq('is_sale', true)
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false })
            .limit(6);

          if (fallbackSales && fallbackSales.length > 0) {
            const fallbackSkus = [...new Set(fallbackSales.map(sale => sale.product_sku))];
            const { data: fallbackProducts } = await supabase
              .from('products')
              .select('sku, name, discount_percent')
              .in('sku', fallbackSkus);

            const fallbackProductMap = new Map(fallbackProducts?.map(p => [p.sku, p]) || []);

            fallbackSales.forEach((sale) => {
              const product = fallbackProductMap.get(sale.product_sku);
              if (product) {
                allActivities.push({
                  id: `fallback_sale_${sale.product_sku}_${sale.created_at}`,
                  item: product.name,
                  change: product.discount_percent > 0 ? `-${product.discount_percent}%` : 'On Sale',
                  time: formatTimeAgo(new Date(sale.created_at)),
                  type: 'price_drop',
                  timestamp: new Date(sale.created_at)
                });
              }
            });
          }
        }
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