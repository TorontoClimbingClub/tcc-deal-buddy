
import React, { useState, useMemo } from 'react';
import ProductCard, { Product } from './ProductCard';
import SearchFilters from './SearchFilters';
import ProductModal from './ProductModal';

// Sample data - in a real app, this would come from your AvantLink API
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium quality wireless headphones with noise cancellation and 20-hour battery life.',
    price: 79.99,
    originalPrice: 99.99,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    affiliateUrl: 'https://example.com/affiliate-link-1',
    merchant: 'TechStore',
    category: 'Electronics',
    rating: 4.5,
    discount: 20
  },
  {
    id: '2',
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable and sustainable organic cotton t-shirt available in multiple colors.',
    price: 24.99,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
    affiliateUrl: 'https://example.com/affiliate-link-2',
    merchant: 'EcoFashion',
    category: 'Clothing',
    rating: 4.2
  },
  {
    id: '3',
    name: 'Smart Fitness Watch',
    description: 'Track your fitness goals with this advanced smartwatch featuring heart rate monitoring.',
    price: 199.99,
    originalPrice: 249.99,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
    affiliateUrl: 'https://example.com/affiliate-link-3',
    merchant: 'FitTech',
    category: 'Electronics',
    rating: 4.7,
    discount: 20
  },
  {
    id: '4',
    name: 'Premium Coffee Beans',
    description: 'Single-origin coffee beans roasted to perfection for the ultimate coffee experience.',
    price: 18.99,
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
    affiliateUrl: 'https://example.com/affiliate-link-4',
    merchant: 'CoffeeRoasters',
    category: 'Food & Beverage',
    rating: 4.8
  },
  {
    id: '5',
    name: 'Yoga Exercise Mat',
    description: 'Non-slip yoga mat perfect for home workouts and meditation sessions.',
    price: 35.99,
    originalPrice: 45.99,
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
    affiliateUrl: 'https://example.com/affiliate-link-5',
    merchant: 'FitnessGear',
    category: 'Sports & Fitness',
    rating: 4.3,
    discount: 22
  },
  {
    id: '6',
    name: 'Stainless Steel Water Bottle',
    description: 'Keep your drinks cold for 24 hours or hot for 12 hours with this insulated bottle.',
    price: 29.99,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop',
    affiliateUrl: 'https://example.com/affiliate-link-6',
    merchant: 'EcoLiving',
    category: 'Home & Garden',
    rating: 4.6
  }
];

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

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ProductGrid;
