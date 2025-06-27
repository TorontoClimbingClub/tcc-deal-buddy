import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Sliders, ChevronDown, ChevronUp, Grid3X3, List } from 'lucide-react';
import { motion } from 'motion/react';
import { useSidebar } from '@/components/ui/aceternity-sidebar';
import { FilterSectionProps } from './types';

export const FiltersSection: React.FC<FilterSectionProps> = ({
  filters,
  categoriesWithCounts,
  brands,
  priceRange,
  onCategoryChange,
  onBrandChange,
  onPriceRangeChange,
  onDiscountMinChange,
  onSortByChange,
  onViewModeChange
}) => {
  const { open, isMobile } = useSidebar();
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
              opacity: (open || isMobile) ? 1 : 0,
              display: (open || isMobile) ? "inline" : "none",
            }}
          >
            Filters
          </motion.span>
        </div>
        <motion.div
          animate={{
            opacity: (open || isMobile) ? 1 : 0,
            display: (open || isMobile) ? "block" : "none",
          }}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </motion.div>
      </Button>
      
      {expanded && (open || isMobile) && (
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
                onValueChange={onCategoryChange}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoriesWithCounts.map((cat) => (
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
                onValueChange={onBrandChange}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.slice(0, 20).map((brand) => (
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
                onValueChange={onPriceRangeChange}
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
                onValueChange={(values) => onDiscountMinChange(values[0])}
                max={80}
                min={0}
                step={5}
                className="w-full"
              />
            </div>

            {/* Sort By */}
            <div>
              <Label className="text-xs text-gray-600 mb-1 block">Sort By</Label>
              <Select 
                value={filters.sortBy} 
                onValueChange={onSortByChange}
              >
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
                  onClick={() => onViewModeChange('grid')}
                >
                  <Grid3X3 className="h-3 w-3 mr-1" />
                  Grid
                </Button>
                <Button
                  variant={filters.viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 h-8"
                  onClick={() => onViewModeChange('list')}
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