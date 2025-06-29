import React, { useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Package } from 'lucide-react';
import { useAllProducts } from '@/hooks/useAllProducts';
import { useGlobalFilters } from '@/contexts/FilterContext';
import ProductCard from './ProductCard';

interface AllProductsPageProps {
  className?: string;
}

export const AllProductsPage: React.FC<AllProductsPageProps> = ({ className }) => {
  const {
    products,
    loading,
    error,
    totalProducts,
    currentPage,
    totalPages,
    pageSize,
    autoLoadProducts,
    loadFilteredProducts,
    setPage
  } = useAllProducts();

  const { filters, isFilterActive } = useGlobalFilters();
  const prevFiltersRef = useRef(filters);
  const hasActiveFilters = isFilterActive();

  // Load products with unified filtering
  const loadCurrentProducts = useCallback(async (page: number = 1) => {
    if (hasActiveFilters) {
      // Use unified filtering when filters are active
      await loadFilteredProducts({
        search: filters.search,
        categories: filters.categories,
        brands: filters.brands,
        priceRange: filters.priceRange,
        discountMin: filters.discountMin,
        onSale: filters.onSale
      }, page);
    } else {
      // Load all products when no filters are active
      await autoLoadProducts();
    }
  }, [hasActiveFilters, filters, loadFilteredProducts, autoLoadProducts]);

  // Auto-load products on component mount
  useEffect(() => {
    loadCurrentProducts();
  }, []); // Only run once on mount

  // Watch for filter changes and reload with reset pagination
  useEffect(() => {
    const filtersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters);
    if (filtersChanged) {
      prevFiltersRef.current = filters;
      setPage(1); // Reset to first page when filters change
      loadCurrentProducts(1); // Load filtered results
    }
  }, [filters, loadCurrentProducts, setPage]);

  // Handle page changes
  const handlePageChange = async (newPage: number) => {
    setPage(newPage);
    await loadCurrentProducts(newPage);
  };

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600">Error loading products: {error}</p>
              <Button onClick={() => loadCurrentProducts()} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                All Products
                {hasActiveFilters && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 ml-2">
                    <Filter className="h-3 w-3 mr-1" />
                    Filtered
                  </Badge>
                )}
              </CardTitle>
            </div>
            
            {/* Pagination Controls */}
            {totalProducts > 0 && (
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
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Products Grid */}
      <div className={`${filters.viewMode === 'grid' 
        ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4' 
        : 'space-y-4'}`}>
        {loading ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">
              {hasActiveFilters ? 'No products match your filters. Try adjusting them in the sidebar!' : 'No products found.'}
            </p>
          </div>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode={filters.viewMode}
            />
          ))
        )}
      </div>

      {/* Bottom Pagination Controls */}
      {totalProducts > pageSize && !loading && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={i}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};