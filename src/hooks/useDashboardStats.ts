
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { applyDealFilters, DEAL_FILTERS, getDealDateFilter } from '../utils/dealFilters';

interface DashboardStats {
  activeDeals: number;
  averageDiscount: number;
  totalProducts: number;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  refreshStats: () => Promise<void>;
}

export function useDashboardStats(): DashboardStats {
  const [stats, setStats] = useState<Omit<DashboardStats, 'refreshStats'>>({
    activeDeals: 0,
    averageDiscount: 0,
    totalProducts: 0,
    loading: true,
    error: null,
    lastUpdated: null
  });

  const fetchDashboardStats = useCallback(async () => {
    setStats(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Get current deals count using same filters as All Deals page
      const dealsCountQuery = supabase
        .from('current_deals')
        .select('*', { count: 'exact', head: true });
      const { count: activeDealsCount, error: dealsCountError } = await applyDealFilters(dealsCountQuery);

      if (dealsCountError) {
        throw dealsCountError;
      }

      // Get discount data for average calculation (limit to reasonable sample)
      const discountQuery = supabase
        .from('current_deals')
        .select('calculated_discount_percent')
        .limit(1000); // Sample for performance
      const { data: discountData, error: discountError } = await applyDealFilters(discountQuery);

      if (discountError) {
        throw discountError;
      }

      // Get total products count using same filters as All Products page
      const { count: totalCount, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', DEAL_FILTERS.MERCHANT_ID) // Only valid MEC merchant
        .gte('last_sync_date', getDealDateFilter()); // Last 7 days

      if (countError) {
        throw countError;
      }

      // Calculate stats
      const activeDeals = activeDealsCount || 0;
      const averageDiscount = discountData && discountData.length > 0
        ? Math.round(discountData.reduce((sum, deal) => sum + (deal.calculated_discount_percent || 0), 0) / discountData.length)
        : 0;
      const totalProducts = totalCount || 0;

      setStats({
        activeDeals,
        averageDiscount,
        totalProducts,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      });

    } catch (err: any) {
      console.error('Dashboard stats error:', err);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to fetch dashboard statistics'
      }));
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Refresh every 5 minutes - DISABLED
  // useEffect(() => {
  //   const interval = setInterval(fetchDashboardStats, 5 * 60 * 1000);
  //   return () => clearInterval(interval);
  // }, [fetchDashboardStats]);

  return {
    ...stats,
    refreshStats: fetchDashboardStats
  };
}

export default useDashboardStats;
