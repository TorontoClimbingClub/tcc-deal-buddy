import avantLinkService from './src/services/avantlink.ts';

async function testSpecificMerchants() {
  console.log('🔍 Testing specific merchant searches...\n');
  
  // Mountain Equipment Coop (MEC) merchant testing
  const merchantTests = [
    { name: 'MEC Mountain Equipment Coop', searchTerm: 'climbing gear', merchantId: '9272' },
    { name: 'General climbing search', searchTerm: 'climbing equipment sale', merchantId: null },
    { name: 'All merchants - climbing', searchTerm: 'climbing', merchantId: null },
    { name: 'All merchants - outdoor', searchTerm: 'outdoor gear sale', merchantId: null },
  ];
  
  for (const test of merchantTests) {
    console.log(`\n🏪 Testing: ${test.name}`);
    console.log(`   Search term: "${test.searchTerm}"`);
    
    try {
      const result = await avantLinkService.searchProducts({
        searchTerm: test.searchTerm,
        onSaleOnly: true,
        resultsPerPage: 10,
        merchantIds: test.merchantId ? [test.merchantId] : undefined
      });
      
      console.log(`   ✅ Found ${result.products.length} products`);
      
      if (result.products.length > 0) {
        // Group by merchant
        const merchants = new Map();
        result.products.forEach(p => {
          const merchant = p.strMerchantName || p['Merchant Name'] || 'Unknown';
          merchants.set(merchant, (merchants.get(merchant) || 0) + 1);
        });
        
        console.log('   📋 Merchants found:');
        merchants.forEach((count, merchant) => {
          console.log(`      - ${merchant}: ${count} products`);
        });
        
        // Show sample product
        const sample = result.products[0];
        console.log(`   📦 Sample: "${sample.strProductName || sample['Product Name']}" - ${sample.strMerchantName || sample['Merchant Name']}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n\n💡 To get products from specific merchants:');
  console.log('1. Check AvantLink dashboard for your approved merchants');
  console.log('2. Some merchants may require specific approval');
  console.log('3. Try searching without onSaleOnly filter');
  console.log('4. Contact AvantLink support if merchants are missing');
}

testSpecificMerchants();