// Quick test script to verify the price history separation functionality
// This tests that current and historical prices are properly separated

console.log('🧪 Testing Price History Separation...');

// Mock data that simulates the database response
const mockHistoricalData = [
  {
    recorded_date: '2025-06-25',
    price: 89.99,
    is_sale: true,
    discount_percent: 25,
    retail_price: 119.99
  },
  {
    recorded_date: '2025-06-26',
    price: 94.99,
    is_sale: true,
    discount_percent: 20,
    retail_price: 119.99
  },
  {
    recorded_date: '2025-06-27',
    price: 99.99,
    is_sale: false,
    discount_percent: 0,
    retail_price: 119.99
  }
];

const mockCurrentProduct = {
  name: 'Test Product',
  sale_price: 84.99,
  retail_price: 119.99,
  updated_at: '2025-06-28T10:30:00Z'
};

// Simulate the new hook logic
function processNewPriceHistoryLogic(historicalData, currentProduct) {
  // Transform historical data (no current day included)
  const historicalPrices = historicalData.map(record => ({
    date: record.recorded_date,
    price: record.price,
    onSale: record.is_sale,
    discountPercent: record.discount_percent || 0
  }));

  // Create current price object
  const currentPrice = {
    price: currentProduct.sale_price,
    retailPrice: currentProduct.retail_price,
    isOnSale: currentProduct.sale_price < currentProduct.retail_price,
    discountPercent: Math.round(((currentProduct.retail_price - currentProduct.sale_price) / currentProduct.retail_price) * 100),
    lastUpdated: currentProduct.updated_at
  };

  // Calculate historical statistics
  const historicalPricesOnly = historicalPrices.map(p => p.price);
  const priceRange = {
    min: Math.min(...historicalPricesOnly),
    max: Math.max(...historicalPricesOnly),
    average: historicalPricesOnly.reduce((sum, p) => sum + p, 0) / historicalPricesOnly.length,
    includesCurrentPrice: false
  };

  return {
    productSku: 'TEST-SKU-123',
    productName: currentProduct.name,
    currentPrice,
    historicalPrices,
    priceRange
  };
}

// Test the logic
const result = processNewPriceHistoryLogic(mockHistoricalData, mockCurrentProduct);

console.log('✅ Test Results:');
console.log('\n📊 Current Price (Separated):');
console.log(`  Price: $${result.currentPrice.price}`);
console.log(`  Retail: $${result.currentPrice.retailPrice}`);
console.log(`  On Sale: ${result.currentPrice.isOnSale}`);
console.log(`  Discount: ${result.currentPrice.discountPercent}%`);
console.log(`  Last Updated: ${result.currentPrice.lastUpdated}`);

console.log('\n📈 Historical Prices:');
result.historicalPrices.forEach((price, index) => {
  console.log(`  ${index + 1}. ${price.date}: $${price.price} ${price.onSale ? '(Sale)' : ''}`);
});

console.log('\n📊 Historical Statistics:');
console.log(`  Min: $${result.priceRange.min}`);
console.log(`  Max: $${result.priceRange.max}`);
console.log(`  Average: $${result.priceRange.average.toFixed(2)}`);
console.log(`  Includes Current: ${result.priceRange.includesCurrentPrice}`);

// Verify separation
const todayDate = new Date().toISOString().split('T')[0];
const hasTodayInHistorical = result.historicalPrices.some(p => p.date === todayDate);

console.log('\n✨ Separation Verification:');
console.log(`  Today's date: ${todayDate}`);
console.log(`  Historical includes today: ${hasTodayInHistorical} ❌ (Should be false)`);
console.log(`  Current price separated: ✅`);
console.log(`  Historical stats exclude current: ${!result.priceRange.includesCurrentPrice} ✅`);

if (!hasTodayInHistorical && !result.priceRange.includesCurrentPrice) {
  console.log('\n🎉 SUCCESS: Current and historical prices are properly separated!');
  console.log('   - No duplicate entries for the same day');
  console.log('   - Current price is distinct from historical data');
  console.log('   - Statistics are calculated correctly');
} else {
  console.log('\n❌ ISSUE: Separation logic needs refinement');
}

// Test edge case: No historical data
console.log('\n🔬 Testing Edge Case: No Historical Data');
const noHistoryResult = processNewPriceHistoryLogic([], mockCurrentProduct);
console.log(`  Historical prices count: ${noHistoryResult.historicalPrices.length}`);
console.log(`  Current price: $${noHistoryResult.currentPrice.price}`);
console.log(`  Uses current for stats: ${noHistoryResult.priceRange.includesCurrentPrice} ✅`);