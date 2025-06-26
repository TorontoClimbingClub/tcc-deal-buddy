
import { useMemo } from 'react';
import { useGlobalFilters } from '../contexts/FilterContext';
import { Product } from '../components/ProductCard';
import { categoryValidationService } from '../services/categoryValidation';
import { getCategoryLevels } from '../utils/productTransform';

export interface FilteredProductsResult {
  filteredProducts: Product[];
  totalCount: number;
  hasActiveFilters: boolean;
  filterStats: {
    totalDeals: number;
    avgDiscount: number;
    bestDeal: number;
    onSaleCount: number;
    categoriesCount: number;
    brandsCount: number;
  };
}

export const useFilteredProducts = (products: Product[]): FilteredProductsResult => {
  const { filters, isFilterActive } = useGlobalFilters();

  const result = useMemo(() => {
    // Apply all global filters to the products
    let filtered = products.filter(product => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          product.name.toLowerCase().includes(searchTerm) ||
          product.brand?.toLowerCase().includes(searchTerm) ||
          product.brand_name?.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm);
        
        if (!matchesSearch) return false;
      }

      // Category filter (supports hierarchical categories)
      if (filters.categories.length > 0) {
        const productCategoryLevels = getCategoryLevels(product.category);
        const hasMatchingCategory = filters.categories.some(filterCategory => 
          productCategoryLevels.includes(filterCategory)
        );
        if (!hasMatchingCategory) return false;
      }

      // Brand filter
      if (filters.brands.length > 0) {
        const productBrand = product.brand || product.brand_name || '';
        if (!filters.brands.includes(productBrand)) return false;
      }

      // Price range filter
      const productPrice = product.sale_price || product.price;
      if (productPrice < filters.priceRange.min || productPrice > filters.priceRange.max) {
        return false;
      }

      // On sale filter
      if (filters.onSale) {
        const isOnSale = product.sale_price && product.retail_price && 
          product.sale_price < product.retail_price;
        if (!isOnSale) return false;
      }

      // Minimum discount filter
      if (filters.discountMin > 0) {
        const discount = product.discount_percent || product.discount || 0;
        if (discount < filters.discountMin) return false;
      }

      return true;
    });

    // Apply sorting
    filtered = filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price':
          const priceA = a.sale_price || a.price;
          const priceB = b.sale_price || b.price;
          return priceA - priceB;
        
        case 'discount':
          const discountA = a.discount_percent || a.discount || 0;
          const discountB = b.discount_percent || b.discount || 0;
          return discountB - discountA;
        
        case 'name':
          return a.name.localeCompare(b.name);
        
        case 'date':
          // For date sorting, use a fallback since created_at might not exist on Product type
          const dateA = (a as any).created_at ? new Date((a as any).created_at).getTime() : 0;
          const dateB = (b as any).created_at ? new Date((b as any).created_at).getTime() : 0;
          return dateB - dateA;
        
        default:
          return 0;
      }
    });

    // Calculate statistics for filtered products
    const validProducts = filtered.filter(p => (p.sale_price || p.price) > 0);
    const discountedProducts = validProducts.filter(p => {
      const discount = p.discount_percent || p.discount || 0;
      return discount > 0;
    });
    const onSaleProducts = validProducts.filter(p => {
      return p.sale_price && p.retail_price && p.sale_price < p.retail_price;
    });

    const categories = [...new Set(filtered.map(p => p.category))];
    const brands = [...new Set(filtered
      .map(p => p.brand || p.brand_name)
      .filter(Boolean)
    )];

    const filterStats = {
      totalDeals: validProducts.length,
      avgDiscount: discountedProducts.length > 0 
        ? Math.round(discountedProducts.reduce((sum, p) => 
            sum + (p.discount_percent || p.discount || 0), 0) / discountedProducts.length)
        : 0,
      bestDeal: Math.max(...discountedProducts.map(p => 
        p.discount_percent || p.discount || 0), 0),
      onSaleCount: onSaleProducts.length,
      categoriesCount: categories.length,
      brandsCount: brands.length
    };

    return {
      filteredProducts: filtered,
      totalCount: filtered.length,
      hasActiveFilters: isFilterActive(),
      filterStats
    };
  }, [products, filters, isFilterActive]);

  return result;
};

// Helper hook for extracting unique values from products
export const useProductOptions = (products: Product[]) => {
  return useMemo(() => {
    // Use category validation service to get only categories with products
    const validatedCategories = categoryValidationService.getFilterableCategories(products);
    const categoriesWithCounts = categoryValidationService.getCategoriesWithCounts(products);
    
    const brands = [...new Set(products
      .map(p => p.brand || p.brand_name)
      .filter(Boolean)
    )].sort();

    const prices = products
      .map(p => p.sale_price || p.price)
      .filter(p => p > 0);
    
    const priceRange = {
      min: Math.min(...prices, 0),
      max: Math.max(...prices, 10000)
    };

    const discounts = products
      .map(p => p.discount_percent || p.discount || 0)
      .filter(d => d > 0);
    
    const maxDiscount = Math.max(...discounts, 0);

    return {
      categories: validatedCategories,
      categoriesWithCounts,
      brands,
      priceRange,
      maxDiscount
    };
  }, [products]);
};
