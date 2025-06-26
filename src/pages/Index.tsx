import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, Bell, Star, Grid, BarChart3, Calendar, Activity, DollarSign } from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import { PriceIntelligenceDashboard } from '../components/PriceIntelligenceDashboard';
import Sidebar from '../components/Sidebar';
import { usePriceAlerts } from '../hooks/usePriceAlerts';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useRecentActivity } from '../hooks/useRecentActivity';

interface SavedFilter {
  id: string;
  name: string;
  category?: string;
  priceRange?: { min: number; max: number };
  brand?: string;
  onSale?: boolean;
  count: number;
}

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedFilter, setSelectedFilter] = useState<SavedFilter | null>(null);
  const { getAlertStats } = usePriceAlerts();
  const alertStats = getAlertStats();
  const dashboardStats = useDashboardStats();
  const { activities, loading: activitiesLoading, error: activitiesError } = useRecentActivity();

  const handleFilterSelect = (filter: SavedFilter) => {
    setSelectedFilter(filter);
    setActiveView('deals'); // Switch to deals view when filter is selected
  };

  const renderDashboardView = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to TCC Deal Buddy 🚀
        </h1>
        <p className="text-gray-600 mb-4">
          Your intelligent price tracking and deal discovery dashboard for outdoor gear
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
            Full Catalog Intelligence
          </Badge>
          <Badge variant="secondary" className="bg-green-50 text-green-700">
            Real-time Alerts
          </Badge>
          <Badge variant="secondary" className="bg-purple-50 text-purple-700">
            Smart Recommendations
          </Badge>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Deals</p>
                <p className="text-3xl font-bold text-blue-600">{dashboardStats.loading ? '...' : dashboardStats.activeDeals.toLocaleString()}</p>
              </div>
              <Grid className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Discount</p>
                <p className="text-3xl font-bold text-green-600">{dashboardStats.loading ? '...' : `${dashboardStats.averageDiscount}%`}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Price Alerts</p>
                <p className="text-3xl font-bold text-purple-600">{alertStats.activeAlerts}</p>
              </div>
              <Bell className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-orange-600">{dashboardStats.loading ? '...' : dashboardStats.totalProducts.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Trending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest deals and price changes</CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : activitiesError ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">Failed to load recent activity</p>
                <p className="text-xs text-gray-400">{activitiesError}</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No recent activity</p>
                <p className="text-xs text-gray-400">New deals and price changes will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{activity.item}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                    <Badge 
                      variant={activity.type === 'price_drop' ? 'default' : 'secondary'}
                      className={
                        activity.type === 'price_drop' ? 'bg-green-50 text-green-700' :
                        activity.type === 'new_deal' ? 'bg-blue-50 text-blue-700' :
                        activity.type === 'sale_start' ? 'bg-orange-50 text-orange-700' :
                        'bg-purple-50 text-purple-700'
                      }
                    >
                      {activity.change}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trending Categories
            </CardTitle>
            <CardDescription>Popular deals this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: "Climbing Gear", deals: 127, trend: "+18%" },
                { category: "Winter Clothing", deals: 89, trend: "+12%" },
                { category: "Hiking Boots", deals: 156, trend: "+8%" },
                { category: "Camping Equipment", deals: 203, trend: "+15%" }
              ].map((cat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{cat.category}</p>
                    <p className="text-xs text-gray-500">{cat.deals} deals</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-green-50 text-green-700">
                      {cat.trend}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMainContent = () => {
    switch (activeView) {
      case 'dashboard':
        return renderDashboardView();
      case 'deals':
        return (
          <div className="space-y-4">
            {selectedFilter && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-blue-900">Filter Applied: {selectedFilter.name}</h3>
                      <p className="text-sm text-blue-700">Showing {selectedFilter.count} products</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedFilter(null)}
                    >
                      Clear Filter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            <ProductGrid />
          </div>
        );
      case 'intelligence':
        return <PriceIntelligenceDashboard />;
      case 'alerts':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Price Alerts</CardTitle>
              <CardDescription>Manage your price tracking alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts configured</h3>
                <p className="text-gray-500 mb-4">
                  Set up price alerts to get notified when your favorite items go on sale.
                </p>
                <Button>Create Your First Alert</Button>
              </div>
            </CardContent>
          </Card>
        );
      case 'favorites':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Favorite Products</CardTitle>
              <CardDescription>Your saved items and wishlist</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                <p className="text-gray-500 mb-4">
                  Browse deals and save your favorite products for quick access.
                </p>
                <Button onClick={() => setActiveView('deals')}>Browse Deals</Button>
              </div>
            </CardContent>
          </Card>
        );
      case 'trending':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Trending Deals</CardTitle>
              <CardDescription>Most popular deals this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-500 mb-4">
                  Trending analysis based on user activity and deal popularity.
                </p>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return renderDashboardView();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        activeView={activeView}
        onViewChange={setActiveView}
        onFilterSelect={handleFilterSelect}
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6">
            {renderMainContent()}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Index;