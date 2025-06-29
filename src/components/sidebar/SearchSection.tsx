import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { SearchSectionProps } from './types';

export const SearchSection: React.FC<SearchSectionProps> = ({ 
  filters, 
  onSearchChange 
}) => {
  const { state, isMobile } = useSidebar();

  // Hide entire section when sidebar is collapsed
  if (state === "collapsed" && !isMobile) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="px-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-9 text-sm"
          />
        </div>
      </div>
    </div>
  );
};