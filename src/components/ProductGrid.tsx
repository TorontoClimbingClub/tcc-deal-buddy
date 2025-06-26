import React, { useState, useMemo, useEffect } from 'react';
import ProductCard, { Product } from './ProductCard';
import ProductModal from './ProductModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  TrendingUp, 
  ShoppingBag, 
  Star, 
  DollarSign,
  Package,
  Percent,
  ArrowUpDown
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useGlobalFilters } from '../contexts/FilterContext';
import { useFilteredProducts } from '../hooks/useFilteredProducts';

interface ProductGridProps {
  showPriceIntelligence?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ showPriceIntelligence = false }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastSearchTerm, setLastSearchTerm] = useState('');
  
  const {
    products,
    loading,
    error,
    totalProducts,
    getCurrentDeals,
    getProductsByMerchant,
    searchProducts,
    refreshProducts
  } = useProducts();

  const { filters } = useGlobalFilters();
  const { filteredProducts, filterStats, hasActiveFilters } = useFilteredProducts(products);

  // Trending categories based on filtered products
  const trendingCategories = useMemo(() => {
    const categoryCount = filteredProducts.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 4)
      .map(([name, count]) => ({ name, count }));
  }, [filteredProducts]);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleSearch = async () => {
    const term = filters.search.trim() || 'gear';
    setLastSearchTerm(term);
    await searchProducts(term);
  };


  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              🛍️ All Deals
            </h1>
            <p className="text-gray-600">
              {hasActiveFilters 
                ? `Filtered results from your sidebar settings`
                : `Discover amazing deals on outdoor gear from top brands`
              }
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{filteredProducts.length}</div>
            <div className="text-sm text-gray-500">
              {hasActiveFilters ? 'filtered deals' : 'deals available'}
            </div>
          </div>
        </div>
        
        {/* Active Filter Indicator */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">
                Global filters active - use sidebar to modify
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-700">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats - Using Filtered Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {hasActiveFilters ? 'Filtered Deals' : 'Total Deals'}
                </p>
                <p className="text-2xl font-bold text-blue-600">{filterStats.totalDeals}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Discount</p>
                <p className="text-2xl font-bold text-green-600">{filterStats.avgDiscount}%</p>
              </div>
              <Percent className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-purple-600">{filterStats.categoriesCount}</p>
              </div>
              <Filter className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Best Deal</p>
                <p className="text-2xl font-bold text-red-600">{filterStats.bestDeal}%</p>
              </div>
              <Star className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Use sidebar for global search or search API here..."
                value={filters.search}
                disabled
                className="pl-10 bg-gray-50"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search API
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Header and View Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {loading ? 'Loading...' : `${filteredProducts.length} Deals Found`}
          </h2>
          <p className="text-sm text-gray-500">
            Sorted by {filters.sortBy === 'discount' ? 'Best Discount' : 
                      filters.sortBy === 'price' ? 'Lowest Price' : 
                      filters.sortBy === 'name' ? 'Name A-Z' : 'Newest First'}
            {hasActiveFilters && ' (filtered by sidebar)'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            View mode controlled by sidebar
          </Badge>
        </div>
      </div>

      {/* Loading State */}
      {loading && products.length === 0 && (
        <Card>
          <CardContent className="py-24">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Loading amazing deals...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Grid/List */}
      {products.length > 0 && (
        <div className={filters.viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
          : "space-y-4"
        }>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={handleViewDetails}
              showPriceIntelligence={showPriceIntelligence}
              viewMode={filters.viewMode}
            />
          ))}
        </div>
      )}

      {/* No Results */}
      {filteredProducts.length === 0 && !loading && products.length > 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products match your filters</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters in the sidebar or search for new products</p>
              <div className="space-x-2">
                <Button 
                  variant="outline"
                  onClick={handleSearch}
                >
                  Search API for More Products
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Products At All */}
      {products.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products loaded</h3>
              <p className="text-gray-500 mb-4">Search for products to get started</p>
              <Button onClick={handleSearch}>
                Search for Products
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trending Categories - Based on Filtered Results */}
      {trendingCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {hasActiveFilters ? 'Categories in Filtered Results' : 'Trending Categories'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trendingCategories.map((category) => (
                <div
                  key={category.name}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{category.name}</p>
                    <p className="text-sm text-gray-500">{category.count} deals</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default ProductGrid;