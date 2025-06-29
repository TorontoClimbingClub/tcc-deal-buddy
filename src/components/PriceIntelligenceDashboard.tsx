import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TrendingUp, TrendingDown, Target, DollarSign, ShoppingCart, Star, Clock, ArrowUp, ArrowDown, Search, History, Filter } from 'lucide-react'
import { usePriceIntelligence } from '@/hooks/usePriceIntelligence'
import { useProducts } from '@/hooks/useProducts'
import { usePriceHistory } from '@/hooks/usePriceHistory'
import { useGlobalFilters } from '@/contexts/FilterContext'
import { useFilteredProducts } from '@/hooks/useFilteredProducts'
import ProductCard from './ProductCard'
import { PriceHistoryChart } from './PriceHistoryChart'

interface PriceIntelligenceDashboardProps {
  className?: string
}

// Transform BestDeal to Product interface for compatibility
const transformBestDealToProduct = (deal: any) => ({
  id: `${deal.sku}-${deal.merchant_id}`,
  sku: deal.sku,
  name: deal.name,
  brand: deal.brand_name,
  brand_name: deal.brand_name,
  category: deal.category || 'General',
  description: deal.description || '',
  price: deal.retail_price || deal.sale_price || 0,
  sale_price: deal.sale_price,
  retail_price: deal.retail_price,
  discount_percent: deal.discount_percent,
  discount: deal.discount_percent,
  imageUrl: deal.image_url,
  image_url: deal.image_url,
  affiliateUrl: deal.buy_url,
  buy_url: deal.buy_url,
  merchant: deal.merchant_name || 'Unknown',
  merchant_name: deal.merchant_name,
  merchant_id: deal.merchant_id,
  deal_quality_score: deal.deal_quality_score,
  price_trend_status: deal.price_trend_status,
  price_position_percent: deal.price_position_percent
});

