import { avantLinkService } from '../services/avantlink';

export async function debugAvantLinkApi() {
  console.log('🔍 Debugging AvantLink API responses...');
  
  try {
    // Test if API is configured
    const isConfigured = avantLinkService.isConfigured();
    console.log(`⚙️ API Configured: ${isConfigured}`);
    
    if (!isConfigured) {
      return {
        error: 'AvantLink API not configured. Check environment variables.',
        configured: false
      };
    }
    
    // Test connection
    console.log('🔗 Testing API connection...');
    const connectionTest = await avantLinkService.testConnection();
    console.log(`🔗 Connection test: ${connectionTest ? 'PASSED' : 'FAILED'}`);
    
    // Test a simple search
    console.log('🔍 Testing simple search...');
    const searchResult = await avantLinkService.searchProducts({
      searchTerm: 'test',
      resultsPerPage: 3
    });
    
    console.log(`📊 Search results: ${searchResult.products.length} products`);
    
    if (searchResult.products.length > 0) {
      console.log('📄 Sample API response structure:');
      const sample = searchResult.products[0];
      console.log('Available fields:', Object.keys(sample));
      console.log('Sample product:', sample);
      
      // Check for missing or empty fields
      const emptyFields = Object.entries(sample).filter(([key, value]) => 
        value === null || value === undefined || value === ''
      );
      console.log(`❌ Empty fields in sample: ${emptyFields.length}`, emptyFields.map(([key]) => key));
    }
    
    // Test sale search specifically
    console.log('💰 Testing sale products search...');
    const saleResult = await avantLinkService.searchProducts({
      searchTerm: 'electronics',
      onSaleOnly: true,
      resultsPerPage: 5
    });
    
    console.log(`💰 Sale search results: ${saleResult.products.length} products`);
    
    if (saleResult.products.length > 0) {
      const saleSample = saleResult.products[0];
      console.log('📄 Sale product sample:', saleSample);
      
      // Check critical fields
      const criticalFields = ['Product Name', 'Product Id', 'Product SKU', 'Merchant Name', 'Sale Price', 'Retail Price'];
      criticalFields.forEach(field => {
        const value = saleSample[field];
        console.log(`${field}: "${value}" (${typeof value})`);
      });
    }
    
    return {
      configured: isConfigured,
      connectionTest,
      searchResults: searchResult.products.length,
      saleResults: saleResult.products.length,
      sampleProduct: searchResult.products[0] || null,
      saleSampleProduct: saleResult.products[0] || null
    };
    
  } catch (error) {
    console.error('💥 API debug failed:', error);
    return {
      error: error.message,
      configured: false
    };
  }
}