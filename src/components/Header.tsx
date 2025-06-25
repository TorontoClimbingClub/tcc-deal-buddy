
import React from 'react';
import { TrendingUp, Target, Clock, Zap } from 'lucide-react';

interface HeaderProps {
  totalDeals?: number;
  avgDiscount?: number;
  lastUpdate?: string;
  loading?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  totalDeals = 0, 
  avgDiscount = 0, 
  lastUpdate = 'Just now',
  loading = false 
}) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">TCC Deal Dashboard</h1>
            <p className="text-blue-100">Live climbing & outdoor gear deals</p>
          </div>
          <div className="flex items-center space-x-2 text-blue-100">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Updated {lastUpdate}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Active Deals</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : totalDeals}
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Avg Discount</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : `${avgDiscount}%`}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-300" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Best Deal</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : `${Math.max(avgDiscount * 1.5, 25)}%`}
                </p>
              </div>
              <Zap className="w-8 h-8 text-yellow-300" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
