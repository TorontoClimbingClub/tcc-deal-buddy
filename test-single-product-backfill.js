// Test single product price history to verify the system is working
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://owtcaztrzujjuwwuldhl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSingleProductBackfill() {
  console.log('🧪 Testing Single Product Price History Backfill...\n')
  
  try {
    // Test direct AvantLink API call first
    console.log('1. 🌐 Testing AvantLink API directly:')
    const testSku = '6027-627' // Known working SKU from previous tests
    const apiUrl = `https://classic.avantlink.com/api.php?` + new URLSearchParams({
      module: 'ProductPriceCheck',
      affiliate_id: '348445',
      merchant_id: '18557',
      sku: testSku,
      show_pricing_history: '1',
      show_retail_price: '1',
      output: 'xml'
    })
    
    console.log(`   Testing SKU: ${testSku}`)
    console.log(`   API URL: ${apiUrl}`)
    
    const response = await fetch(apiUrl)
    console.log(`   Response: ${response.status} ${response.statusText}`)
    
    if (response.ok) {
      const xmlText = await response.text()
      console.log(`   XML Preview: ${xmlText.substring(0, 200)}...`)
      
      // Count Table1 entries
      const table1Count = (xmlText.match(/<Table1>/g) || []).length
      console.log(`   ✅ Found ${table1Count} price history entries`)
    } else {
      console.log('   ❌ API call failed')
      return
    }
    
    // Test small backfill via Edge Function
    console.log('\n2. 🔧 Testing Edge Function with small batch:')
    
    const { data: smallBackfill, error: backfillError } = await supabase.functions.invoke('comprehensive-price-backfill', {
      body: {
        mode: 'test',
        batch_size: 2,
        max_products: 2,
        test_skus: ['6027-627', '5002-030'] // Known working SKUs
      }
    })
    
    if (backfillError) {
      console.log('   ❌ Edge Function error:', backfillError.message)
      console.log('   Error details:', JSON.stringify(backfillError, null, 2))
    } else {
      console.log('   ✅ Edge Function response:')
      console.log(JSON.stringify(smallBackfill, null, 2))
    }
    
    // Check if any data was added
    console.log('\n3. 📊 Checking database after test:')
    
    const { count: historyCount } = await supabase
      .from('price_history')
      .select('*', { count: 'exact', head: true })
    
    console.log(`   Price history records: ${historyCount || 0}`)
    
    if (historyCount && historyCount > 0) {
      const { data: sampleData } = await supabase
        .from('price_history')
        .select('product_sku, price, is_sale, recorded_date')
        .limit(3)
      
      console.log('   Sample records:')
      sampleData?.forEach((record, index) => {
        console.log(`     ${index + 1}. ${record.product_sku}: $${record.price} (${record.recorded_date}) ${record.is_sale ? '🏷️' : ''}`)
      })
    }
    
    // Test recommendation
    console.log('\n4. 💡 Recommendation:')
    if (historyCount && historyCount > 0) {
      console.log('   ✅ System working! Ready for full backfill')
      console.log('   🚀 Run: comprehensive-price-backfill with full parameters')
    } else {
      console.log('   ⚠️ No data added - need to investigate:')
      console.log('   - Check Supabase Edge Function logs')
      console.log('   - Verify API key is correctly set in Supabase secrets')
      console.log('   - Check RLS policies allow service_role to insert')
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testSingleProductBackfill()