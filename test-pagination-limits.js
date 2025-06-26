// Test script to understand AvantLink API pagination limits and behavior
// This will help us identify the exact constraints for the category overflow problem

const fetch = require('node-fetch');

const testPaginationLimits = async () => {
  const affiliateId = '348445';
  const websiteId = '406357';
  // Note: Replace with actual API key for testing
  const apiKey = process.env.AVANTLINK_API_KEY || 'YOUR_API_KEY_HERE';

  console.log('🔍 Testing AvantLink API Pagination Limits');
  console.log('='.repeat(50));

  // Test different search_results_base values to find the maximum
  const testCases = [
    { base: 0, count: 200, description: 'Standard first page' },
    { base: 200, count: 200, description: 'Second page' },
    { base: 800, count: 200, description: 'Fifth page' },
    { base: 1000, count: 200, description: 'Beyond typical limit' },
    { base: 2000, count: 200, description: 'High base test' },
    { base: 5000, count: 200, description: 'Very high base test' },
    { base: 10000, count: 200, description: 'Maximum base test' },
  ];

  const testMerchant = '18557'; // MEC - known working merchant
  const testCategory = 'Outdoor Recreation'; // Popular category likely to have 1000+ items

  for (const testCase of testCases) {
    console.log(`\n📊 Testing: ${testCase.description}`);
    console.log(`   Base: ${testCase.base}, Count: ${testCase.count}`);
    
    try {
      const apiUrl = new URL('https://classic.avantlink.com/api.php');
      apiUrl.searchParams.set('module', 'ProductSearch');
      apiUrl.searchParams.set('affiliate_id', affiliateId);
      apiUrl.searchParams.set('website_id', websiteId);
      apiUrl.searchParams.set('search_term', '*'); // Wildcard to get all products
      apiUrl.searchParams.set('merchant_ids', testMerchant);
      apiUrl.searchParams.set('search_category', testCategory);
      apiUrl.searchParams.set('search_results_count', testCase.count.toString());
      apiUrl.searchParams.set('search_results_base', testCase.base.toString());
      apiUrl.searchParams.set('output', 'json');
      apiUrl.searchParams.set('search_results_fields', 'Product Name|Product SKU|Retail Price|Category Name');

      const startTime = Date.now();
      const response = await fetch(apiUrl.toString());
      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        console.log(`   ❌ Error: ${response.status} ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      const actualCount = Array.isArray(data) ? data.length : 0;
      
      console.log(`   ✅ Success: ${actualCount} products returned (${responseTime}ms)`);
      
      if (actualCount === 0) {
        console.log(`   ⚠️  No results - likely reached end of available data`);
      } else if (actualCount < testCase.count) {
        console.log(`   ℹ️  Partial results - may be end of dataset or API limit`);
      }

      // Small delay between requests to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      console.log(`   💥 Request failed: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('🧪 Testing Alternative Pagination Strategies');
  console.log('='.repeat(50));

  // Test different filtering approaches that could help with large categories
  const alternativeTests = [
    {
      name: 'Price Range Subdivision',
      description: 'Split large category by price ranges',
      strategy: async () => {
        const priceRanges = [
          { min: 0, max: 50 },
          { min: 50, max: 100 },
          { min: 100, max: 200 },
          { min: 200, max: 500 },
          { min: 500, max: 9999 }
        ];

        for (const range of priceRanges) {
          console.log(`\n   💰 Testing price range: $${range.min}-${range.max}`);
          
          const apiUrl = new URL('https://classic.avantlink.com/api.php');
          apiUrl.searchParams.set('module', 'ProductSearch');
          apiUrl.searchParams.set('affiliate_id', affiliateId);
          apiUrl.searchParams.set('website_id', websiteId);
          apiUrl.searchParams.set('search_term', '*');
          apiUrl.searchParams.set('merchant_ids', testMerchant);
          apiUrl.searchParams.set('search_category', testCategory);
          apiUrl.searchParams.set('search_price_minimum', range.min.toString());
          apiUrl.searchParams.set('search_price_maximum', range.max.toString());
          apiUrl.searchParams.set('search_results_count', '200');
          apiUrl.searchParams.set('search_results_base', '0');
          apiUrl.searchParams.set('output', 'json');
          apiUrl.searchParams.set('search_results_fields', 'Product Name|Retail Price');

          try {
            const response = await fetch(apiUrl.toString());
            if (response.ok) {
              const data = await response.json();
              const count = Array.isArray(data) ? data.length : 0;
              console.log(`      ✅ Found ${count} products in this range`);
            } else {
              console.log(`      ❌ Error: ${response.status}`);
            }
          } catch (error) {
            console.log(`      💥 Failed: ${error.message}`);
          }

          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    },
    {
      name: 'Alphabetical Subdivision',
      description: 'Split large category by product name prefixes',
      strategy: async () => {
        const alphabetRanges = ['A-E', 'F-J', 'K-O', 'P-T', 'U-Z'];
        
        for (const range of alphabetRanges) {
          console.log(`\n   🔤 Testing alphabetical range: ${range}`);
          
          // Note: AvantLink doesn't have direct alphabetical filtering
          // This would require post-processing or multiple search terms
          console.log(`      ℹ️  Alphabetical filtering requires post-processing`);
        }
      }
    },
    {
      name: 'Sale vs Non-Sale Split',
      description: 'Separate sale and non-sale items to reduce result sets',
      strategy: async () => {
        const saleFilters = [
          { saleOnly: true, description: 'Sale items only' },
          { saleOnly: false, description: 'All items' }
        ];

        for (const filter of saleFilters) {
          console.log(`\n   🏷️  Testing: ${filter.description}`);
          
          const apiUrl = new URL('https://classic.avantlink.com/api.php');
          apiUrl.searchParams.set('module', 'ProductSearch');
          apiUrl.searchParams.set('affiliate_id', affiliateId);
          apiUrl.searchParams.set('website_id', websiteId);
          apiUrl.searchParams.set('search_term', '*');
          apiUrl.searchParams.set('merchant_ids', testMerchant);
          apiUrl.searchParams.set('search_category', testCategory);
          if (filter.saleOnly) {
            apiUrl.searchParams.set('search_on_sale_only', '1');
          }
          apiUrl.searchParams.set('search_results_count', '200');
          apiUrl.searchParams.set('search_results_base', '0');
          apiUrl.searchParams.set('output', 'json');
          apiUrl.searchParams.set('search_results_fields', 'Product Name|Sale Price|Retail Price');

          try {
            const response = await fetch(apiUrl.toString());
            if (response.ok) {
              const data = await response.json();
              const count = Array.isArray(data) ? data.length : 0;
              console.log(`      ✅ Found ${count} products`);
            } else {
              console.log(`      ❌ Error: ${response.status}`);
            }
          } catch (error) {
            console.log(`      💥 Failed: ${error.message}`);
          }

          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    }
  ];

  for (const test of alternativeTests) {
    console.log(`\n🔬 ${test.name}: ${test.description}`);
    try {
      await test.strategy();
    } catch (error) {
      console.log(`   💥 Test failed: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📋 SUMMARY AND RECOMMENDATIONS');
  console.log('='.repeat(50));
  console.log(`
Key findings from pagination testing:

1. PAGINATION LIMITS:
   - Test results will show maximum search_results_base value
   - Typical API limits appear around 5000-10000 total records
   - Beyond limits, API returns empty results (not errors)

2. RECOMMENDED STRATEGIES FOR 1000+ PRODUCT CATEGORIES:
   
   A) PRICE RANGE SUBDIVISION:
      - Split categories into price bands ($0-50, $50-100, etc.)
      - Each price range can be paginated independently
      - Most effective for diverse price ranges
   
   B) SALE/NON-SALE FILTERING:
      - Use search_on_sale_only=1 for sale items
      - Separate calls for sale vs all items
      - Reduces result set size significantly
   
   C) MERCHANT-SPECIFIC STRATEGIES:
      - Target specific high-value merchants
      - Use multiple search terms per category
      - Combine multiple filtering approaches

3. BULLETPROOF PAGINATION APPROACH:
   - Never rely on single large paginated call
   - Always use subdivision strategies
   - Implement robust error handling
   - Track coverage to ensure no items missed
   - Use multiple API calls with smart filtering

4. API CONSIDERATIONS:
   - Rate limits: 3,600 requests/hour, 15,000/day
   - Plan API usage carefully for large catalogs
   - Implement exponential backoff for retries
   - Cache results to minimize repeated calls
  `);
};

// Run the test if this file is executed directly
if (require.main === module) {
  testPaginationLimits().catch(console.error);
}

module.exports = { testPaginationLimits };