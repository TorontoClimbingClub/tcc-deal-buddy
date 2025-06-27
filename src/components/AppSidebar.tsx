
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar
} from '@/components/ui/sidebar';
import { 
  Home, 
  ShoppingCart, 
  TrendingUp, 
  Bell, 
  Star, 
  Filter, 
  Plus, 
  X,
  Search,
  Tag,
  Calendar,
  BarChart3,
  Sliders,
  DollarSign,
  Grid3X3,
  List,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Hash
} from 'lucide-react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useGlobalFilters } from '../contexts/FilterContext';
import { useProducts } from '../hooks/useProducts';
import { useProductOptions, useFilteredProducts } from '../hooks/useFilteredProducts';
import useUrlFilters from '../hooks/useUrlFilters';

interface AppSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function AppSidebar({ activeView, onViewChange }: AppSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  
  const dashboardStats = useDashboardStats();
  const { products } = useProducts();
  const { categories, categoriesWithCounts, brands, priceRange } = useProductOptions(products);
  const { filteredProducts } = useFilteredProducts(products);
  const {
    filters,
    savedFilters,
    setSearch,
    setCategories,
    setBrands,
    setPriceRange,
    setOnSale,
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

  const [newFilterName, setNewFilterName] = useState('');
  const [showAddFilter, setShowAddFilter] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showImportFilter, setShowImportFilter] = useState(false);
  const [importFilterId, setImportFilterId] = useState('');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'deals', label: 'All Deals', icon: ShoppingCart },
    { id: 'intelligence', label: 'Price Intelligence', icon: BarChart3 },
    { id: 'alerts', label: 'My Alerts', icon: Bell },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'trending', label: 'Trending', icon: TrendingUp }
  ];

  const handleSaveCurrentFilter = () => {
    if (newFilterName.trim()) {
      saveCurrentFilter(newFilterName.trim());
      setNewFilterName('');
      setShowAddFilter(false);
    }
  };

  const handleImportFilter = async () => {
    if (importFilterId.trim()) {
      const success = await importFilterById(importFilterId.trim());
      if (success) {
        setImportFilterId('');
        setShowImportFilter(false);
      }
    }
  };

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
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Search className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">TCC Deal Buddy</h2>
              <p className="text-sm text-gray-500">Price Intelligence</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto">
            <Search className="h-5 w-5 text-white" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onViewChange(item.id)}
                      isActive={isActive}
                      tooltip={isCollapsed ? item.label : undefined}
                    >
                      <Icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {!isCollapsed && (
          <>
            {/* Active Filters Summary */}
            {activeFilterCount > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel>
                  <div className="flex items-center justify-between w-full">
                    <span>Active Filters</span>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                      {activeFilterCount}
                    </Badge>
                  </div>
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          {filters.search && (
                            <div className="text-xs text-blue-700">Search: "{filters.search}"</div>
                          )}
                          {filters.categories.length > 0 && (
                            <div className="text-xs text-blue-700">Categories: {filters.categories.join(', ')}</div>
                          )}
                          {filters.brands.length > 0 && (
                            <div className="text-xs text-blue-700">Brands: {filters.brands.join(', ')}</div>
                          )}
                          {(filters.priceRange.min > 0 || filters.priceRange.max < 10000) && (
                            <div className="text-xs text-blue-700">
                              Price: ${filters.priceRange.min} - ${filters.priceRange.max}
                            </div>
                          )}
                          {filters.onSale && (
                            <div className="text-xs text-blue-700">On Sale Only</div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="h-6 w-6 p-0 text-blue-700 hover:text-blue-900"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* Quick Search */}
            <SidebarGroup>
              <SidebarGroupLabel>Quick Search</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-9 text-sm"
                  />
                </div>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Advanced Filters */}
            <SidebarGroup>
              <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="hover:bg-gray-50 rounded cursor-pointer">
                    <div className="flex items-center justify-between w-full">
                      <span>Advanced Filters</span>
                      {showAdvancedFilters ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent className="space-y-4">
                    {/* Category Dropdown */}
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">Category</Label>
                      <Select
                        value={filters.categories[0] || 'all'}
                        onValueChange={handleCategoryChange}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categoriesWithCounts.map(cat => (
                            <SelectItem key={cat.name} value={cat.name}>
                              <div className="flex items-center justify-between w-full">
                                <span className={`${cat.hierarchyLevel > 0 ? 'pl-' + (cat.hierarchyLevel * 2) : ''}`}>
                                  {cat.hierarchyLevel > 0 && '└ '}
                                  {cat.name.split(' > ').pop()}
                                </span>
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  {cat.count}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Brand Dropdown */}
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">Brand</Label>
                      <Select
                        value={filters.brands[0] || 'all'}
                        onValueChange={handleBrandChange}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="All Brands" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Brands</SelectItem>
                          {brands.slice(0, 20).map(brand => (
                            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price Range Slider */}
                    <div>
                      <Label className="text-xs text-gray-600 mb-2 block">
                        Price Range: ${filters.priceRange.min} - ${filters.priceRange.max}
                      </Label>
                      <Slider
                        value={[filters.priceRange.min, filters.priceRange.max]}
                        onValueChange={handlePriceRangeChange}
                        max={Math.min(priceRange.max, 1000)}
                        min={priceRange.min}
                        step={10}
                        className="w-full"
                      />
                    </div>

                    {/* Minimum Discount */}
                    <div>
                      <Label className="text-xs text-gray-600 mb-2 block">
                        Minimum Discount: {filters.discountMin}%
                      </Label>
                      <Slider
                        value={[filters.discountMin]}
                        onValueChange={(values) => setDiscountMin(values[0])}
                        max={80}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    {/* Sort By */}
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">Sort By</Label>
                      <Select value={filters.sortBy} onValueChange={(value: any) => setSortBy(value)}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="discount">Best Discount</SelectItem>
                          <SelectItem value="price">Lowest Price</SelectItem>
                          <SelectItem value="name">Name A-Z</SelectItem>
                          <SelectItem value="date">Newest First</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* View Mode */}
                    <div>
                      <Label className="text-xs text-gray-600 mb-2 block">View Mode</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={filters.viewMode === 'grid' ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1 h-8"
                          onClick={() => setViewMode('grid')}
                        >
                          <Grid3X3 className="h-3 w-3 mr-1" />
                          Grid
                        </Button>
                        <Button
                          variant={filters.viewMode === 'list' ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1 h-8"
                          onClick={() => setViewMode('list')}
                        >
                          <List className="h-3 w-3 mr-1" />
                          List
                        </Button>
                      </div>
                    </div>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>

            <SidebarSeparator />

            {/* Saved Filters */}
            <SidebarGroup>
              <SidebarGroupLabel>
                <div className="flex items-center justify-between w-full">
                  <span>Saved Filters</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setShowImportFilter(!showImportFilter)}
                      title="Import filter by ID"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setShowAddFilter(!showAddFilter)}
                      title="Save current filter"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                {/* URL Error Display */}
                {urlError && (
                  <Card className="mb-3 border-red-200 bg-red-50">
                    <CardContent className="p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-red-700">{urlError}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={clearError}
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Import Filter */}
                {showImportFilter && (
                  <Card className="mb-3 border-dashed border-blue-200">
                    <CardContent className="p-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter filter ID..."
                          value={importFilterId}
                          onChange={(e) => setImportFilterId(e.target.value)}
                          className="h-8 text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && handleImportFilter()}
                        />
                        <Button size="sm" onClick={handleImportFilter} className="h-8 px-2">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Add New Filter */}
                {showAddFilter && (
                  <Card className="mb-3 border-dashed">
                    <CardContent className="p-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Filter name..."
                          value={newFilterName}
                          onChange={(e) => setNewFilterName(e.target.value)}
                          className="h-8 text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveCurrentFilter()}
                        />
                        <Button size="sm" onClick={handleSaveCurrentFilter} className="h-8 px-2">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Filter List */}
                <div className="space-y-2">
                  {savedFilters.map((filter) => (
                    <Card key={filter.id} className="border-gray-100 hover:border-blue-200 transition-colors">
                      <CardContent className="p-3">
                        <button
                          onClick={() => handleApplyFilter(filter)}
                          className="text-left w-full"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Filter className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900 break-words">
                              {filter.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                            <Tag className="h-3 w-3 flex-shrink-0" />
                            <span>{filter.count || 0} items</span>
                          </div>
                        </button>
                        
                        <div className="flex items-center justify-between gap-2 text-xs text-gray-400">
                          <div className="flex items-center gap-2">
                            <Hash className="h-3 w-3 flex-shrink-0" />
                            <span className="font-mono text-xs">{filter.id}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600"
                              onClick={() => handleShareFilter(filter)}
                              title="Copy filter ID"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 text-gray-400 hover:text-red-600"
                              onClick={() => removeFilter(filter.id)}
                              title="Remove filter"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {savedFilters.length === 0 && (
                    <Card className="border-dashed border-gray-200">
                      <CardContent className="p-4 text-center">
                        <Filter className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm text-gray-500 mb-2">No saved filters yet</p>
                        <p className="text-xs text-gray-400">
                          Apply some filters and save them for quick access
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            {/* Quick Stats */}
            <SidebarGroup>
              <SidebarGroupLabel>Quick Stats</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Products</span>
                    <Badge variant="secondary">{dashboardStats.loading ? '...' : dashboardStats.totalProducts.toLocaleString()}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">On Sale</span>
                    <Badge variant="secondary" className="bg-green-50 text-green-700">{dashboardStats.loading ? '...' : dashboardStats.activeDeals.toLocaleString()}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Price Alerts</span>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">0</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg. Discount</span>
                    <Badge variant="secondary" className="bg-purple-50 text-purple-700">{dashboardStats.loading ? '...' : `${dashboardStats.averageDiscount}%`}</Badge>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
