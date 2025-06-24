
import React from 'react';
import { ShoppingBag } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AffiliateMart</h1>
              <p className="text-sm text-gray-600">Discover amazing products & deals</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">1000+</p>
              <p className="text-xs text-gray-600">Products</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">50+</p>
              <p className="text-xs text-gray-600">Merchants</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">24/7</p>
              <p className="text-xs text-gray-600">Updates</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
