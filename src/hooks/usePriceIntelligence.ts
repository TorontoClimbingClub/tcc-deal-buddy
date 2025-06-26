
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

  // Fetch best deals from current_deals table (existing table)
  const fetchBestDeals = async (limit: number = 50) => {
    try {
      const { data, error } = await supabase
        .from('current_deals')
        .select('*')
        .not('discount_percent', 'is', null)
        .gte('discount_percent', 20)
        .order('discount_percent', { ascending: false })
        .limit(limit)

      if (error) throw error
      
      // Transform current_deals data to BestDeal format
      const transformedDeals: BestDeal[] = (data || []).map(deal => ({
        id: deal.id || '',
        sku: deal.sku || '',
        merchant_id: deal.merchant_id || 0,
        merchant_name: deal.merchant_name || '',
        name: deal.name || '',
        brand_name: deal.brand_name,
        sale_price: deal.sale_price,
        retail_price: deal.retail_price,
        discount_percent: deal.discount_percent,
        category: deal.category,
        subcategory: deal.subcategory,
        image_url: deal.image_url,
        buy_url: deal.buy_url,
        deal_quality_score: deal.discount_percent ? Math.min(100, deal.discount_percent * 2) : 0,
        price_trend_status: deal.discount_percent >= 40 ? 'great_price' : 
                           deal.discount_percent >= 25 ? 'good_price' : 'regular_price'
      }))
      
      setBestDeals(transformedDeals)
    } catch (err) {
      console.error('Error fetching best deals:', err)
      throw err
    }
  }

  // Generate category insights from products table
  const fetchCategoryInsights = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category, brand_name, sale_price, retail_price, discount_percent')
        .not('category', 'is', null)

      if (error) throw error

      // Group by category and calculate insights
      const categoryMap = new Map<string, any>()
      
      data?.forEach(product => {
        const category = product.category || 'Unknown'
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            category,
            total_products: 0,
            products_on_sale: 0,
            prices: [],
            brands: new Set(),
            discounts: []
          })
        }
        
        const cat = categoryMap.get(category)
        cat.total_products++
        
        if (product.discount_percent && product.discount_percent > 0) {
          cat.products_on_sale++
          cat.discounts.push(product.discount_percent)
        }
        
        if (product.sale_price) {
          cat.prices.push(product.sale_price)
        }
        
        if (product.brand_name) {
          cat.brands.add(product.brand_name)
        }
      })

      // Convert to CategoryInsight format
      const insights: CategoryInsight[] = Array.from(categoryMap.values()).map(cat => ({
        category: cat.category,
        total_products: cat.total_products,
        products_on_sale: cat.products_on_sale,
        avg_discount_percent: cat.discounts.length > 0 ? 
          cat.discounts.reduce((sum: number, d: number) => sum + d, 0) / cat.discounts.length : 0,
        min_price: cat.prices.length > 0 ? Math.min(...cat.prices) : 0,
        max_price: cat.prices.length > 0 ? Math.max(...cat.prices) : 0,
        unique_brands: cat.brands.size,
        merchants_count: 1 // Simplified for now
      }))

      setCategoryInsights(insights.sort((a, b) => b.total_products - a.total_products))
    } catch (err) {
      console.error('Error fetching category insights:', err)
      throw err
    }
  }

  // Mock market trends for now
  const fetchMarketTrends = async (period: 'daily' | 'weekly' | 'monthly' = 'weekly') => {
    try {
      // Generate mock trend data based on current products
      const mockTrends: MarketTrend[] = [
        {
          id: '1',
          category: 'Climbing Gear',
          trend_period: period,
          total_products: 450,
          products_on_sale: 89,
          average_discount_percent: 23.5,
          calculated_date: new Date().toISOString()
        },
        {
          id: '2', 
          category: 'Winter Clothing',
          trend_period: period,
          total_products: 320,
          products_on_sale: 67,
          average_discount_percent: 28.2,
          calculated_date: new Date().toISOString()
        },
        {
          id: '3',
          category: 'Hiking Boots',
          trend_period: period,
          total_products: 180,
          products_on_sale: 45,
          average_discount_percent: 19.8,
          calculated_date: new Date().toISOString()
        }
      ]
      
      setMarketTrends(mockTrends)
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
        .from('price_history')
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

  // Search for deals with intelligence filters using existing tables
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
        .from('current_deals')
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
        query = query.gte('discount_percent', filters.dealQualityThreshold / 2) // Simplified mapping
      }

      // Apply sorting
      const sortBy = filters.sortBy === 'deal_quality_score' ? 'discount_percent' : 
                     filters.sortBy || 'discount_percent'
      query = query.order(sortBy, { ascending: false, nullsFirst: false })

      // Apply limit
      query = query.limit(filters.limit || 50)

      const { data, error } = await query

      if (error) throw error
      
      // Transform to BestDeal format
      const transformedDeals: BestDeal[] = (data || []).map(deal => ({
        id: deal.id || '',
        sku: deal.sku || '',
        merchant_id: deal.merchant_id || 0,
        merchant_name: deal.merchant_name || '',
        name: deal.name || '',
        brand_name: deal.brand_name,
        sale_price: deal.sale_price,
        retail_price: deal.retail_price,
        discount_percent: deal.discount_percent,
        category: deal.category,
        subcategory: deal.subcategory,
        image_url: deal.image_url,
        buy_url: deal.buy_url,
        deal_quality_score: deal.discount_percent ? Math.min(100, deal.discount_percent * 2) : 0,
        price_trend_status: deal.discount_percent >= 40 ? 'great_price' : 
                           deal.discount_percent >= 25 ? 'good_price' : 'regular_price'
      }))
      
      return transformedDeals
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

      const prices = priceHistory.map(p => p.price)
      const currentPrice = prices[prices.length - 1]
      const yearlyLow = Math.min(...prices)
      const yearlyHigh = Math.max(...prices)

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
