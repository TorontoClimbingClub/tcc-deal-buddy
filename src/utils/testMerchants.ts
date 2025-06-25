import { avantLinkService } from '../services/avantlink';

export async function testMerchantAvailability() {
  console.log('🔍 Testing merchant availability...');
  
  const testSearches = [
    { term: 'climbing equipment', onSale: false },
    { term: 'MEC outdoor gear', onSale: false },
    { term: 'outdoor gear', onSale: false },
    { term: 'camping', onSale: false },
    { term: 'climbing', onSale: true },
    { term: 'sale', onSale: true },
  ];
  
  const allMerchants = new Set<string>();
  const results: any[] = [];
  
  for (const search of testSearches) {
    try {
      console.log(`\n🔍 Searching: "${search.term}" (onSale: ${search.onSale})`);
      
      const response = await avantLinkService.searchProducts({
        searchTerm: search.term,
        onSaleOnly: search.onSale,
        resultsPerPage: 20,
        page: 1
      });
      
      console.log(`📦 Found ${response.products.length} products`);
      
      // Count merchants in this search
      const searchMerchants = new Map<string, number>();
      response.products.forEach(product => {
        const merchantName = product.strMerchantName || product['Merchant Name'] || 'Unknown';
        allMerchants.add(merchantName);
        searchMerchants.set(merchantName, (searchMerchants.get(merchantName) || 0) + 1);
      });
      
      const merchantList = Array.from(searchMerchants.entries())
        .map(([name, count]) => `${name} (${count})`)
        .join(', ');
      
      results.push({
        search: search.term,
        onSale: search.onSale,
        productCount: response.products.length,
        merchants: merchantList || 'None'
      });
      
      console.log(`🏪 Merchants: ${merchantList || 'None'}`);
      
    } catch (error) {
      console.error(`❌ Error searching "${search.term}":`, error);
      results.push({
        search: search.term,
        onSale: search.onSale,
        error: error.message
      });
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`Total unique merchants found: ${allMerchants.size}`);
  console.log(`Merchants: ${Array.from(allMerchants).join(', ')}`);
  
  return {
    uniqueMerchants: Array.from(allMerchants),
    merchantCount: allMerchants.size,
    searchResults: results
  };
}

export async function searchSpecificMerchant(merchantName: string) {
  console.log(`🔍 Searching for ${merchantName} products...`);
  
  try {
    // Try different search strategies
    const searches = [
      { term: merchantName, onSale: false },
      { term: merchantName, onSale: true },
      { term: `${merchantName} sale`, onSale: true },
      { term: 'climbing', onSale: false }, // Generic search to see all merchants
    ];
    
    for (const search of searches) {
      console.log(`\n🔍 Try: "${search.term}" (onSale: ${search.onSale})`);
      
      const response = await avantLinkService.searchProducts({
        searchTerm: search.term,
        onSaleOnly: search.onSale,
        resultsPerPage: 50
      });
      
      const targetProducts = response.products.filter(p => {
        const merchant = p.strMerchantName || p['Merchant Name'] || '';
        return merchant.toLowerCase().includes(merchantName.toLowerCase());
      });
      
      console.log(`📦 Total products: ${response.products.length}`);
      console.log(`🎯 ${merchantName} products: ${targetProducts.length}`);
      
      if (targetProducts.length > 0) {
        console.log('✅ Found products from', merchantName);
        return { found: true, products: targetProducts };
      }
    }
    
    return { found: false, message: `No products found from ${merchantName}` };
    
  } catch (error) {
    console.error('❌ Search error:', error);
    return { found: false, error: error.message };
  }
}