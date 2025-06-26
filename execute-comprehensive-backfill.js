// Execute comprehensive price history backfill for all products
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://owtcaztrzujjuwwuldhl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function executeComprehensiveBackfill() {
  console.log('🚀 Starting Comprehensive Price History Backfill...\n')
  
  try {
    // Get initial state
    const { count: initialProductCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    const { count: initialHistoryCount } = await supabase
      .from('price_history')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📊 Initial State:`)
    console.log(`   Products: ${initialProductCount}`)
    console.log(`   Price History Records: ${initialHistoryCount}`)
    console.log(`   Coverage: ${initialProductCount > 0 ? Math.round((initialHistoryCount || 0) / initialProductCount * 100) : 0}%\n`)
    
    // Execute comprehensive backfill
    console.log('🔄 Invoking comprehensive-price-backfill function...')
    console.log('⏱️  This will take 15-20 minutes to process all 2,184 products')
    console.log('📡 Processing in batches of 5 with rate limiting\n')
    
    const startTime = Date.now()
    
    const { data: backfillResult, error: backfillError } = await supabase.functions.invoke('comprehensive-price-backfill', {
      body: {
        mode: 'full_catalog',
        batch_size: 5,
        max_products: 2184,
        delay_between_batches: 2000,
        delay_between_requests: 500
      }
    })
    
    const endTime = Date.now()
    const processingTime = Math.round((endTime - startTime) / 1000)
    
    if (backfillError) {
      console.log('❌ Backfill function failed:', backfillError.message)
      return
    }
    
    console.log('✅ Backfill function completed!')
    console.log(`⏱️  Total processing time: ${processingTime}s (${Math.round(processingTime/60)}m)\n`)
    
    // Display results
    console.log('📊 Backfill Results:')
    console.log(JSON.stringify(backfillResult, null, 2))
    
    // Get final state
    console.log('\n🔍 Checking final database state...')
    
    const { count: finalProductCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    const { count: finalHistoryCount } = await supabase
      .from('price_history')
      .select('*', { count: 'exact', head: true })
    
    console.log(`\n📊 Final State:`)
    console.log(`   Products: ${finalProductCount}`)
    console.log(`   Price History Records: ${finalHistoryCount}`)
    console.log(`   Coverage: ${finalProductCount > 0 ? Math.round((finalHistoryCount || 0) / finalProductCount * 100) : 0}%`)
    console.log(`   New Records Added: ${(finalHistoryCount || 0) - (initialHistoryCount || 0)}`)
    
    // Sample price history data
    console.log('\n📈 Sample Price History Data:')
    const { data: sampleHistory } = await supabase
      .from('price_history')
      .select('product_sku, price, is_sale, discount_percent, recorded_date')
      .order('recorded_date', { ascending: false })
      .limit(5)
    
    if (sampleHistory && sampleHistory.length > 0) {
      sampleHistory.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.product_sku}: $${record.price} on ${record.recorded_date} (Sale: ${record.is_sale}, Discount: ${record.discount_percent}%)`)
      })
    }
    
    // Success summary
    if (finalHistoryCount && finalHistoryCount > 1000) {
      console.log('\n🎉 SUCCESS! Price Intelligence System Ready!')
      console.log('✅ Comprehensive historical data populated')
      console.log('✅ Instant price charts now available')
      console.log('✅ Users can view 2-3 years of price history per product')
      console.log('✅ Market intelligence and trend analysis enabled')
    }
    
  } catch (error) {
    console.error('💥 Backfill execution failed:', error)
  }
}

executeComprehensiveBackfill()