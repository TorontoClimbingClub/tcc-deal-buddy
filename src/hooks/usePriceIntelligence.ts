import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface PriceTrend {
  product_sku: string
  merchant_id: number
  recorded_date: string
  price: number
  is_sale: boolean
  discount_percent?: number
  avg_7_day_price?: number
  avg_30_day_price?: number
  yearly_low?: number
  yearly_high?: number
  price_volatility_30d?: number
}

export interface BestDeal {
  id: string
  sku: string
  merchant_id: number
  merchant_name: string
  name: string
  brand_name?: string
  sale_price?: number
  retail_price?: number
  discount_percent?: number
  category?: string
  subcategory?: string
  image_url?: string
  buy_url?: string
  yearly_low?: number
  yearly_high?: number
  avg_30_day_price?: number
  deal_quality_score?: number
  price_position_percent?: number
  price_trend_status?: 'great_price' | 'good_price' | 'regular_price' | 'new_item'
}

export interface CategoryInsight {
  category: string
  subcategory?: string
  total_products: number
  products_on_sale: number
  avg_discount_percent?: number
  avg_sale_price?: number
  median_price?: number
  min_price?: number
  max_price?: number
  unique_brands: number
  merchants_count: number
}

export interface MarketTrend {
  id: string
  category: string
  subcategory?: string
  brand_name?: string
  merchant_id?: number
  trend_period: 'daily' | 'weekly' | 'monthly' | 'seasonal'
  average_price?: number
  median_price?: number
  min_price?: number
  max_price?: number
  total_products: number
  products_on_sale: number
  average_discount_percent?: number
  calculated_date: string
}

