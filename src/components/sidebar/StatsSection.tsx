import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { StatsSectionProps } from './types';

export const StatsSection: React.FC<StatsSectionProps> = ({ dashboardStats }) => {
  const { state, isMobile } = useSidebar();
  const [expanded, setExpanded] = useState(false);

  // Hide entire section when sidebar is collapsed
  if (state === "collapsed" && !isMobile) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        className="w-full justify-between h-8 px-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          <span>Quick Stats</span>
        </div>
        <div>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </Button>
      
      {expanded && (state === "expanded" || isMobile) && (
        <div className="overflow-hidden px-2"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Products</span>
              <Badge variant="secondary">
                {dashboardStats.loading ? '...' : dashboardStats.totalProducts.toLocaleString()}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">On Sale</span>
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                {dashboardStats.loading ? '...' : dashboardStats.activeDeals.toLocaleString()}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Price Alerts</span>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">0</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg. Discount</span>
              <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                {dashboardStats.loading ? '...' : `${dashboardStats.averageDiscount}%`}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};