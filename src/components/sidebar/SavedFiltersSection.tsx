import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Star, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Plus, 
  X, 
  Filter, 
  Tag, 
  Hash, 
  Copy 
} from 'lucide-react';
import { motion } from 'motion/react';
import { useSidebar } from '@/components/ui/aceternity-sidebar';
import { SavedFiltersSectionProps } from './types';

export const SavedFiltersSection: React.FC<SavedFiltersSectionProps> = ({
  savedFilters,
  onSaveFilter,
  onApplyFilter,
  onRemoveFilter,
  onShareFilter,
  onImportFilter,
  urlError,
  onClearError
}) => {
  const { open, isMobile } = useSidebar();
  const [expanded, setExpanded] = useState(false);
  const [showAddFilter, setShowAddFilter] = useState(false);
  const [showImportFilter, setShowImportFilter] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [importFilterId, setImportFilterId] = useState('');

  const handleSaveCurrentFilter = () => {
    if (newFilterName.trim()) {
      onSaveFilter(newFilterName.trim());
      setNewFilterName('');
      setShowAddFilter(false);
    }
  };

  const handleImportFilter = async () => {
    if (importFilterId.trim()) {
      const success = await onImportFilter(importFilterId.trim());
      if (success) {
        setImportFilterId('');
        setShowImportFilter(false);
      }
    }
  };

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
                opacity: (open || isMobile) ? 1 : 0,
                display: (open || isMobile) ? "inline" : "none",
              }}
            >
              Saved Filters
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
        
        <motion.div
          animate={{
            opacity: (open || isMobile) ? 1 : 0,
            display: (open || isMobile) ? "flex" : "none",
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
      
      {expanded && (open || isMobile) && (
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
                      onClick={onClearError}
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
              {savedFilters.map((filter) => (
                <Card key={filter.id} className="border-gray-100 hover:border-blue-200 transition-colors group">
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
                          onClick={() => onShareFilter(filter)}
                          title="Copy filter ID"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
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