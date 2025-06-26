import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';

interface DashboardStats {
  activeDeals: number;
  averageDiscount: number;
  totalProducts: number;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export function useDashboardStats(): DashboardStats {
  const [stats, setStats] = useState<DashboardStats>({
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
      // Get current deals count and average discount
      const { data: dealsData, error: dealsError } = await supabase
        .from('current_deals')
        .select('calculated_discount_percent');

      if (dealsError) {
        throw dealsError;
      }

      // Get total products count
      const { count: totalCount, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('last_sync_date', new Date().toISOString().split('T')[0]);

      if (countError) {
        throw countError;
      }

      // Calculate stats
      const activeDeals = dealsData?.length || 0;
      const averageDiscount = dealsData && dealsData.length > 0
        ? Math.round(dealsData.reduce((sum, deal) => sum + (deal.calculated_discount_percent || 0), 0) / dealsData.length)
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

  // Refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchDashboardStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDashboardStats]);

  return {
    ...stats,
    refreshStats: fetchDashboardStats
  };
}

export default useDashboardStats;