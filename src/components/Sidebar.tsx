import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Upload,
  Hash
} from 'lucide-react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useGlobalFilters } from '../contexts/FilterContext';
import { useProducts } from '../hooks/useProducts';
import { useProductOptions, useFilteredProducts } from '../hooks/useFilteredProducts';
import useUrlFilters from '../hooks/useUrlFilters';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
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
    { id: 'dashboard', label: 'Dashboard', icon: Home, count: null },
    { id: 'deals', label: 'All Deals', icon: ShoppingCart, count: null },
    { id: 'intelligence', label: 'Price Intelligence', icon: BarChart3, count: null },
    { id: 'alerts', label: 'My Alerts', icon: Bell, count: null },
    { id: 'favorites', label: 'Favorites', icon: Star, count: null },
    { id: 'trending', label: 'Trending', icon: TrendingUp, count: null }
  ];

  const handleSaveCurrentFilter = () => {
    if (newFilterName.trim()) {
      saveCurrentFilter(newFilterName.trim(), filteredProducts.length);
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
    // Update the count for this filter based on current results
    setTimeout(() => {
      updateFilterCount(filter.id, filteredProducts.length);
    }, 100);
  };

  const handleShareFilter = async (filter: any) => {
    // Apply the filter first to ensure it's registered
    applyFilter(filter);
    setTimeout(async () => {
      const success = await copyFilterId();
      if (success) {
        // Could show a toast notification here
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
    <div className="w-80 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Search className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">TCC Deal Buddy</h2>
            <p className="text-sm text-gray-500">Price Intelligence</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Navigation Menu */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Navigation
          </h3>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start h-9 px-3 ${
                    isActive 
                      ? "bg-blue-50 text-blue-700 hover:bg-blue-100" 
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => onViewChange(item.id)}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.count && (
                    <Badge variant="secondary" className="text-xs">
                      {item.count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        <Separator className="mx-4" />

        {/* Active Filters Summary */}
        {activeFilterCount > 0 && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Active Filters
              </h3>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                {activeFilterCount}
              </Badge>
            </div>
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
          </div>
        )}

        {/* Quick Search */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Quick Search
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-9 text-sm"
            />
          </div>
        </div>


        {/* Advanced Filters */}
        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-between h-8 px-0 text-sm font-medium text-gray-500 hover:text-gray-700"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <span className="uppercase tracking-wide">Advanced Filters</span>
            {showAdvancedFilters ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          
          {showAdvancedFilters && (
            <div className="mt-3 space-y-4">
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
            </div>
          )}
        </div>

        <Separator className="mx-4" />

        {/* Saved Filters */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Saved Filters
            </h3>
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
                    placeholder="Enter filter ID (e.g. 5a7x9m2b)..."
                    value={importFilterId}
                    onChange={(e) => setImportFilterId(e.target.value)}
                    className="h-8 text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleImportFilter()}
                  />
                  <Button size="sm" onClick={handleImportFilter} className="h-8 px-2">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Import shared filter by ID
                </p>
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
                <p className="text-xs text-gray-500 mt-1">
                  Save current search & filters
                </p>
              </CardContent>
            </Card>
          )}

          {/* Filter List */}
          <div className="space-y-2">
            {savedFilters.map((filter) => (
              <Card key={filter.id} className="border-gray-100 hover:border-blue-200 transition-colors group">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => handleApplyFilter(filter)}
                        className="text-left w-full group"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Filter className="h-3 w-3 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate">
                            {filter.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                          <Tag className="h-3 w-3" />
                          <span>{filter.count || 0} items</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Hash className="h-3 w-3" />
                          <span className="font-mono">{filter.id}</span>
                          {filter.description && (
                            <span className="truncate">• {filter.description}</span>
                          )}
                        </div>
                      </button>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        onClick={() => handleShareFilter(filter)}
                        title="Copy filter ID"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
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
            
            {/* Empty State */}
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
        </div>

        <Separator className="mx-4" />

        {/* Quick Stats */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Quick Stats
          </h3>
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
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;