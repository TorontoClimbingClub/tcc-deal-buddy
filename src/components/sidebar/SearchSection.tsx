import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useSidebar } from '@/components/ui/aceternity-sidebar';
import { SearchSectionProps } from './types';

export const SearchSection: React.FC<SearchSectionProps> = ({ 
  filters, 
  onSearchChange 
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
          <Search className="h-4 w-4" />
          <motion.span
            animate={{
              opacity: (open || isMobile) ? 1 : 0,
              display: (open || isMobile) ? "inline" : "none",
            }}
          >
            Quick Search
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9 text-sm"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};