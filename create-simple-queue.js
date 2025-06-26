// Create a simple queue using existing infrastructure
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://owtcaztrzujjuwwuldhl.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('SUPABASE_ANON_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAlternativeApproach() {
  try {
    console.log('🔄 Testing alternative approach - direct price history sync...')
    
    // Test with the specific SKU from your example that has price history
    const sampleProducts = [
      { sku: '6027-627', merchant_id: 18557, name: 'Test Product with Price History' }
    ]
    
    if (!sampleProducts || sampleProducts.length === 0) {
      console.error('❌ No products found')
      return
    }
    
    console.log(`📦 Testing with ${sampleProducts.length} products:`)
    sampleProducts.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} (SKU: ${product.sku})`)
    })
    
    // Since we can't create the sync_queue table, let's test the price-history-sync function
    // by calling it directly with product parameters
    console.log('\n🚀 Testing price-history-sync function directly...')
    
    // Create temporary queue items as request body
    const testQueueItems = sampleProducts.map(product => ({
      product_sku: product.sku,
      merchant_id: product.merchant_id,
      sync_type: 'full_history',
      priority: 1
    }))
    
    const { data: functionResult, error: functionError } = await supabase.functions.invoke('price-history-sync', {
      body: { 
        batch_size: 1, 
        max_api_calls: 3,
        test_mode: true,
        test_products: testQueueItems
      }
    })
    
    if (functionError) {
      console.error('❌ Function error:', functionError)
      console.log('Error details:', JSON.stringify(functionError, null, 2))
      return
    }
    
    console.log('✅ Function response:', functionResult)
    
    // Check if any price history was created
    console.log('\n📊 Checking for price history results...')
    const { data: priceHistory, error: historyError } = await supabase
      .from('price_history')
      .select('*')
      .in('product_sku', sampleProducts.map(p => p.sku))
      .order('recorded_date', { ascending: false })
    
    if (historyError) {
      console.error('❌ Error fetching price history:', historyError)
    } else {
      console.log(`📈 Found ${priceHistory?.length || 0} price history records:`)
      if (priceHistory && priceHistory.length > 0) {
        priceHistory.forEach(record => {
          console.log(`  • ${record.product_sku}: $${record.price} on ${record.recorded_date} (Sale: ${record.is_sale})`)
        })
      } else {
        console.log('  No price history records found')
      }
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

testAlternativeApproach()