
import React, { useState, useMemo, useEffect } from 'react';
import ProductCard, { Product } from './ProductCard';
import ProductModal from './ProductModal';
import Header from './Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, AlertCircle, Filter, Search, TrendingUp, ShoppingBag, Star, DollarSign } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';

const ProductGrid: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastSearchTerm, setLastSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'discount' | 'name'>('discount');
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Products now loaded from Supabase database (all merchants)

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

  // Products automatically load from database on mount via useProducts hook

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
      }, 0)
    };
  }, [products]);

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
      // Search filter
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !product.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // Brand filter
      if (selectedBrand !== 'all' && product.brand !== selectedBrand) {
        return false;
      }

      // Price range filter
      if (priceRange !== 'all') {
        const [min, max] = priceRange.split('-').map(p => p.replace('+', ''));
        const minPrice = parseFloat(min);
        const maxPrice = max ? parseFloat(max) : Infinity;
        
        if (product.price < minPrice || product.price > maxPrice) {
          return false;
        }
      }

      return true;
    });

    // Sort products
    filtered.sort((a, b) => {
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

    return filtered;
  }, [products, searchTerm, selectedCategory, selectedBrand, priceRange, sortBy]);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      setLastSearchTerm(searchTerm);
      await searchProducts(searchTerm.trim());
    } else {
      await getCurrentDeals();
    }
  };

  const handleQuickSearch = async (term: string) => {
    setSearchTerm(term);
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
    <>
      <Header 
        totalDeals={dashboardStats.totalDeals}
        avgDiscount={dashboardStats.avgDiscount}
        lastUpdate="Just now"
        loading={loading}
      />
      
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Control Panel */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search Bar */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search deals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterOpen(!filterOpen)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="discount">Best Discount</option>
                  <option value="price">Lowest Price</option>
                  <option value="name">Name A-Z</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Filter Panel */}
            {filterOpen && (
              <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <select 
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Brands</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                  <select 
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Prices</option>
                    <option value="0-50">Under $50</option>
                    <option value="50-100">$50 - $100</option>
                    <option value="100-200">$100 - $200</option>
                    <option value="200+">Over $200</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {loading ? 'Loading...' : `${filteredProducts.length} Deals Found`}
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>Sorted by:</span>
                  <Badge variant="secondary">
                    {sortBy === 'discount' ? 'Best Discount' : sortBy === 'price' ? 'Lowest Price' : 'Name A-Z'}
                  </Badge>
                </div>
              </div>

              {/* Loading State */}
              {loading && products.length === 0 && (
                <div className="text-center py-24">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Loading amazing deals...</p>
                </div>
              )}

              {/* Products Grid */}
              {products.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              )}

              {/* No Results */}
              {filteredProducts.length === 0 && !loading && products.length > 0 && (
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No products match your filters</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedMerchant('all');
                      setPriceRange('all');
                      setSearchTerm('');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Savings</span>
                    <span className="font-semibold text-green-600">
                      ${dashboardStats.totalSavings.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Best Deal</span>
                    <span className="font-semibold text-red-600">
                      {dashboardStats.bestDeal}% off
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Categories</span>
                    <span className="font-semibold">{categories.length}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Trending Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Trending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trendingCategories.map((category, index) => (
                      <button
                        key={category.name}
                        onClick={() => setSelectedCategory(category.name)}
                        className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded text-left"
                      >
                        <span className="text-sm">{category.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {category.count}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Quick Searches
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      setSearchTerm('clearance');
                      handleQuickSearch('clearance');
                    }}
                  >
                    Clearance Items
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      setSearchTerm('climbing shoes');
                      handleQuickSearch('climbing shoes');
                    }}
                  >
                    Climbing Shoes
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleSearchDeals}
                  >
                    All Sale Items
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default ProductGrid;
