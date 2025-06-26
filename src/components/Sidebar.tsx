import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
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
  BarChart3
} from 'lucide-react';

interface SavedFilter {
  id: string;
  name: string;
  category?: string;
  priceRange?: { min: number; max: number };
  brand?: string;
  onSale?: boolean;
  count: number;
}

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onFilterSelect: (filter: SavedFilter) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, onFilterSelect }) => {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([
    { id: '1', name: 'Climbing Gear Sale', category: 'Climbing', onSale: true, count: 127 },
    { id: '2', name: 'Budget Finds', priceRange: { min: 0, max: 50 }, count: 89 },
    { id: '3', name: 'Mountain Equipment Co-op', brand: 'Mountain Equipment Co-op', count: 203 },
    { id: '4', name: 'High-End Gear', priceRange: { min: 200, max: 1000 }, count: 156 },
    { id: '5', name: 'Recent Deals', onSale: true, count: 45 }
  ]);

  const [newFilterName, setNewFilterName] = useState('');
  const [showAddFilter, setShowAddFilter] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, count: null },
    { id: 'deals', label: 'All Deals', icon: ShoppingCart, count: 855 },
    { id: 'intelligence', label: 'Price Intelligence', icon: BarChart3, count: null },
    { id: 'alerts', label: 'My Alerts', icon: Bell, count: 3 },
    { id: 'favorites', label: 'Favorites', icon: Star, count: 12 },
    { id: 'trending', label: 'Trending', icon: TrendingUp, count: 28 }
  ];

  const handleSaveCurrentFilter = () => {
    if (newFilterName.trim()) {
      const newFilter: SavedFilter = {
        id: Date.now().toString(),
        name: newFilterName.trim(),
        count: Math.floor(Math.random() * 100) + 10 // Mock count
      };
      setSavedFilters([...savedFilters, newFilter]);
      setNewFilterName('');
      setShowAddFilter(false);
    }
  };

  const removeFilter = (filterId: string) => {
    setSavedFilters(savedFilters.filter(f => f.id !== filterId));
  };

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

        {/* Saved Filters */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Saved Filters
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowAddFilter(!showAddFilter)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

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
              <Card key={filter.id} className="border-gray-100 hover:border-blue-200 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => onFilterSelect(filter)}
                        className="text-left w-full group"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Filter className="h-3 w-3 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate">
                            {filter.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Tag className="h-3 w-3" />
                          <span>{filter.count} items</span>
                          {filter.onSale && (
                            <Badge variant="outline" className="text-xs h-4">Sale</Badge>
                          )}
                        </div>
                      </button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      onClick={() => removeFilter(filter.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
              <Badge variant="secondary">10,247</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">On Sale</span>
              <Badge variant="secondary" className="bg-green-50 text-green-700">855</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Price Alerts</span>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">3</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg. Discount</span>
              <Badge variant="secondary" className="bg-purple-50 text-purple-700">23%</Badge>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;