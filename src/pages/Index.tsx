
import React from 'react';
import Header from '../components/Header';
import ProductGrid from '../components/ProductGrid';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <ProductGrid />
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              © 2024 AffiliateMart. All rights reserved. 
              <span className="block mt-2 text-sm text-gray-500">
                Affiliate links help support this site. Thank you for your support!
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
