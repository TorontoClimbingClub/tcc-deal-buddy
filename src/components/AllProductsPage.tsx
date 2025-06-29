
import React, { useState } from 'react';
import ProductCard, { Product } from './ProductCard';
import ProductModal from './ProductModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Package,
  ShoppingBag, 
  Grid3X3, 
  List
} from 'lucide-react';
import { useAllProducts } from '../hooks/useAllProducts';
import { useGlobalFilters } from '../contexts/FilterContext';
import { useFilteredProducts } from '../hooks/useFilteredProducts';

export const AllProductsPage: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    products,
    loading,
    error,
    totalProducts,
    refreshProducts
  } = useAllProducts();

  const { filters } = useGlobalFilters();
  const { filteredProducts, filterStats, hasActiveFilters } = useFilteredProducts(products);

  const handleViewDetails = React.useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  const handleLoadProducts = React.useCallback(() => {
    refreshProducts();
  }, [refreshProducts]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            📦 All Products
          </h1>
          <p className="text-gray-600 mt-1">Browse our complete product catalog</p>
          {totalProducts === 0 && !loading && (
            <Button 
              onClick={handleLoadProducts}
              className="mt-3 bg-green-600 hover:bg-green-700"
            >
              Load Products
            </Button>
          )}
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-blue-600">{hasActiveFilters ? filterStats.totalDeals : totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {loading ? 'Loading...' : `${filteredProducts.length} Products Found`}
          </h2>
          <p className="text-sm text-gray-500">
            {hasActiveFilters && '(filtered by sidebar)'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            View mode: {filters.viewMode}
          </Badge>
        </div>
      </div>

      {/* Loading State */}
      {loading && products.length === 0 && (
        <Card>
          <CardContent className="py-24">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Loading products...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Grid/List */}
      {products.length > 0 && (
        <div className={filters.viewMode === 'grid' 
          ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4" 
          : "space-y-4"
        }>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={handleViewDetails}
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
              <p className="text-gray-500 mb-4">Try adjusting your search and filter settings in the sidebar</p>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
              <p className="text-gray-500 mb-4">Use the button above to load products from the catalog</p>
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
