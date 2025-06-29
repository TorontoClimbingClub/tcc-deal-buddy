import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Hash, 
  Filter, 
  X, 
  Copy 
} from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { SavedFiltersSectionProps } from './types';

export const SavedFiltersSection: React.FC<SavedFiltersSectionProps> = ({
  savedFilters,
  onApplyFilter,
  onRemoveFilter,
  onShareFilter,
  onImportFilter,
  urlError,
  onClearError
}) => {
  const { state, isMobile } = useSidebar();
  const [filterIdInput, setFilterIdInput] = useState('');

  const handleLoadFilter = async () => {
    if (filterIdInput.trim()) {
      const success = await onImportFilter(filterIdInput.trim());
      if (success) {
        setFilterIdInput('');
      }
    }
  };

  // Hide entire section when sidebar is collapsed
  if (state === "collapsed" && !isMobile) {
    return null;
  }

  return (
    <div className="space-y-3 px-2">
      {/* Section Title */}
      <div className="flex items-center gap-2">
        <Hash className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filter ID</span>
      </div>

      {/* Filter ID Input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Filter ID"
            value={filterIdInput}
            onChange={(e) => setFilterIdInput(e.target.value)}
            className="h-9 text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleLoadFilter()}
          />
          <Button 
            size="sm" 
            onClick={handleLoadFilter} 
            className="h-9 px-3"
            disabled={!filterIdInput.trim()}
          >
            Load
          </Button>
        </div>
        
        {/* Error Display */}
        {urlError && (
          <div className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            <span>{urlError}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={onClearError}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Loaded Filters */}
      {savedFilters.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-gray-500">Loaded Filters</span>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {savedFilters.map((filter) => (
              <Card key={filter.id} className="border-gray-100 hover:border-blue-200 transition-colors">
                <CardContent className="p-3">
                  <button
                    onClick={() => onApplyFilter(filter)}
                    className="text-left w-full group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Filter className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 break-words">
                        {filter.name}
                      </span>
                    </div>
                    {filter.description && (
                      <p className="text-xs text-gray-500 mb-1">{filter.description}</p>
                    )}
                  </button>
                  
                  {/* Filter ID and Actions */}
                  <div className="flex items-center justify-between gap-2 text-xs text-gray-400 mt-2">
                    <div className="flex items-center gap-1">
                      <Hash className="h-3 w-3 flex-shrink-0" />
                      <span className="font-mono">{filter.id}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600"
                        onClick={() => onShareFilter(filter)}
                        title="Copy filter ID"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-gray-400 hover:text-red-600"
                        onClick={() => onRemoveFilter(filter.id)}
                        title="Remove filter"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};