export const usePriceIntelligence = () => {
  const [bestDeals, setBestDeals] = useState<BestDeal[]>([])
  const [categoryInsights, setCategoryInsights] = useState<CategoryInsight[]>([])
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch best deals with intelligence scoring
  const fetchBestDeals = async (limit: number = 50) => {
    try {
      const { data, error } = await supabase
        .from('best_deals')
        .select('*')
        .order('deal_quality_score', { ascending: false, nullsFirst: false })
        .order('discount_percent', { ascending: false })
        .limit(limit)

      if (error) throw error
      setBestDeals(data || [])
    } catch (err) {
      console.error('Error fetching best deals:', err)
      throw err
    }
  }

  // Fetch category insights
  const fetchCategoryInsights = async () => {
    try {
      const { data, error } = await supabase
        .from('category_insights')
        .select('*')
        .order('total_products', { ascending: false })
        .limit(20)

      if (error) throw error
      setCategoryInsights(data || [])
    } catch (err) {
      console.error('Error fetching category insights:', err)
      throw err
    }
  }

  // Fetch market trends
  const fetchMarketTrends = async (period: 'daily' | 'weekly' | 'monthly' = 'weekly') => {
    try {
      const { data, error } = await supabase
        .from('market_trends')
        .select('*')
        .eq('trend_period', period)
        .order('calculated_date', { ascending: false })
        .limit(50)

      if (error) throw error
      setMarketTrends(data || [])
    } catch (err) {
      console.error('Error fetching market trends:', err)
      throw err
    }
  }

  // Get price history for a specific product
  const getProductPriceHistory = async (
    productSku: string, 
    merchantId: number, 
    days: number = 90
  ): Promise<PriceTrend[]> => {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      const { data, error } = await supabase
        .from('price_trends')
        .select('*')
        .eq('product_sku', productSku)
        .eq('merchant_id', merchantId)
        .gte('recorded_date', cutoffDate.toISOString().split('T')[0])
        .order('recorded_date', { ascending: true })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching price history:', err)
      return []
    }
  }

  // Search for deals with intelligence filters
  const searchIntelligentDeals = async (filters: {
    category?: string
    minDiscount?: number
    maxPrice?: number
    dealQualityThreshold?: number
    pricePosition?: 'great_price' | 'good_price' | 'regular_price'
    sortBy?: 'deal_quality_score' | 'discount_percent' | 'price_position_percent'
    limit?: number
  }) => {
    try {
      let query = supabase
        .from('best_deals')
        .select('*')

      // Apply filters
      if (filters.category) {
        query = query.ilike('category', `%${filters.category}%`)
      }

      if (filters.minDiscount) {
        query = query.gte('discount_percent', filters.minDiscount)
      }

      if (filters.maxPrice) {
        query = query.lte('sale_price', filters.maxPrice)
      }

      if (filters.dealQualityThreshold) {
        query = query.gte('deal_quality_score', filters.dealQualityThreshold)
      }

      if (filters.pricePosition) {
        query = query.eq('price_trend_status', filters.pricePosition)
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'deal_quality_score'
      query = query.order(sortBy, { ascending: false, nullsFirst: false })

      // Apply limit
      query = query.limit(filters.limit || 50)

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error searching intelligent deals:', err)
      return []
    }
  }

  // Get price recommendations for a product
  const getProductPriceRecommendations = async (
    productSku: string,
    merchantId: number
  ) => {
    try {
      const priceHistory = await getProductPriceHistory(productSku, merchantId, 365)
      
      if (priceHistory.length === 0) {
        return {
          recommendation: 'insufficient_data',
          message: 'Not enough price history to make recommendations'
        }
      }

      const latestData = priceHistory[priceHistory.length - 1]
      const currentPrice = latestData.price
      const yearlyLow = latestData.yearly_low
      const yearlyHigh = latestData.yearly_high
      const avg30Day = latestData.avg_30_day_price

      if (!yearlyLow || !yearlyHigh || !avg30Day) {
        return {
          recommendation: 'insufficient_data',
          message: 'Not enough price history to make recommendations'
        }
      }

      // Calculate recommendation based on price position
      const pricePosition = ((currentPrice - yearlyLow) / (yearlyHigh - yearlyLow)) * 100

      if (pricePosition <= 25) {
        return {
          recommendation: 'buy_now',
          message: 'Excellent price! This is near the yearly low.',
          confidence: 'high',
          pricePosition: pricePosition.toFixed(1)
        }
      } else if (pricePosition <= 50) {
        return {
          recommendation: 'good_buy',
          message: 'Good price - below average for this item.',
          confidence: 'medium',
          pricePosition: pricePosition.toFixed(1)
        }
      } else if (pricePosition <= 75) {
        return {
          recommendation: 'wait',
          message: 'Price is above average. Consider waiting for a better deal.',
          confidence: 'medium',
          pricePosition: pricePosition.toFixed(1)
        }
      } else {
        return {
          recommendation: 'wait',
          message: 'Price is near yearly high. Definitely wait for a sale.',
          confidence: 'high',
          pricePosition: pricePosition.toFixed(1)
        }
      }
    } catch (err) {
      console.error('Error getting price recommendations:', err)
      return {
        recommendation: 'error',
        message: 'Unable to fetch price recommendations'
      }
    }
  }

  // Calculate category performance metrics
  const getCategoryPerformance = (category: string) => {
    const categoryData = categoryInsights.find(c => c.category === category)
    if (!categoryData) return null

    const salePercentage = (categoryData.products_on_sale / categoryData.total_products) * 100
    const avgDiscount = categoryData.avg_discount_percent || 0

    return {
      ...categoryData,
      sale_percentage: salePercentage.toFixed(1),
      performance_score: ((salePercentage * 0.3) + (avgDiscount * 0.7)).toFixed(1)
    }
  }

  // Load all intelligence data
  const loadAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      await Promise.all([
        fetchBestDeals(),
        fetchCategoryInsights(),
        fetchMarketTrends()
      ])
    } catch (err) {
      console.error('Error loading price intelligence data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load price intelligence data')
    } finally {
      setLoading(false)
    }
  }

  // Initialize data loading
  useEffect(() => {
    loadAllData()
  }, [])

  return {
    // Data
    bestDeals,
    categoryInsights,
    marketTrends,
    loading,
    error,

    // Methods
    fetchBestDeals,
    fetchCategoryInsights,
    fetchMarketTrends,
    getProductPriceHistory,
    searchIntelligentDeals,
    getProductPriceRecommendations,
    getCategoryPerformance,
    loadAllData,
    refetch: loadAllData
  }
}