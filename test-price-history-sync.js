// Test price history sync function with sample products
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://owtcaztrzujjuwwuldhl.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('SUPABASE_ANON_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testPriceHistorySync() {
  try {
    console.log('🧪 Testing price-history-sync function...')
    
    // First, get a few sample products from database (only valid merchant 18557)
    const { data: sampleProducts, error: productsError } = await supabase
      .from('products')
      .select('sku, merchant_id, name')
      .eq('merchant_id', 18557)
      .limit(3)
    
    if (productsError) {
      console.error('❌ Error fetching sample products:', productsError)
      return
    }
    
    if (!sampleProducts || sampleProducts.length === 0) {
      console.error('❌ No products found in database')
      return
    }
    
    console.log(`📦 Found ${sampleProducts.length} sample products:`)
    sampleProducts.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} (SKU: ${product.sku}, Merchant: ${product.merchant_id})`)
    })
    
    // Add sample products to sync queue
    console.log('\n📥 Adding products to sync queue...')
    const queueItems = sampleProducts.map(product => ({
      product_sku: product.sku,
      merchant_id: product.merchant_id,
      sync_type: 'full_history',
      priority: 1, // High priority for testing
      status: 'pending'
    }))
    
    const { error: queueError } = await supabase
      .from('sync_queue')
      .upsert(queueItems, {
        onConflict: 'product_sku,merchant_id,sync_type,status'
      })
    
    if (queueError) {
      console.error('❌ Error adding to sync queue:', queueError)
      return
    }
    
    console.log(`✅ Added ${queueItems.length} items to sync queue`)
    
    // Test the price-history-sync function
    console.log('\n🚀 Invoking price-history-sync function...')
    const { data: functionResult, error: functionError } = await supabase.functions.invoke('price-history-sync', {
      body: { batch_size: 3, max_api_calls: 5 }
    })
    
    if (functionError) {
      console.error('❌ Function error:', functionError)
      return
    }
    
    console.log('✅ Function response:', functionResult)
    
    // Check price history results
    console.log('\n📊 Checking price history results...')
    const { data: priceHistory, error: historyError } = await supabase
      .from('price_history')
      .select('*')
      .in('product_sku', sampleProducts.map(p => p.sku))
      .order('recorded_date', { ascending: false })
    
    if (historyError) {
      console.error('❌ Error fetching price history:', historyError)
      return
    }
    
    console.log(`📈 Found ${priceHistory?.length || 0} price history records:`)
    if (priceHistory && priceHistory.length > 0) {
      priceHistory.forEach(record => {
        console.log(`  • ${record.product_sku}: $${record.price} on ${record.recorded_date} (Sale: ${record.is_sale})`)
      })
    } else {
      console.log('  No price history records found yet')
    }
    
    // Check sync queue status
    console.log('\n📋 Checking sync queue status...')
    const { data: queueStatus, error: statusError } = await supabase
      .from('sync_queue')
      .select('*')
      .in('product_sku', sampleProducts.map(p => p.sku))
      .order('created_at', { ascending: false })
    
    if (statusError) {
      console.error('❌ Error fetching queue status:', statusError)
      return
    }
    
    console.log(`📋 Sync queue status:`)
    queueStatus?.forEach(item => {
      console.log(`  • ${item.product_sku}: ${item.status} (Priority: ${item.priority})`)
    })
    
  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

testPriceHistorySync()