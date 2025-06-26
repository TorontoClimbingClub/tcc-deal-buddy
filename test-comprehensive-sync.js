// Test script for the comprehensive-sync function
// Run with: node test-comprehensive-sync.js

const SUPABASE_URL = 'https://owtcaztrzujjuwwuldhl.supabase.co'
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key-here'

async function testComprehensiveSync() {
  console.log('🧪 Testing Comprehensive Sync Function')
  console.log('=====================================')
  
  try {
    const startTime = Date.now()
    
    // Test with a small subset first
    const testPayload = {
      merchantIds: [18557], // MEC
      testMode: true,
      maxProductsTotal: 500 // Small test run
    }
    
    console.log('📊 Test Configuration:')
    console.log('  - Merchant IDs:', testPayload.merchantIds)
    console.log('  - Test Mode:', testPayload.testMode)
    console.log('  - Max Products:', testPayload.maxProductsTotal)
    console.log('')
    
    console.log('🚀 Calling comprehensive-sync function...')
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/comprehensive-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(testPayload)
    })
    
    const responseTime = Date.now() - startTime
    
    console.log(`📡 Response Status: ${response.status} ${response.statusText}`)
    console.log(`⏱️  Response Time: ${responseTime}ms`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error Response:', errorText)
      return
    }
    
    const result = await response.json()
    
    console.log('')
    console.log('✅ SUCCESS! Comprehensive Sync Results:')
    console.log('========================================')
    console.log(`📦 Products Added: ${result.products_added}`)
    console.log(`🔄 API Calls Used: ${result.api_calls_used}`)
    console.log(`⏱️  Processing Time: ${result.processing_time_readable}`)
    console.log(`💾 Price History Entries: ${result.price_history_entries}`)
    console.log('')
    
    if (result.coverage_report) {
      console.log('📊 Coverage Report:')
      console.log(`  - Categories Processed: ${result.coverage_report.categories_total}`)
      console.log(`  - Categories Subdivided: ${result.coverage_report.categoriesSubdivided}`)
      console.log(`  - Price Ranges Used: ${result.coverage_report.priceRangesUsed}`)
      console.log(`  - Subdivision Rate: ${result.coverage_report.subdivision_rate}`)
      console.log(`  - Avg Products/Category: ${result.coverage_report.avg_products_per_category}`)
      console.log(`  - API Efficiency: ${result.coverage_report.api_efficiency}`)
    }
    
    console.log('')
    console.log('🎉 Test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

async function testIntelligentSyncRedirect() {
  console.log('')
  console.log('🧪 Testing Intelligent Sync Redirect to Comprehensive')
  console.log('=====================================================')
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/intelligent-sync?mode=comprehensive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        mode: 'comprehensive',
        merchants: [18557],
        maxProductsPerMerchant: 300
      })
    })
    
    console.log(`📡 Response Status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error Response:', errorText)
      return
    }
    
    const result = await response.json()
    
    if (result.redirected_from === 'intelligent-sync') {
      console.log('✅ SUCCESS! Redirect working correctly')
      console.log(`📦 Products from redirect: ${result.products_added}`)
    } else {
      console.log('⚠️  Redirect may not be working - no redirect marker found')
    }
    
  } catch (error) {
    console.error('❌ Redirect test failed:', error.message)
  }
}

// Run the tests
async function runAllTests() {
  console.log('🔬 TCC Deal Buddy - Comprehensive Sync Test Suite')
  console.log('=================================================')
  console.log('')
  
  if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'your-anon-key-here') {
    console.error('❌ Please set SUPABASE_ANON_KEY environment variable')
    console.log('   Run: export SUPABASE_ANON_KEY="your-actual-anon-key"')
    return
  }
  
  await testComprehensiveSync()
  await testIntelligentSyncRedirect()
  
  console.log('')
  console.log('🏁 All tests completed!')
}

runAllTests().catch(console.error)