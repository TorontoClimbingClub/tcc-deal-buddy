
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { applyDealFilters } from '../utils/dealFilters';

interface DashboardStats {
  activeDeals: number;
  totalProducts: number;
  averageDiscount: number;
  loading: boolean;
  error: string | null;
}

export const useDashboardStats = (): DashboardStats => {
  const [stats, setStats] = useState<DashboardStats>({
    activeDeals: 0,
    totalProducts: 0,
    averageDiscount: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));

        // Get current deals count using unified filters
        const dealsQuery = supabase
          .from('current_deals')
          .select('*', { count: 'exact', head: true });

        const { count: dealsCount, error: dealsError } = await applyDealFilters(dealsQuery);

        if (dealsError) {
          console.error('Error fetching deals count:', dealsError);
        }

        // Get total products count
        const { count: productsCount, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('merchant_id', 18557);

        if (productsError) {
          console.error('Error fetching products count:', productsError);
        }

        // Get average discount from current deals using unified filters
        const avgDiscountQuery = supabase
          .from('current_deals')
          .select('calculated_discount_percent')
          .not('calculated_discount_percent', 'is', null)
          .gt('calculated_discount_percent', 0);

        const { data: avgDiscountData, error: avgError } = await applyDealFilters(avgDiscountQuery);

        if (avgError) {
          console.error('Error fetching average discount:', avgError);
        }

        // Calculate average discount
        let averageDiscount = 0;
        if (avgDiscountData && avgDiscountData.length > 0) {
          const validDiscounts = avgDiscountData
            .map(item => Number(item.calculated_discount_percent))
            .filter(discount => !isNaN(discount) && discount > 0);
          
          if (validDiscounts.length > 0) {
            averageDiscount = Math.round(
              validDiscounts.reduce((sum, discount) => sum + discount, 0) / validDiscounts.length
            );
          }
        }

        setStats({
          activeDeals: dealsCount || 0,
          totalProducts: productsCount || 0,
          averageDiscount,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load stats'
        }));
      }
    };

    fetchDashboardStats();
  }, []);

  return stats;
};
