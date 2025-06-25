import { syncSaleProducts, getCurrentProducts, getProductsCount, dailyFullSync, cleanupOldProducts } from '../services/productSync';

export async function testProductSync() {
  console.log('🧪 Testing product sync to Supabase...');
  
  try {
    // Check initial count
    const initialCount = await getProductsCount();
    console.log(`📊 Initial products count: ${initialCount}`);
    
    // Test with a simple sync first (just electronics)
    console.log('🔄 Testing simple sync with electronics...');
    
    // Import avantlink service to do a small test search
    const { avantLinkService } = await import('../services/avantlink');
    const apiResponse = await avantLinkService.searchProducts({
      searchTerm: 'electronics',
      onSaleOnly: true,
      resultsPerPage: 10
    });
    
    console.log(`📥 Retrieved ${apiResponse.products.length} products from API`);
    
    if (apiResponse.products.length === 0) {
      console.log('⚠️ No products returned from API. Check your AvantLink credentials.');
      return { success: false, error: 'No products returned from API' };
    }
    
    // Save to database
    const { saveProductsToDatabase } = await import('../services/productSync');
    const result = await saveProductsToDatabase(apiResponse.products);
    
    console.log(`📊 Save results: ${result.success} successful, ${result.errors.length} errors`);
    
    if (result.errors.length > 0) {
      console.log('❌ Errors:', result.errors);
    }
    
    // Check new count
    const newCount = await getProductsCount();
    console.log(`📊 New products count: ${newCount}`);
    console.log(`➕ Added ${newCount - initialCount} products`);
    
    // Get some current products to verify
    const products = await getCurrentProducts(3);
    console.log('📋 Sample products saved:');
    products.forEach(product => {
      console.log(`  - ${product.name} (${product.sku})`);
      console.log(`    Sale: $${product.sale_price}, Retail: $${product.retail_price}`);
      console.log(`    Merchant: ${product.merchant_name}`);
    });
    
    console.log('✅ Product sync test completed successfully!');
    return { success: true, savedCount: result.success, errors: result.errors };
  } catch (error) {
    console.error('❌ Product sync test failed:', error);
    return { success: false, error: error.message || error };
  }
}

export async function testFullDailySync() {
  console.log('🧪 Testing full daily sync...');
  
  try {
    const result = await dailyFullSync();
    
    console.log(`🎉 Full sync completed!`);
    console.log(`📊 Total saved: ${result.totalSaved}`);
    console.log(`❌ Total errors: ${result.totalErrors}`);
    console.log(`📂 Synced categories: ${result.syncedCategories.join(', ')}`);
    
    return { success: true, result };
  } catch (error) {
    console.error('❌ Full daily sync failed:', error);
    return { success: false, error: error.message || error };
  }
}

export async function testMultiMerchantSync() {
  console.log('🧪 Testing multi-merchant sync...');
  
  try {
    const { dailyMultiMerchantSync } = await import('../services/productSync');
    const result = await dailyMultiMerchantSync();
    
    console.log(`🎉 Multi-merchant sync completed!`);
    console.log(`📊 Total saved: ${result.totalSaved}`);
    console.log(`❌ Total errors: ${result.totalErrors}`);
    console.log(`🏪 Merchant results:`);
    result.merchantResults.forEach(r => {
      console.log(`   ${r.merchant}: ${r.saved || 0} saved${r.error ? ` (Error: ${r.error})` : ''}`);
    });
    
    return { success: true, result };
  } catch (error) {
    console.error('❌ Multi-merchant sync failed:', error);
    return { success: false, error: error.message || error };
  }
}

export async function testCleanup() {
  console.log('🧪 Testing old product cleanup...');
  
  try {
    const removedCount = await cleanupOldProducts();
    console.log(`🗑️ Cleanup completed: ${removedCount} old products removed`);
    
    return { success: true, removedCount };
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    return { success: false, error: error.message || error };
  }
}