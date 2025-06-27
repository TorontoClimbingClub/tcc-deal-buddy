import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useSidebar } from '@/components/ui/aceternity-sidebar';
import { ActiveFiltersSectionProps } from './types';

export const ActiveFiltersSection: React.FC<ActiveFiltersSectionProps> = ({ 
  activeFilterCount, 
  filters, 
  onClearFilters 
}) => {
  const { open, isMobile } = useSidebar();
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
              opacity: (open || isMobile) ? 1 : 0,
              display: (open || isMobile) ? "inline" : "none",
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
              opacity: (open || isMobile) ? 1 : 0,
              display: (open || isMobile) ? "block" : "none",
            }}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </motion.div>
        </div>
      </Button>
      
      {expanded && (open || isMobile) && (
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
                  onClick={onClearFilters}
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