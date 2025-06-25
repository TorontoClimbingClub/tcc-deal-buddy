
import React from 'react';
import { Target, TrendingDown } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 p-2 rounded-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TCC Deal Buddy</h1>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <TrendingDown className="w-4 h-4" />
                Merchant Sale Tracker & Affiliate Marketing
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center text-sm text-gray-500">
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
              Sale Focused
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
