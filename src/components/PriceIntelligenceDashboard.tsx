import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TrendingUp, TrendingDown, Target, DollarSign, ShoppingCart, Star, Clock, ArrowUp, ArrowDown, Search, History } from 'lucide-react'
import { usePriceIntelligence } from '@/hooks/usePriceIntelligence'
import { useProducts } from '@/hooks/useProducts'
import { usePriceHistory } from '@/hooks/usePriceHistory'
import { ProductCard } from './ProductCard'
import { PriceHistoryChart } from './PriceHistoryChart'

interface PriceIntelligenceDashboardProps {
  className?: string
}

export const PriceIntelligenceDashboard: React.FC<PriceIntelligenceDashboardProps> = ({ className }) => {
  const { bestDeals, categoryInsights, loading, searchIntelligentDeals } = usePriceIntelligence()
  const { products, loading: productsLoading, searchProducts, searchAllProducts, getAllProducts } = useProducts()
  const { fetchPriceHistory, loading: historyLoading } = usePriceHistory()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [dealQualityFilter, setDealQualityFilter] = useState<string>('all')
  const [filteredDeals, setFilteredDeals] = useState(bestDeals)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [priceHistory, setPriceHistory] = useState<any>(null)
  const [showPriceHistory, setShowPriceHistory] = useState(false)

  // Apply filters to deals
  const applyFilters = async () => {
    const filters: any = {}
    
    if (selectedCategory !== 'all') {
      filters.category = selectedCategory
    }
    
    if (dealQualityFilter === 'excellent') {
      filters.dealQualityThreshold = 80
    } else if (dealQualityFilter === 'good') {
      filters.dealQualityThreshold = 60
    } else if (dealQualityFilter === 'great_price') {
      filters.pricePosition = 'great_price'
    }

    const results = await searchIntelligentDeals(filters)
    setFilteredDeals(results)
  }

  React.useEffect(() => {
    applyFilters()
  }, [selectedCategory, dealQualityFilter, bestDeals])

  // Load all products on component mount for the "All Products" tab
  React.useEffect(() => {
    getAllProducts()
  }, [])

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

  // Handle product search
  const handleSearch = async () => {
    if (searchTerm.trim()) {
      await searchAllProducts(searchTerm)
    } else {
      await getAllProducts()
    }
  }

  // Calculate dashboard stats
  const dashboardStats = React.useMemo(() => {
    const totalDeals = bestDeals.length
    const excellentDeals = bestDeals.filter(deal => (deal.deal_quality_score || 0) >= 80).length
    const greatPriceDeals = bestDeals.filter(deal => deal.price_trend_status === 'great_price').length
    const avgDiscount = bestDeals.reduce((sum, deal) => sum + (deal.discount_percent || 0), 0) / totalDeals || 0

    return {
      totalDeals,
      excellentDeals,
      greatPriceDeals,
      avgDiscount: avgDiscount.toFixed(1)
    }
  }, [bestDeals])

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
          {/* Search Bar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Browse All Products
              </CardTitle>
              <CardDescription>
                Click on any product to view its complete price history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch} disabled={productsLoading}>
                  {productsLoading ? 'Searching...' : 'Search'}
                </Button>
              </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productsLoading ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No products found. Try searching for something!</p>
              </div>
            ) : (
              products.map((product) => (
                <Card 
                  key={product.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer border-gray-200"
                  onClick={() => handleProductSelect(product)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm line-clamp-2 flex-1">{product.name}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleProductSelect(product)
                        }}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {product.imageUrl && (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-32 object-cover rounded mb-3"
                      />
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold">${product.price}</p>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <p className="text-sm text-gray-500 line-through">
                            ${product.originalPrice}
                          </p>
                        )}
                      </div>
                      {product.discount && (
                        <Badge variant="secondary" className="bg-green-50 text-green-700">
                          -{product.discount}%
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                      <span>{product.merchant}</span>
                      {product.category && (
                        <>
                          <span>•</span>
                          <span>{product.category}</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="deals" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Deals</CardTitle>
              <CardDescription>
                Find the best deals using our price intelligence system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categoryInsights.slice(0, 10).map(category => (
                      <SelectItem key={category.category} value={category.category}>
                        {category.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={dealQualityFilter} onValueChange={setDealQualityFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Deal Quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Qualities</SelectItem>
                    <SelectItem value="excellent">Excellent Deals (80%+)</SelectItem>
                    <SelectItem value="good">Good Deals (60%+)</SelectItem>
                    <SelectItem value="great_price">Great Prices Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Deals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDeals.slice(0, 20).map(deal => (
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