export const PriceIntelligenceDashboard: React.FC<PriceIntelligenceDashboardProps> = ({ className }) => {
  const { bestDeals, categoryInsights, loading, searchIntelligentDeals } = usePriceIntelligence()
  const { 
    products, 
    loading: productsLoading, 
    totalProducts,
    currentPage,
    totalPages,
    pageSize,
    searchProducts, 
    searchAllProducts, 
    getAllProducts,
    setPage,
    setPageSize
  } = useProducts()
  const { fetchPriceHistory, loading: historyLoading } = usePriceHistory()
  const { filters, isFilterActive } = useGlobalFilters()
  
  // Transform bestDeals to Product format for filtering
  const transformedDeals = React.useMemo(() => 
    bestDeals.map(transformBestDealToProduct), [bestDeals]
  );
  
  const { filteredProducts, filterStats, hasActiveFilters } = useFilteredProducts(products)
  const { filteredProducts: filteredDeals } = useFilteredProducts(transformedDeals)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [priceHistory, setPriceHistory] = useState<any>(null)
  const [showPriceHistory, setShowPriceHistory] = useState(false)

  // Manual loading only - auto-loading disabled to prevent resource exhaustion
  // Use button to manually load products
  const handleLoadAllProducts = React.useCallback(() => {
    console.log('PriceIntelligenceDashboard: Manual load all products')
    getAllProducts()
  }, [getAllProducts])

  // Handle product selection for price history
  const handleProductSelect = async (product: any) => {
    setSelectedProduct(product)
    setShowPriceHistory(true)
    
    // Fetch price history
    const history = await fetchPriceHistory(product.sku || product.id, product.merchant_id || 18557)
    if (history) {
      setPriceHistory(history)
    }
  }


  // Handle page changes
  const handlePageChange = async (newPage: number) => {
    setPage(newPage)
    if (filters.search.trim()) {
      await searchAllProducts(filters.search, newPage)
    } else {
      await getAllProducts(newPage)
    }
  }

  // Calculate dashboard stats using filtered data
  const dashboardStats = React.useMemo(() => {
    const dealsToAnalyze = filteredDeals.length > 0 ? filteredDeals : transformedDeals
    const totalDeals = dealsToAnalyze.length
    const excellentDeals = dealsToAnalyze.filter(deal => (deal.deal_quality_score || 0) >= 80).length
    const greatPriceDeals = dealsToAnalyze.filter(deal => deal.price_trend_status === 'great_price').length
    const avgDiscount = totalDeals > 0 
      ? dealsToAnalyze.reduce((sum, deal) => sum + (deal.discount_percent || 0), 0) / totalDeals 
      : 0

    return {
      totalDeals,
      excellentDeals,
      greatPriceDeals,
      avgDiscount: avgDiscount.toFixed(1)
    }
  }, [transformedDeals, filteredDeals])

  // Get price trend indicator component
  const PriceTrendIndicator: React.FC<{ status?: string }> = ({ status }) => {
    switch (status) {
      case 'great_price':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <TrendingDown className="h-3 w-3 mr-1" />
            Great Price
          </Badge>
        )
      case 'good_price':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Target className="h-3 w-3 mr-1" />
            Good Price
          </Badge>
        )
      case 'regular_price':
        return (
          <Badge variant="outline">
            <TrendingUp className="h-3 w-3 mr-1" />
            Regular Price
          </Badge>
        )
      case 'new_item':
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <Star className="h-3 w-3 mr-1" />
            New Item
          </Badge>
        )
      default:
        return null
    }
  }

  // Get deal quality indicator
  const DealQualityIndicator: React.FC<{ score?: number }> = ({ score }) => {
    if (!score) return null

    let color = 'gray'
    let label = 'Unknown'
    
    if (score >= 80) {
      color = 'green'
      label = 'Excellent'
    } else if (score >= 60) {
      color = 'blue'
      label = 'Good'
    } else if (score >= 40) {
      color = 'yellow'
      label = 'Fair'
    } else {
      color = 'red'
      label = 'Poor'
    }

    return (
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full bg-${color}-500`} />
        <span className="text-xs text-gray-600">{score}% {label}</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-8 bg-gray-200 rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs defaultValue="all-products" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all-products">All Products</TabsTrigger>
          <TabsTrigger value="deals">Smart Deals</TabsTrigger>
          <TabsTrigger value="categories">Category Insights</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="all-products" className="space-y-4">
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Browse All Products
                {hasActiveFilters && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 ml-2">
                    <Filter className="h-3 w-3 mr-1" />
                    Filtered
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Click on any product to view its complete price history
                {hasActiveFilters && ' • Results filtered by sidebar settings'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filter Indicator */}
              {hasActiveFilters && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Filter className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Showing {filteredProducts.length} of {products.length} products (filtered by sidebar)
                    </span>
                  </div>
                </div>
              )}
              
              {/* Load Products Button */}
              {totalProducts === 0 && !productsLoading && (
                <div className="mb-4 text-center">
                  <Button 
                    onClick={handleLoadAllProducts}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Load All Products ({products.length > 0 ? 'Reload' : 'Load'})
                  </Button>
                  <p className="text-sm text-gray-600 mt-2">
                    Click to load all 1,329 MEC products
                  </p>
                </div>
              )}
              
              {/* Pagination Controls */}
              {totalProducts > 0 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalProducts)} of {totalProducts} products
                    {hasActiveFilters && ` • ${filteredProducts.length} match filters`}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1 || productsLoading}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages || productsLoading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Price History Modal */}
          {showPriceHistory && priceHistory && (
            <PriceHistoryChart 
              priceHistory={priceHistory}
              onClose={() => {
                setShowPriceHistory(false)
                setPriceHistory(null)
              }}
            />
          )}

          {/* Products Grid */}
          <div className={`${filters.viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
            : 'space-y-4'}`}>
            {productsLoading ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 && products.length > 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No products match your filters. Try adjusting them in the sidebar!</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No products found. Try searching for something!</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={handleProductSelect}
                  showPriceIntelligence={true}
                  viewMode={filters.viewMode}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="deals" className="space-y-4">
          {/* Filter Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Smart Deals
                {hasActiveFilters && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                    <Filter className="h-3 w-3 mr-1" />
                    Filtered
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {hasActiveFilters 
                  ? `Best deals filtered by your sidebar settings • ${filteredDeals.length} deals match your criteria`
                  : `Find the best deals using our price intelligence system • ${bestDeals.length} deals available`
                }
              </CardDescription>
            </CardHeader>
            {hasActiveFilters && (
              <CardContent>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Filter className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Use sidebar to modify filters • All deal quality filters applied automatically
                    </span>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Deals Grid */}
          <div className={`${filters.viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
            : 'space-y-4'}`}>
            {(hasActiveFilters ? filteredDeals : transformedDeals).slice(0, 20).map(deal => (
              <Card key={`${deal.sku}-${deal.merchant_id}`} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={deal.image_url || '/placeholder-product.svg'}
                    alt={deal.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-product.svg'
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <PriceTrendIndicator status={deal.price_trend_status} />
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm line-clamp-2">{deal.name}</h3>
                    
                    {deal.brand_name && (
                      <p className="text-xs text-gray-500">{deal.brand_name}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-green-600">
                            ${deal.sale_price?.toFixed(2)}
                          </span>
                          {deal.retail_price && deal.retail_price > (deal.sale_price || 0) && (
                            <span className="text-xs text-gray-500 line-through">
                              ${deal.retail_price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        
                        {deal.discount_percent && deal.discount_percent > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {deal.discount_percent}% OFF
                          </Badge>
                        )}
                      </div>
                      
                      <DealQualityIndicator score={deal.deal_quality_score} />
                    </div>

                    {deal.price_position_percent && (
                      <div className="text-xs text-gray-500">
                        Price position: {deal.price_position_percent}% of yearly range
                      </div>
                    )}

                    {deal.buy_url && (
                      <Button size="sm" className="w-full" asChild>
                        <a href={deal.buy_url} target="_blank" rel="noopener noreferrer">
                          View Deal
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryInsights.map(category => (
              <Card key={`${category.category}-${category.subcategory}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{category.category}</CardTitle>
                  {category.subcategory && (
                    <CardDescription>{category.subcategory}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Products</span>
                      <span className="font-semibold">{category.total_products}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">On Sale</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{category.products_on_sale}</span>
                        <Badge variant="outline">
                          {((category.products_on_sale / category.total_products) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>

                    {category.avg_discount_percent && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Avg Discount</span>
                        <span className="font-semibold text-green-600">
                          {category.avg_discount_percent.toFixed(1)}%
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Price Range</span>
                      <span className="font-semibold">
                        ${category.min_price?.toFixed(0)} - ${category.max_price?.toFixed(0)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Brands</span>
                      <span className="font-semibold">{category.unique_brands}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Trends</CardTitle>
              <CardDescription>
                Coming soon: Historical price trends and market analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Market trend analysis is being prepared.</p>
                <p className="text-sm">This will show price movements over time.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
