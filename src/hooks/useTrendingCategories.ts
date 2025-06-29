import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface TrendingCategory {
  category: string;
  deals: number;
  trend: string;
  previousWeekDeals: number;
  averageDiscount: number;
  trendDirection: 'up' | 'down' | 'neutral';
  growthPercent: number;
}

interface CategoryStats {
  category: string;
  dealCount: number;
  averageDiscount: number;
}

interface UseTrendingCategoriesResult {
  trendingCategories: TrendingCategory[];
  loading: boolean;
  error: string | null;
  refreshTrendingCategories: () => Promise<void>;
}

export function useTrendingCategories(): UseTrendingCategoriesResult {
  const [trendingCategories, setTrendingCategories] = useState<TrendingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCategoryStats = useCallback(async (startDate: string, endDate: string): Promise<CategoryStats[]> => {
    const { data, error } = await supabase
      .from('current_deals')
      .select('category, calculated_discount_percent')
      .gte('created_at', startDate)
      .lt('created_at', endDate)
      .not('category', 'is', null);

    if (error) throw error;

    // Group by category and calculate stats
    const categoryMap = new Map<string, { count: number; totalDiscount: number; discountCount: number }>();

    data.forEach(deal => {
      if (!deal.category) return;
      
      const category = deal.category;
      const discount = deal.calculated_discount_percent || 0;
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { count: 0, totalDiscount: 0, discountCount: 0 });
      }
      
      const stats = categoryMap.get(category)!;
      stats.count++;
      
      if (discount > 0) {
        stats.totalDiscount += discount;
        stats.discountCount++;
      }
    });

    return Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      dealCount: stats.count,
      averageDiscount: stats.discountCount > 0 ? stats.totalDiscount / stats.discountCount : 0
    }));
  }, []);

  const calculateTrendingCategories = useCallback(async (): Promise<TrendingCategory[]> => {
    const now = new Date();
    const currentWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previousWeekStart = new Date(currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Format dates for Supabase
    const currentWeekStartStr = currentWeekStart.toISOString();
    const nowStr = now.toISOString();
    const previousWeekStartStr = previousWeekStart.toISOString();
    const currentWeekStartStr2 = currentWeekStart.toISOString();

    // Get current week and previous week stats
    const [currentWeekStats, previousWeekStats] = await Promise.all([
      getCategoryStats(currentWeekStartStr, nowStr),
      getCategoryStats(previousWeekStartStr, currentWeekStartStr2)
    ]);

    // Create a map of previous week stats for easy lookup
    const previousWeekMap = new Map(previousWeekStats.map(stat => [stat.category, stat]));

    // Calculate trending data for current week categories
    const trendingData: TrendingCategory[] = currentWeekStats
      .filter(stat => stat.dealCount >= 5) // Minimum threshold for inclusion
      .map(currentStat => {
        const previousStat = previousWeekMap.get(currentStat.category);
        const previousDeals = previousStat?.dealCount || 0;
        
        const growthPercent = previousDeals > 0 
          ? Math.round(((currentStat.dealCount - previousDeals) / previousDeals) * 100)
          : currentStat.dealCount > 0 ? 100 : 0;

        const trendDirection: 'up' | 'down' | 'neutral' = 
          growthPercent > 5 ? 'up' :
          growthPercent < -5 ? 'down' : 'neutral';

        const trendSign = growthPercent > 0 ? '+' : '';
        const trendText = `${trendSign}${growthPercent}%`;

        return {
          category: currentStat.category,
          deals: currentStat.dealCount,
          trend: trendText,
          previousWeekDeals: previousDeals,
          averageDiscount: Math.round(currentStat.averageDiscount),
          trendDirection,
          growthPercent
        };
      })
      .sort((a, b) => {
        // Sort by current deal count first, then by growth
        if (b.deals !== a.deals) {
          return b.deals - a.deals;
        }
        return b.growthPercent - a.growthPercent;
      })
      .slice(0, 4); // Top 4 categories

    return trendingData;
  }, [getCategoryStats]);

  const refreshTrendingCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const trending = await calculateTrendingCategories();
      setTrendingCategories(trending);
    } catch (err: unknown) {
      console.error('Error fetching trending categories:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch trending categories';
      setError(errorMessage);
      
      // Fallback to mock data if error occurs
      setTrendingCategories([
        { category: "Outdoor Gear", deals: 45, trend: "+12%", previousWeekDeals: 40, averageDiscount: 15, trendDirection: 'up', growthPercent: 12 },
        { category: "Clothing", deals: 38, trend: "+8%", previousWeekDeals: 35, averageDiscount: 18, trendDirection: 'up', growthPercent: 8 },
        { category: "Footwear", deals: 32, trend: "-3%", previousWeekDeals: 33, averageDiscount: 20, trendDirection: 'down', growthPercent: -3 },
        { category: "Equipment", deals: 28, trend: "+25%", previousWeekDeals: 22, averageDiscount: 12, trendDirection: 'up', growthPercent: 25 }
      ]);
    } finally {
      setLoading(false);
    }
  }, [calculateTrendingCategories]);

  useEffect(() => {
    refreshTrendingCategories();
  }, [refreshTrendingCategories]);

  return {
    trendingCategories,
    loading,
    error,
    refreshTrendingCategories
  };
}

export default useTrendingCategories;