
import React, { useState, useMemo, useEffect } from 'react';
import ProductCard, { Product } from './ProductCard';
import SearchFilters from './SearchFilters';
import ProductModal from './ProductModal';
import { MerchantConfig } from './MerchantConfig';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, RefreshCw, AlertCircle, Target, ShoppingBag } from 'lucide-react';
import { useAvantLink } from '../hooks/useAvantLink';

const ProductGrid: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMerchant, setSelectedMerchant] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastSearchTerm, setLastSearchTerm] = useState('');
  const [selectedMerchants, setSelectedMerchants] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('deals');

  const {
    products,
    loading,
    error,
    searchProducts,
    getPopularProducts,
    getSaleProducts,
    getSaleProductsByMerchants,
    isConfigured
  } = useAvantLink();

  // Load merchant sale products on mount if configured and merchants selected
  useEffect(() => {
    if (isConfigured && products.length === 0) {
      if (selectedMerchants.length > 0) {
        getSaleProductsByMerchants(selectedMerchants);
      } else {
        // Show general sale products if no merchants configured
        getSaleProducts();
      }
    }
  }, [isConfigured, products.length, selectedMerchants, getSaleProductsByMerchants, getSaleProducts]);

  // Extract unique categories and merchants from actual products
  const categories = useMemo(() => 
    [...new Set(products.map(p => p.category))], [products]);
  const merchants = useMemo(() => 
    [...new Set(products.map(p => p.merchant))], [products]);

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search filter
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !product.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // Merchant filter
      if (selectedMerchant !== 'all' && product.merchant !== selectedMerchant) {
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
  }, [products, searchTerm, selectedCategory, selectedMerchant, priceRange]);

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
      await searchProducts({
        searchTerm: searchTerm.trim(),
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        resultsPerPage: 20
      });
    } else {
      getPopularProducts();
    }
  };

  const handleQuickSearch = (term: string) => {
    setSearchTerm(term);
    setLastSearchTerm(term);
    searchProducts({
      searchTerm: term,
      resultsPerPage: 20
    });
  };

  const handleRefresh = () => {
    if (selectedMerchants.length > 0) {
      getSaleProductsByMerchants(selectedMerchants, lastSearchTerm || 'sale');
    } else if (lastSearchTerm) {
      searchProducts({
        searchTerm: lastSearchTerm,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        resultsPerPage: 20
      });
    } else {
      getSaleProducts();
    }
  };

  const handleMerchantsChange = (merchantIds: string[]) => {
    setSelectedMerchants(merchantIds);
    // Automatically fetch sale products for new merchants
    if (merchantIds.length > 0) {
      getSaleProductsByMerchants(merchantIds);
    }
  };

  const handleSearchDeals = async () => {
    if (selectedMerchants.length > 0) {
      await getSaleProductsByMerchants(selectedMerchants, searchTerm || 'sale');
      setLastSearchTerm(searchTerm || 'sale');
    } else {
      await getSaleProducts();
      setLastSearchTerm('sale');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* API Configuration Alert */}
      {!isConfigured && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>AvantLink API Not Configured:</strong> Please set your VITE_AVANTLINK_AFFILIATE_ID and VITE_AVANTLINK_API_KEY environment variables to start showing products.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="deals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Sale Tracker
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Merchant Setup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <MerchantConfig 
            selectedMerchants={selectedMerchants}
            onMerchantsChange={handleMerchantsChange}
          />
        </TabsContent>

        <TabsContent value="deals" className="space-y-6">
          {/* Sale Tracker Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Sale Tracker</h2>
              <p className="text-gray-600 mt-1">
                {selectedMerchants.length > 0 
                  ? `Monitoring ${selectedMerchants.length} merchant${selectedMerchants.length !== 1 ? 's' : ''} for sale items`
                  : 'Configure merchants to start tracking specific deals'
                }
              </p>
            </div>
            <Button 
              onClick={handleRefresh}
              disabled={loading || !isConfigured}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Deals
            </Button>
          </div>

          {/* Merchant Status */}
          {selectedMerchants.length === 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <Target className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Setup Required:</strong> Go to the Merchant Setup tab to configure which merchants you want to monitor for sale items.
              </AlertDescription>
            </Alert>
          )}

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleSearchDeals}
              disabled={loading || !isConfigured}
              className="bg-red-600 hover:bg-red-700"
            >
              <Target className="w-4 h-4 mr-2" />
              Find Sale Items
            </Button>
            {selectedMerchants.length > 0 && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('clearance');
                    getSaleProductsByMerchants(selectedMerchants, 'clearance');
                  }}
                  disabled={loading || !isConfigured}
                >
                  Clearance Items
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('discount');
                    getSaleProductsByMerchants(selectedMerchants, 'discount');
                  }}
                  disabled={loading || !isConfigured}
                >
                  Discounted Items
                </Button>
              </>
            )}
          </div>

      <SearchFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedMerchant={selectedMerchant}
        onMerchantChange={setSelectedMerchant}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        categories={categories}
        merchants={merchants}
        onSearch={handleSearch}
        loading={loading}
        disabled={!isConfigured}
      />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-600">
          {loading ? (
            <span className="flex items-center">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading products...
            </span>
          ) : (
            `Showing ${filteredProducts.length} of ${products.length} products${lastSearchTerm ? ` for "${lastSearchTerm}"` : ''}`
          )}
        </p>
      </div>

      {/* Loading State */}
      {loading && products.length === 0 && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-500 text-lg">Searching for products...</p>
          <p className="text-gray-400 mt-2">This may take a few seconds.</p>
        </div>
      )}

      {/* No Configuration State */}
      {!isConfigured && !loading && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 text-lg">AvantLink API not configured.</p>
          <p className="text-gray-400 mt-2">Please set up your API credentials to start showing products.</p>
        </div>
      )}

      {/* No Products State */}
      {isConfigured && !loading && products.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found.</p>
          <p className="text-gray-400 mt-2">Try searching for something specific or check your API configuration.</p>
          <Button 
            className="mt-4" 
            onClick={() => getPopularProducts()}
            disabled={loading}
          >
            Load Popular Products
          </Button>
        </div>
      )}

      {/* Products Grid */}
      {products.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
              <p className="text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
              <Button 
                className="mt-4" 
                variant="outline"
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
        </>
      )}

          <ProductModal
            product={selectedProduct}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductGrid;
