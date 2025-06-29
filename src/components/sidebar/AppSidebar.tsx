import React from 'react';
import { Home, ShoppingCart, TrendingUp, Bell, Star, BarChart3 } from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarGroup,
  SidebarProvider,
  useSidebar 
} from '@/components/ui/sidebar';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useProducts } from '../../hooks/useProducts';
import { useProductOptions, useFilteredProducts } from '../../hooks/useFilteredProducts';
import { useGlobalFilters } from '../../contexts/FilterContext';
import useUrlFilters from '../../hooks/useUrlFilters';

import { LogoSection } from './LogoSection';
import { NavigationSection } from './NavigationSection';
import { ActiveFiltersSection } from './ActiveFiltersSection';
import { SearchSection } from './SearchSection';
import { FiltersSection } from './FiltersSection';
import { SavedFiltersSection } from './SavedFiltersSection';
import { StatsSection } from './StatsSection';
import { AppSidebarProps, MenuItem } from './types';

export const AppSidebar: React.FC<AppSidebarProps> = React.memo(({ activeView, onViewChange }) => {
  const dashboardStats = useDashboardStats();
  const { products } = useProducts();
  const { categoriesWithCounts, brands, priceRange } = useProductOptions(products);
  const { filteredProducts } = useFilteredProducts(products);
  const {
    filters,
    savedFilters,
    setSearch,
    setCategories,
    setBrands,
    setPriceRange,
    setDiscountMin,
    setSortBy,
    setViewMode,
    applyFilter,
    saveCurrentFilter,
    clearFilters,
    removeFilter,
    getActiveFilterCount,
    updateFilterCount
  } = useGlobalFilters();
  const { copyFilterId, importFilterById, error: urlError, clearError } = useUrlFilters();

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, count: null },
    { id: 'deals', label: 'All Deals', icon: TrendingUp, count: null },
    { id: 'all-products', label: 'All Products', icon: BarChart3, count: null },
    { id: 'alerts', label: 'My Alerts', icon: Bell, count: null },
    { id: 'cart', label: 'Shopping Cart', icon: ShoppingCart, count: null },
    { id: 'trending', label: 'Trending', icon: Star, count: null }
  ];

  const handleApplyFilter = (filter: any) => {
    applyFilter(filter);
    setTimeout(() => {
      updateFilterCount(filter.id, filteredProducts.length);
    }, 100);
  };

  const handleShareFilter = async (filter: any) => {
    applyFilter(filter);
    setTimeout(async () => {
      const success = await copyFilterId();
      if (success) {
        console.log(`Filter ID ${filter.id} copied to clipboard!`);
      }
    }, 100);
  };

  const handleCategoryChange = (categoryValue: string) => {
    if (categoryValue === 'all') {
      setCategories([]);
    } else {
      setCategories([categoryValue]);
    }
  };

  const handleBrandChange = (brandValue: string) => {
    if (brandValue === 'all') {
      setBrands([]);
    } else {
      setBrands([brandValue]);
    }
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange({ min: values[0], max: values[1] });
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Sidebar 
      side="left" 
      variant="sidebar" 
      collapsible="icon"
      className="bg-white border-r border-gray-200"
    >
      <SidebarHeader className="p-4">
        <LogoSection />
        <NavigationSection 
          menuItems={menuItems}
          activeView={activeView}
          onViewChange={onViewChange}
        />
      </SidebarHeader>

      <SidebarContent className="flex flex-col gap-4 px-4 overflow-y-auto">
        <SidebarGroup>
          <ActiveFiltersSection 
            activeFilterCount={activeFilterCount}
            filters={filters}
            onClearFilters={clearFilters}
          />
        </SidebarGroup>
        
        <SidebarGroup>
          <SearchSection 
            filters={filters}
            onSearchChange={setSearch}
          />
        </SidebarGroup>
        
        <SidebarGroup>
          <FiltersSection
            filters={filters}
            categoriesWithCounts={categoriesWithCounts}
            brands={brands}
            priceRange={priceRange}
            onCategoryChange={handleCategoryChange}
            onBrandChange={handleBrandChange}
            onPriceRangeChange={handlePriceRangeChange}
            onDiscountMinChange={setDiscountMin}
            onSortByChange={setSortBy}
            onViewModeChange={setViewMode}
          />
        </SidebarGroup>
        
        <SidebarGroup>
          <SavedFiltersSection
            savedFilters={savedFilters}
            onSaveFilter={saveCurrentFilter}
            onApplyFilter={handleApplyFilter}
            onRemoveFilter={removeFilter}
            onShareFilter={handleShareFilter}
            onImportFilter={importFilterById}
            urlError={urlError}
            onClearError={clearError}
          />
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <StatsSection dashboardStats={dashboardStats} />
      </SidebarFooter>
    </Sidebar>
  );
});