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
import { Sidebar as AceternitySidebar, SidebarBody, SidebarLink, useSidebar } from '@/components/ui/aceternity-sidebar';
import { motion } from 'motion/react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useGlobalFilters } from '../contexts/FilterContext';
import { useProducts } from '../hooks/useProducts';
import { useProductOptions, useFilteredProducts } from '../hooks/useFilteredProducts';
import useUrlFilters from '../hooks/useUrlFilters';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

// Logo Component - always visible
const LogoSection = () => {
  const { open } = useSidebar();
  
  return (
    <div className="flex items-center gap-3 px-2 py-3">
      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
        <Search className="h-4 w-4 text-white" />
      </div>
      <motion.div
        animate={{
          opacity: open ? 1 : 0,
          display: open ? "block" : "none",
        }}
        className="whitespace-nowrap"
      >
        <h2 className="text-lg font-semibold text-gray-900">TCC Deal Buddy</h2>
        <p className="text-sm text-gray-500">Price Intelligence</p>
      </motion.div>
    </div>
  );
};

// Collapsible Active Filters
const CollapsibleActiveFilters = ({ activeFilterCount, filters, clearFilters }: any) => {
  const { open } = useSidebar();
  const [expanded, setExpanded] = useState(false);

  if (activeFilterCount === 0) return null;

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        className="w-full justify-between h-8 px-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <motion.span
            animate={{
              opacity: open ? 1 : 0,
              display: open ? "inline" : "none",
            }}
          >
            Active Filters
          </motion.span>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
            {activeFilterCount}
          </Badge>
          <motion.div
            animate={{
              opacity: open ? 1 : 0,
              display: open ? "block" : "none",
            }}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </motion.div>
        </div>
      </Button>
      
      {expanded && open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
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
                  className="h-6 w-6 p-0 text-blue-700 hover:text-blue-900 flex-shrink-0 ml-2"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

// Quick Search Component
const QuickSearchSection = ({ filters, setSearch }: any) => {
  const { open } = useSidebar();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        className="w-full justify-between h-8 px-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <motion.span
            animate={{
              opacity: open ? 1 : 0,
              display: open ? "inline" : "none",
            }}
          >
            Quick Search
          </motion.span>
        </div>
        <motion.div
          animate={{
            opacity: open ? 1 : 0,
            display: open ? "block" : "none",
          }}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </motion.div>
      </Button>
      
      {expanded && open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden px-2"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-9 text-sm"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Advanced Filters Component
const AdvancedFiltersSection = ({ 
  filters, 
  categoriesWithCounts, 
  brands, 
  priceRange,
  handleCategoryChange,
  handleBrandChange,
  handlePriceRangeChange,
  setDiscountMin,
  setSortBy,
  setViewMode
}: any) => {
  const { open } = useSidebar();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        className="w-full justify-between h-8 px-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4" />
          <motion.span
            animate={{
              opacity: open ? 1 : 0,
              display: open ? "inline" : "none",
            }}
          >
            Filters
          </motion.span>
        </div>
        <motion.div
          animate={{
            opacity: open ? 1 : 0,
            display: open ? "block" : "none",
          }}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </motion.div>
      </Button>
      
      {expanded && open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden px-2"
        >
          <div className="space-y-4">
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
                  {categoriesWithCounts.map((cat: any) => (
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
                  {brands.slice(0, 20).map((brand: string) => (
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
        </motion.div>
      )}
    </div>
  );
};

// Saved Filters Component
const SavedFiltersSection = ({ 
  savedFilters,
  showAddFilter,
  setShowAddFilter,
  showImportFilter,
  setShowImportFilter,
  newFilterName,
  setNewFilterName,
  importFilterId,
  setImportFilterId,
  urlError,
  clearError,
  handleSaveCurrentFilter,
  handleImportFilter,
  handleApplyFilter,
  handleShareFilter,
  removeFilter
}: any) => {
  const { open } = useSidebar();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2">
        <Button
          variant="ghost"
          className="flex-1 justify-between h-8 px-0 text-sm font-medium text-gray-500 hover:text-gray-700"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <motion.span
              animate={{
                opacity: open ? 1 : 0,
                display: open ? "inline" : "none",
              }}
            >
              Saved Filters
            </motion.span>
          </div>
          <motion.div
            animate={{
              opacity: open ? 1 : 0,
              display: open ? "block" : "none",
            }}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </motion.div>
        </Button>
        
        <motion.div
          animate={{
            opacity: open ? 1 : 0,
            display: open ? "flex" : "none",
          }}
          className="flex gap-1 ml-2"
        >
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
        </motion.div>
      </div>
      
      {expanded && open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden px-2"
        >
          <div className="space-y-3">
            {/* URL Error Display */}
            {urlError && (
              <Card className="border-red-200 bg-red-50">
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
              <Card className="border-dashed border-blue-200">
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
              <Card className="border-dashed">
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
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {savedFilters.map((filter: any) => (
                <Card key={filter.id} className="border-gray-100 hover:border-blue-200 transition-colors group">
                  <CardContent className="p-3">
                    <button
                      onClick={() => handleApplyFilter(filter)}
                      className="text-left w-full group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Filter className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 break-words">
                          {filter.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <Tag className="h-3 w-3 flex-shrink-0" />
                        <span>{filter.count || 0} items</span>
                      </div>
                    </button>
                    
                    {/* Filter ID with inline action buttons */}
                    <div className="flex items-center justify-between gap-2 text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <Hash className="h-3 w-3 flex-shrink-0" />
                        <span className="font-mono text-xs">{filter.id}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                          onClick={() => handleShareFilter(filter)}
                          title="Copy filter ID"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
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
        </motion.div>
      )}
    </div>
  );
};

// Quick Stats Component
const QuickStatsSection = ({ dashboardStats }: any) => {
  const { open } = useSidebar();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        className="w-full justify-between h-8 px-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          <motion.span
            animate={{
              opacity: open ? 1 : 0,
              display: open ? "inline" : "none",
            }}
          >
            Quick Stats
          </motion.span>
        </div>
        <motion.div
          animate={{
            opacity: open ? 1 : 0,
            display: open ? "block" : "none",
          }}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </motion.div>
      </Button>
      
      {expanded && open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden px-2"
        >
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
        </motion.div>
      )}
    </div>
  );
};

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
    <AceternitySidebar animate={true}>
      <SidebarBody className="justify-between gap-4 bg-white border-r border-gray-200">
        {/* Top Section */}
        <div className="flex flex-col gap-4">
          {/* Logo - always visible */}
          <LogoSection />
          
          {/* Main Navigation */}
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <SidebarLink
                  key={item.id}
                  link={{
                    label: item.label,
                    href: `#${item.id}`,
                    icon: (
                      <Icon className={`h-5 w-5 ${
                        isActive ? 'text-blue-600' : 'text-gray-600 group-hover/sidebar:text-blue-600'
                      }`} />
                    )
                  }}
                  className={`${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'} rounded-lg px-2`}
                  onClick={(e) => {
                    e.preventDefault();
                    onViewChange(item.id);
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Scrollable Middle Section */}
        <div className="flex flex-col gap-4 overflow-y-auto flex-1">
          <CollapsibleActiveFilters 
            activeFilterCount={activeFilterCount}
            filters={filters}
            clearFilters={clearFilters}
          />
          
          <QuickSearchSection 
            filters={filters}
            setSearch={setSearch}
          />
          
          <AdvancedFiltersSection
            filters={filters}
            categoriesWithCounts={categoriesWithCounts}
            brands={brands}
            priceRange={priceRange}
            handleCategoryChange={handleCategoryChange}
            handleBrandChange={handleBrandChange}
            handlePriceRangeChange={handlePriceRangeChange}
            setDiscountMin={setDiscountMin}
            setSortBy={setSortBy}
            setViewMode={setViewMode}
          />
          
          <SavedFiltersSection
            savedFilters={savedFilters}
            showAddFilter={showAddFilter}
            setShowAddFilter={setShowAddFilter}
            showImportFilter={showImportFilter}
            setShowImportFilter={setShowImportFilter}
            newFilterName={newFilterName}
            setNewFilterName={setNewFilterName}
            importFilterId={importFilterId}
            setImportFilterId={setImportFilterId}
            urlError={urlError}
            clearError={clearError}
            handleSaveCurrentFilter={handleSaveCurrentFilter}
            handleImportFilter={handleImportFilter}
            handleApplyFilter={handleApplyFilter}
            handleShareFilter={handleShareFilter}
            removeFilter={removeFilter}
          />
        </div>

        {/* Bottom Section - Stats */}
        <div className="mt-auto">
          <QuickStatsSection dashboardStats={dashboardStats} />
        </div>
      </SidebarBody>
    </AceternitySidebar>
  );
};

export default Sidebar;