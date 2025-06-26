
// Execute comprehensive price history backfill with resumable tracking
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://owtcaztrzujjuwwuldhl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function executeResumableBackfill() {
  console.log('🚀 Starting Resumable Price History Backfill...\n')
  
  try {
    // 1. Initialize the tracking system
    console.log('📊 Initializing SKU tracking system...')
    const { data: initResult, error: initError } = await supabase
      .rpc('populate_sku_tracking')
    
    if (initError) {
      console.error('❌ Failed to initialize tracking:', initError)
      return
    }
    
    console.log(`✅ Added ${initResult?.[0]?.inserted_count || 0} new SKUs to tracking system`)
    
    // 2. Get initial progress
    const { data: initialProgress } = await supabase
      .from('price_sync_progress')
      .select('*')
      .single()
    
    if (initialProgress) {
      console.log('\n📈 Initial Progress:')
      console.log(`   Total SKUs: ${initialProgress.total_skus}`)
      console.log(`   Completed: ${initialProgress.completed} (${initialProgress.completion_percentage}%)`)
      console.log(`   Pending: ${initialProgress.pending}`)
      console.log(`   Failed: ${initialProgress.failed}`)
      console.log(`   Processing: ${initialProgress.processing}`)
    }
    
    // 3. Run multiple batches until complete
    let batchNumber = 1
    let totalProcessed = 0
    let totalApiCalls = 0
    let totalHistoryEntries = 0
    
    console.log('\n🔄 Starting batch processing...')
    
    while (true) {
      console.log(`\n--- Batch ${batchNumber} ---`)
      
      const batchStartTime = Date.now()
      
      const { data: batchResult, error: batchError } = await supabase.functions.invoke('comprehensive-price-backfill', {
        body: {
          batch_size: 15, // Process 15 SKUs per batch
          resume: true,
          skip_recent_hours: 24
        }
      })
      
      const batchTime = Date.now() - batchStartTime
      
      if (batchError) {
        console.error(`❌ Batch ${batchNumber} failed:`, batchError)
        break
      }
      
      if (batchResult.processed_products === 0) {
        console.log('✅ No more products to process - backfill complete!')
        break
      }
      
      totalProcessed += batchResult.processed_products
      totalApiCalls += batchResult.api_calls_used
      totalHistoryEntries += batchResult.price_history_entries
      
      console.log(`   Processed: ${batchResult.processed_products} products`)
      console.log(`   Failed: ${batchResult.failed_products} products`)
      console.log(`   API calls: ${batchResult.api_calls_used}`)
      console.log(`   Price entries: ${batchResult.price_history_entries}`)
      console.log(`   Batch time: ${Math.round(batchTime/1000)}s`)
      
      if (batchResult.progress_data) {
        console.log(`   Overall progress: ${batchResult.progress_data.completion_percentage}%`)
      }
      
      batchNumber++
      
      // Rate limiting between batches
      console.log('   ⏱️  Waiting 5 seconds before next batch...')
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      // Safety check - don't run forever
      if (batchNumber > 200) {
        console.log('⚠️  Safety limit reached - stopping after 200 batches')
        break
      }
    }
    
    // 4. Get final progress
    console.log('\n📊 Final Results:')
    const { data: finalProgress } = await supabase
      .from('price_sync_progress')
      .select('*')
      .single()
    
    if (finalProgress) {
      console.log(`   Total SKUs: ${finalProgress.total_skus}`)
      console.log(`   Completed: ${finalProgress.completed}`)
      console.log(`   No Data: ${finalProgress.no_data}`)
      console.log(`   Failed: ${finalProgress.failed}`)
      console.log(`   Completion: ${finalProgress.completion_percentage}%`)
      console.log(`   Total API Calls: ${finalProgress.total_api_calls_made}`)
    }
    
    console.log(`\n🎯 Session Summary:`)
    console.log(`   Batches processed: ${batchNumber - 1}`)
    console.log(`   Products processed: ${totalProcessed}`)
    console.log(`   API calls made: ${totalApiCalls}`)
    console.log(`   Price records created: ${totalHistoryEntries}`)
    
    // 5. Check price history table
    const { count: finalHistoryCount } = await supabase
      .from('price_history')
      .select('*', { count: 'exact', head: true })
    
    console.log(`\n📈 Price History Database:`)
    console.log(`   Total records: ${finalHistoryCount}`)
    
    // Sample some recent entries
    const { data: sampleHistory } = await supabase
      .from('price_history')
      .select('product_sku, price, is_sale, discount_percent, recorded_date')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (sampleHistory && sampleHistory.length > 0) {
      console.log(`\n📋 Recent Price History Entries:`)
      sampleHistory.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.product_sku}: $${record.price} on ${record.recorded_date} (Sale: ${record.is_sale})`)
      })
    }
    
    if (finalProgress && finalProgress.completion_percentage >= 90) {
      console.log('\n🎉 SUCCESS! Price History Backfill Nearly Complete!')
      console.log('✅ Most products now have historical price data')
      console.log('✅ Price charts and intelligence features ready')
      console.log('✅ Resumable system working perfectly')
    }
    
  } catch (error) {
    console.error('💥 Backfill execution failed:', error)
  }
}

executeResumableBackfill()
