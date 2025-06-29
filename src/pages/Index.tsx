import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Bell, Star, Grid, BarChart3, Calendar, Activity, DollarSign, Filter } from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import { AllProductsPage } from '../components/AllProductsPage';
import { CartPage } from '../components/CartPage';
import { CartFooter } from '../components/CartFooter';
import { AppSidebar } from '../components/sidebar';
import { PhoneLoginForm } from '../components/PhoneLoginForm';
import { UserProfile } from '../components/UserProfile';
import ProductModal from '../components/ProductModal';
import { Product } from '../components/ProductCard';
import { usePriceAlerts } from '../hooks/usePriceAlerts';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useNewSales, NewSales } from '../hooks/useNewSales';
import { useTrendingCategories } from '../hooks/useTrendingCategories';
import { FilterProvider, useGlobalFilters } from '../contexts/FilterContext';
import { CartProvider } from '../contexts/CartContext';
import { usePhoneAuth } from '../contexts/PhoneAuthContext';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

const DashboardContent = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarFloating, setSidebarFloating] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSaleContext, setSelectedSaleContext] = useState<NewSales | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const { user, isLoading } = usePhoneAuth();
  
  // Handle hash changes for navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the #
      if (hash) {
        setActiveView(hash);
      }
    };
    
    // Check initial hash
    const initialHash = window.location.hash.slice(1);
    if (initialHash) {
      setActiveView(initialHash);
    }
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const { getAlertStats } = usePriceAlerts();
  const alertStats = getAlertStats();
  const dashboardStats = useDashboardStats();
  
  const { activities, loading: activitiesLoading, error: activitiesError } = useNewSales();
  const { trendingCategories, loading: trendingLoading, error: trendingError } = useTrendingCategories();
  const { filters, getActiveFilterCount, isFilterActive } = useGlobalFilters();

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return <PhoneLoginForm />;
  }

  // Handle New Sales item click
  const handleNewSalesClick = (activity: NewSales) => {
    // Debug: Log the actual NewSales data to see what we're working with
    console.log('🔍 NewSales Activity Data:', activity);
    console.log('🔍 Image URL:', activity.image_url);
    console.log('🔍 Description:', activity.description);
    console.log('🔍 Current Price:', activity.current_price);
    console.log('🔍 Previous Price:', activity.previous_price);
    console.log('🔍 Affiliate URL:', activity.affiliate_url);
    
    // Convert NewSales to Product format for ProductModal with proper null safety and enhanced data
    const product: Product = {
      id: activity.product_sku || `fallback_${Date.now()}`,
      sku: activity.product_sku || '',
      name: activity.item || 'Unknown Product',
      brand: activity.brand_name || '',
      brand_name: activity.brand_name || '',
      category: activity.category || 'General',
      description: activity.description || 'No description available',
      price: activity.current_price || 0,
      sale_price: activity.sale_price || activity.current_price || 0,
      retail_price: activity.retail_price || activity.current_price || 0,
      originalPrice: activity.previous_price,
      discount_percent: activity.discount_percent || 0,
      discount: activity.discount_percent || 0,
      imageUrl: activity.image_url || '/placeholder-product.svg',
      image_url: activity.image_url || '/placeholder-product.svg',
      affiliateUrl: activity.affiliate_url || '#',
      buy_url: activity.affiliate_url || '#',
      merchant: 'MEC', // TODO: Get actual merchant name from merchant_id
      merchant_name: 'MEC',
      merchant_id: activity.merchant_id || 0,
      deal_quality_score: 85, // Default for new sales
      price_trend_status: 'great_price',
      price_position_percent: 25
    };
    
    console.log('🔍 Transformed Product for Modal:', product);
    
    setSelectedProduct(product);
    setSelectedSaleContext(activity);
    setIsProductModalOpen(true);
  };

  const renderDashboardView = () => (
    <div className="space-y-6">
      {/* Welcome Header with User Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to TCC Deal Buddy 🚀
            </h1>
            <p className="text-gray-600 mb-2">
              Hello, {user.display_name}! ({user.phone_number.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')})
            </p>
            {getActiveFilterCount() > 0 && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                  <Filter className="h-3 w-3 mr-1" />
                  {getActiveFilterCount()} Filters Active
                </Badge>
              </div>
            )}
          </div>
          <div className="hidden lg:block">
            <UserProfile />
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        <Card>
          <CardContent className="p-2 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between text-center md:text-left">
              <div className="flex-1">
                <p className="text-xs md:text-sm text-gray-600 mb-1">
                  Active Deals
                </p>
                <p className="text-lg md:text-3xl font-bold text-blue-600">
                  {dashboardStats.loading ? '...' : dashboardStats.activeDeals.toLocaleString()}
                </p>
              </div>
              <Grid className="h-4 w-4 md:h-8 md:w-8 text-blue-500 mx-auto md:mx-0 mt-1 md:mt-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between text-center md:text-left">
              <div className="flex-1">
                <p className="text-xs md:text-sm text-gray-600 mb-1">Avg. Discount</p>
                <p className="text-lg md:text-3xl font-bold text-green-600">
                  {dashboardStats.loading ? '...' : `${dashboardStats.averageDiscount}%`}
                </p>
              </div>
              <DollarSign className="h-4 w-4 md:h-8 md:w-8 text-green-500 mx-auto md:mx-0 mt-1 md:mt-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between text-center md:text-left">
              <div className="flex-1">
                <p className="text-xs md:text-sm text-gray-600 mb-1">Price Alerts</p>
                <p className="text-lg md:text-3xl font-bold text-purple-600">{alertStats.activeAlerts}</p>
              </div>
              <Bell className="h-4 w-4 md:h-8 md:w-8 text-purple-500 mx-auto md:mx-0 mt-1 md:mt-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between text-center md:text-left">
              <div className="flex-1">
                <p className="text-xs md:text-sm text-gray-600 mb-1">
                  Total Products
                </p>
                <p className="text-lg md:text-3xl font-bold text-orange-600">
                  {dashboardStats.loading ? '...' : dashboardStats.totalProducts.toLocaleString()}
                </p>
              </div>
              <Activity className="h-4 w-4 md:h-8 md:w-8 text-orange-500 mx-auto md:mx-0 mt-1 md:mt-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Sales & Trending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              New Sales
            </CardTitle>
            <CardDescription>Latest sales and price drops</CardDescription>
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
                <p className="text-gray-500 mb-2">Failed to load new sales</p>
                <p className="text-xs text-gray-400">{activitiesError}</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No new sales</p>
                <p className="text-xs text-gray-400">New sales and price drops will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                    onClick={() => handleNewSalesClick(activity)}
                  >
                    <div>
                      <p className="font-medium text-sm">{activity.item}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                      {activity.previous_price && (
                        <p className="text-xs text-green-600">
                          Was ${activity.previous_price.toFixed(2)} • Now ${activity.current_price.toFixed(2)}
                        </p>
                      )}
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
              {trendingLoading ? (
                // Loading state
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-28"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </div>
                ))
              ) : trendingError ? (
                // Error state
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">Failed to load trending categories</p>
                  <p className="text-xs text-gray-400">{trendingError}</p>
                </div>
              ) : trendingCategories.length === 0 ? (
                // Empty state
                <div className="text-center py-8">
                  <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No trending data available</p>
                  <p className="text-xs text-gray-400">Trends will appear once there's enough data</p>
                </div>
              ) : (
                // Live data
                trendingCategories.map((cat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{cat.category}</p>
                      <p className="text-xs text-gray-500">{cat.deals} deals</p>
                      {cat.averageDiscount > 0 && (
                        <p className="text-xs text-blue-600">Avg {cat.averageDiscount}% off</p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="secondary" 
                        className={
                          cat.trendDirection === 'up' ? 'bg-green-50 text-green-700' :
                          cat.trendDirection === 'down' ? 'bg-red-50 text-red-700' :
                          'bg-gray-50 text-gray-700'
                        }
                      >
                        {cat.trend}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
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
        return <ProductGrid />;
      case 'all-products':
        return <AllProductsPage />;
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
      case 'cart':
        return <CartPage />;
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
    <SidebarProvider defaultOpen={false}>
      {/* Mobile Header - Only visible on mobile/tablet */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between p-4">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold text-gray-900">TCC Deal Buddy</h1>
            <div className="w-8" /> {/* Spacer for centering */}
          </div>
        </header>
      )}

      <div className="min-h-screen flex w-full">
        <AppSidebar 
          activeView={activeView}
          onViewChange={setActiveView}
        />
        <SidebarInset className="flex-1">
          <main className="flex-1 overflow-auto bg-gray-50">
            <div className={`p-6 min-h-screen ${isMobile ? 'pt-20' : ''}`}>
              {renderMainContent()}
            </div>
          </main>
        </SidebarInset>
      </div>
      
      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        saleContext={selectedSaleContext}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
          setSelectedSaleContext(null);
        }}
      />
    </SidebarProvider>
  );
};

const Index = () => {
  return (
    <FilterProvider>
      <CartProvider>
        <DashboardContent />
        <CartFooter />
      </CartProvider>
    </FilterProvider>
  );
};

export default Index;
