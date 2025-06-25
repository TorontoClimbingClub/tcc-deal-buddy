
import React, { useState, useMemo } from 'react';
import ProductCard, { Product } from './ProductCard';
import SearchFilters from './SearchFilters';
import ProductModal from './ProductModal';

// TODO: Replace with real data from AvantLink API
const sampleProducts: Product[] = [];

const ProductGrid: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMerchant, setSelectedMerchant] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract unique categories and merchants
  const categories = useMemo(() => 
    [...new Set(sampleProducts.map(p => p.category))], []);
  const merchants = useMemo(() => 
    [...new Set(sampleProducts.map(p => p.merchant))], []);

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    return sampleProducts.filter(product => {
      // Search filter
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !product.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // Merchant filter
      if (selectedMerchant !== 'all' && product.merchant !== selectedMerchant) {
        return false;
      }

      // Price range filter
      if (priceRange !== 'all') {
        const [min, max] = priceRange.split('-').map(p => p.replace('+', ''));
        const minPrice = parseFloat(min);
        const maxPrice = max ? parseFloat(max) : Infinity;
        
        if (product.price < minPrice || product.price > maxPrice) {
          return false;
        }
      }

      return true;
    });
  }, [searchTerm, selectedCategory, selectedMerchant, priceRange]);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SearchFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedMerchant={selectedMerchant}
        onMerchantChange={setSelectedMerchant}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        categories={categories}
        merchants={merchants}
      />

      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredProducts.length} of {sampleProducts.length} products
        </p>
      </div>

      {sampleProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products available yet.</p>
          <p className="text-gray-400 mt-2">Connect to AvantLink API to start showing products.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
              <p className="text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </>
      )}

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ProductGrid;
