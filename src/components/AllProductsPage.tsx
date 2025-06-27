import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, Search } from 'lucide-react';
import ProductCard, { Product } from './ProductCard';
import ProductModal from './ProductModal';
import { useAllProducts } from '../hooks/useAllProducts';
import { useGlobalFilters } from '../contexts/FilterContext';
import { useFilteredProducts } from '../hooks/useFilteredProducts';

interface AllProductsPageProps {
  className?: string;
}

export const AllProductsPage: React.FC<AllProductsPageProps> = ({ className }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    products,
    loading,
    error,
    totalProducts,
    currentPage,
    totalPages,
    pageSize,
    loadAllProducts,
    searchProducts,
    setPage,
    autoLoadProducts
  } = useAllProducts();


  const { filters } = useGlobalFilters();
  const { filteredProducts, hasActiveFilters } = useFilteredProducts(products);

  // Auto-load products when component mounts
  useEffect(() => {
    autoLoadProducts();
  }, [autoLoadProducts]);

  const handleViewDetails = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (filters.search.trim()) {
      searchProducts(filters.search, newPage);
    } else {
      loadAllProducts(newPage);
    }
  };


  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            All Products
            {hasActiveFilters && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 ml-2">
                Filtered
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Browse all MEC products including regular and sale items (20 per page)
            {hasActiveFilters && ' • Results filtered by sidebar settings'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Indicator */}
          {hasActiveFilters && totalProducts > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <Search className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Showing {filteredProducts.length} of {products.length} products (filtered by sidebar)
                </span>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {totalProducts > 0 && (
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalProducts)} of {totalProducts} products
                {hasActiveFilters && ` • ${filteredProducts.length} match filters`}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
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
                  disabled={currentPage >= totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">
                Error loading products: {error}
              </div>
              <Button 
                onClick={() => autoLoadProducts()}
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Loading State */}
          {loading && totalProducts === 0 && (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading all products...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Grid */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(hasActiveFilters ? filteredProducts : products).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={handleViewDetails}
              viewMode="grid"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && totalProducts === 0 && !error && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Products Found
          </h3>
          <p className="text-gray-500">
            Products will load automatically when available
          </p>
        </div>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default AllProductsPage;