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
  RefreshCw, 
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

interface ProductGridProps {
  showPriceIntelligence?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ showPriceIntelligence = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastSearchTerm, setLastSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'discount' | 'name'>('discount');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
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

  // Extract unique categories and brands from actual products
  const categories = useMemo(() => 
    [...new Set(products.map(p => p.category))], [products]);
  const brands = useMemo(() => 
    [...new Set(products.filter(p => p.brand).map(p => p.brand!))].sort(), [products]);

  // Dashboard statistics
  const dashboardStats = useMemo(() => {
    const validProducts = products.filter(p => p.price > 0);
    const discountedProducts = validProducts.filter(p => p.discount && p.discount > 0);
    
    return {
      totalDeals: validProducts.length,
      avgDiscount: discountedProducts.length > 0 
        ? Math.round(discountedProducts.reduce((sum, p) => sum + (p.discount || 0), 0) / discountedProducts.length)
        : 0,
      bestDeal: Math.max(...discountedProducts.map(p => p.discount || 0), 0),
      totalSavings: discountedProducts.reduce((sum, p) => {
        const savings = p.originalPrice ? p.originalPrice - p.price : 0;
        return sum + savings;
      }, 0),
      categoriesCount: categories.length,
      brandsCount: brands.length
    };
  }, [products, categories, brands]);

  // Trending categories
  const trendingCategories = useMemo(() => {
    const categoryCount = categories.reduce((acc, cat) => {
      acc[cat] = products.filter(p => p.category === cat).length;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 4)
      .map(([name, count]) => ({ name, count }));
  }, [categories, products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesBrand = selectedBrand === 'all' || product.brand === selectedBrand;
      
      let matchesPrice = true;
      if (priceRange !== 'all') {
        const price = product.price;
        switch (priceRange) {
          case '0-25': matchesPrice = price <= 25; break;
          case '25-50': matchesPrice = price > 25 && price <= 50; break;
          case '50-100': matchesPrice = price > 50 && price <= 100; break;
          case '100-200': matchesPrice = price > 100 && price <= 200; break;
          case '200+': matchesPrice = price > 200; break;
        }
      }
      
      return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
    });

    // Sort products
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'discount':
          return (b.discount || 0) - (a.discount || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [products, searchTerm, selectedCategory, selectedBrand, priceRange, sortBy]);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleSearch = async () => {
    const term = searchTerm.trim() || 'gear';
    setLastSearchTerm(term);
    await searchProducts(term);
  };

  const handleRefresh = async () => {
    if (lastSearchTerm) {
      await searchProducts(lastSearchTerm);
    } else {
      await refreshProducts();
    }
  };

  const handleSearchDeals = async () => {
    const term = searchTerm.trim() || 'gear';
    await searchProducts(term);
    setLastSearchTerm(term);
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
              Discover amazing deals on outdoor gear from top brands
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{filteredProducts.length}</div>
            <div className="text-sm text-gray-500">deals available</div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-700">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deals</p>
                <p className="text-2xl font-bold text-blue-600">{dashboardStats.totalDeals}</p>
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
                <p className="text-2xl font-bold text-green-600">{dashboardStats.avgDiscount}%</p>
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
                <p className="text-2xl font-bold text-purple-600">{dashboardStats.categoriesCount}</p>
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
                <p className="text-2xl font-bold text-red-600">{dashboardStats.bestDeal}%</p>
              </div>
              <Star className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Deals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search for products, brands, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-25">$0 - $25</SelectItem>
                  <SelectItem value="25-50">$25 - $50</SelectItem>
                  <SelectItem value="50-100">$50 - $100</SelectItem>
                  <SelectItem value="100-200">$100 - $200</SelectItem>
                  <SelectItem value="200+">$200+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount">Best Discount</SelectItem>
                  <SelectItem value="price">Lowest Price</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSearch}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
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
            Sorted by {sortBy === 'discount' ? 'Best Discount' : sortBy === 'price' ? 'Lowest Price' : 'Name A-Z'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
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
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
          : "space-y-4"
        }>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={handleViewDetails}
              showPriceIntelligence={showPriceIntelligence}
              viewMode={viewMode}
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedBrand('all');
                  setPriceRange('all');
                  setSearchTerm('');
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trending Categories */}
      {trendingCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trending Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trendingCategories.map((category) => (
                <div
                  key={category.name}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => setSelectedCategory(category.name)}
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