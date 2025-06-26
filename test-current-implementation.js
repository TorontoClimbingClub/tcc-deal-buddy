// Test current TCC Deal Buddy implementation status
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://owtcaztrzujjuwwuldhl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCurrentImplementation() {
  console.log('🔍 Testing TCC Deal Buddy Implementation Status...\n')
  
  try {
    // 1. Test database connectivity and table access
    console.log('📊 1. Database Connectivity Test:')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('count')
      .limit(1)
    
    if (productsError) {
      console.log('❌ Products table access failed:', productsError.message)
    } else {
      console.log('✅ Products table accessible')
    }
    
    // 2. Test sync_queue table (newly created by Lovable)
    console.log('\n📋 2. Sync Queue Table Test:')
    const { data: syncQueue, error: queueError } = await supabase
      .from('sync_queue')
      .select('*')
      .limit(1)
    
    if (queueError) {
      console.log('❌ Sync queue table access failed:', queueError.message)
    } else {
      console.log('✅ Sync queue table accessible')
      console.log(`   Current queue items: ${syncQueue?.length || 0}`)
    }
    
    // 3. Test price_history table access
    console.log('\n📈 3. Price History Table Test:')
    const { data: priceHistory, error: historyError } = await supabase
      .from('price_history')
      .select('*')
      .limit(5)
    
    if (historyError) {
      console.log('❌ Price history table access failed:', historyError.message)
    } else {
      console.log('✅ Price history table accessible')
      console.log(`   Current price records: ${priceHistory?.length || 0}`)
      if (priceHistory && priceHistory.length > 0) {
        console.log('   Sample record:', priceHistory[0])
      }
    }
    
    // 4. Test Edge Functions availability
    console.log('\n🔧 4. Edge Functions Test:')
    
    // Test the test-price-backfill function first
    console.log('   Testing test-price-backfill function...')
    const { data: testResult, error: testError } = await supabase.functions.invoke('test-price-backfill')
    
    if (testError) {
      console.log('❌ test-price-backfill function failed:', testError.message)
    } else {
      console.log('✅ test-price-backfill function accessible')
      console.log('   Response:', testResult)
    }
    
    // 5. Count current data state
    console.log('\n📊 5. Current Data State:')
    
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    const { count: historyCount } = await supabase
      .from('price_history')
      .select('*', { count: 'exact', head: true })
    
    console.log(`   Total products: ${productCount || 0}`)
    console.log(`   Total price history records: ${historyCount || 0}`)
    console.log(`   Price history coverage: ${productCount > 0 ? Math.round((historyCount || 0) / productCount * 100) : 0}%`)
    
    // 6. Implementation readiness assessment
    console.log('\n🚀 6. Implementation Readiness:')
    const isReady = !productsError && !queueError && !historyError && !testError
    console.log(`   System status: ${isReady ? '✅ READY FOR BACKFILL' : '⚠️ NEEDS ATTENTION'}`)
    
    if (isReady) {
      console.log('\n🎯 Next Steps:')
      console.log('   1. Run comprehensive price history backfill')
      console.log('   2. Verify price charts functionality')
      console.log('   3. Test user interactions with historical data')
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testCurrentImplementation()