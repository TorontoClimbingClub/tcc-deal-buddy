// Test script for product sync functionality
import { syncSaleProducts, getCurrentProducts, getProductsCount } from './src/services/productSync.ts';

async function testProductSync() {
  console.log('🧪 Testing product sync to Supabase...');
  
  try {
    // Check initial count
    const initialCount = await getProductsCount();
    console.log(`📊 Initial products count: ${initialCount}`);
    
    // Sync a small batch of sale products
    console.log('🔄 Syncing sale products...');
    await syncSaleProducts('electronics', []); // Search for electronics on sale
    
    // Check new count
    const newCount = await getProductsCount();
    console.log(`📊 New products count: ${newCount}`);
    console.log(`➕ Added ${newCount - initialCount} products`);
    
    // Get some current products to verify
    const products = await getCurrentProducts(5);
    console.log('📋 Sample products saved:');
    products.forEach(product => {
      console.log(`  - ${product.name} (${product.sku}) - $${product.sale_price}`);
    });
    
    console.log('✅ Product sync test completed successfully!');
  } catch (error) {
    console.error('❌ Product sync test failed:', error);
  }
}

// Run the test
testProductSync();