// Test service role access to price_history table
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://owtcaztrzujjuwwuldhl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testServiceRoleAccess() {
  console.log('🔐 Testing Service Role Access to price_history...\n')
  
  try {
    // Test 1: Basic read test
    console.log('1. 📖 Testing READ access:')
    const { data: readTest, error: readError } = await supabase
      .from('price_history')
      .select('*')
      .limit(1)
    
    if (readError) {
      console.log('❌ Read failed:', readError.message)
    } else {
      console.log('✅ Read access confirmed')
    }
    
    // Test 2: Check current row count
    console.log('\n2. 📊 Current database state:')
    const { count } = await supabase
      .from('price_history')
      .select('*', { count: 'exact', head: true })
    
    console.log(`   Total price history records: ${count || 0}`)
    
    // Test 3: Direct API test with minimal data
    console.log('\n3. 🌐 Testing direct AvantLink API + manual insert:')
    const apiUrl = 'https://classic.avantlink.com/api.php?' + new URLSearchParams({
      module: 'ProductPriceCheck',
      affiliate_id: '348445',
      merchant_id: '18557',
      sku: '6027-627',
      show_pricing_history: '1',
      show_retail_price: '1',
      output: 'xml'
    })
    
    const response = await fetch(apiUrl)
    if (response.ok) {
      const xmlText = await response.text()
      console.log('✅ API response received')
      
      // Parse one price entry manually
      const dateMatch = xmlText.match(/<Date>([^<]+)<\/Date>/)
      const salePriceMatch = xmlText.match(/<Sale_Price>([^<]+)<\/Sale_Price>/)
      const retailPriceMatch = xmlText.match(/<Retail_Price>([^<]+)<\/Retail_Price>/)
      
      if (dateMatch && salePriceMatch && retailPriceMatch) {
        console.log(`   Found price: $${salePriceMatch[1]} (retail: $${retailPriceMatch[1]}) on ${dateMatch[1].split(' ')[0]}`)
      }
    }
    
    // Test 4: Call Edge Function with minimal params
    console.log('\n4. 🚀 Testing comprehensive-price-backfill with minimal batch:')
    const { data: backfillResult, error: backfillError } = await supabase.functions.invoke('comprehensive-price-backfill', {
      body: {
        mode: 'test',
        batch_size: 1,
        max_products: 1
      }
    })
    
    if (backfillError) {
      console.log('❌ Backfill error:', backfillError.message)
    } else {
      console.log('✅ Backfill response:', backfillResult)
    }
    
    // Test 5: Check final state
    console.log('\n5. 📊 Final database check:')
    
    // Wait a moment for any async operations
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const { count: finalCount } = await supabase
      .from('price_history')
      .select('*', { count: 'exact', head: true })
    
    console.log(`   Total price history records: ${finalCount || 0}`)
    
    if (finalCount && finalCount > 0) {
      console.log('\n🎉 SUCCESS! Price history system is working!')
      
      const { data: sampleData } = await supabase
        .from('price_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)
      
      console.log('\n📈 Sample price history records:')
      sampleData?.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.product_sku}: $${record.price} (${record.recorded_date}) ${record.is_sale ? '🏷️ Sale' : ''}`)
      })
    } else {
      console.log('\n⚠️ No data inserted yet')
      console.log('   The Edge Function may need more direct access or there might be an issue with the XML parsing')
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testServiceRoleAccess()