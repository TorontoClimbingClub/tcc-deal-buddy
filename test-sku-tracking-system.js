
// Test the new SKU API tracking system
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://owtcaztrzujjuwwuldhl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testTrackingSystem() {
  console.log('🧪 Testing SKU API Tracking System...\n')
  
  try {
    // 1. Test the populate function
    console.log('1️⃣ Testing populate_sku_tracking function...')
    const { data: populateResult, error: populateError } = await supabase
      .rpc('populate_sku_tracking')
    
    if (populateError) {
      console.error('❌ Populate function error:', populateError)
    } else {
      console.log(`✅ Populated ${populateResult?.[0]?.inserted_count || 0} SKUs into tracking table`)
    }
    
    // 2. Check the progress view
    console.log('\n2️⃣ Checking sync progress...')
    const { data: progressData, error: progressError } = await supabase
      .from('price_sync_progress')
      .select('*')
      .single()
    
    if (progressError) {
      console.error('❌ Progress view error:', progressError)
    } else {
      console.log('📊 Sync Progress Overview:')
      console.log(`   Total SKUs: ${progressData.total_skus}`)
      console.log(`   Completed: ${progressData.completed}`)
      console.log(`   No Data: ${progressData.no_data}`)
      console.log(`   Failed: ${progressData.failed}`)
      console.log(`   Pending: ${progressData.pending}`)
      console.log(`   Processing: ${progressData.processing}`)
      console.log(`   Completion: ${progressData.completion_percentage}%`)
      console.log(`   Total API Calls: ${progressData.total_api_calls_made}`)
    }
    
    // 3. Check activity status
    console.log('\n3️⃣ Checking activity status...')
    const { data: activityData, error: activityError } = await supabase
      .from('sync_activity_status')
      .select('*')
    
    if (activityError) {
      console.error('❌ Activity status error:', activityError)
    } else {
      console.log('📈 Activity Status:')
      activityData?.forEach(item => {
        console.log(`   ${item.status}: ${item.count} items (avg ${item.avg_api_calls?.toFixed(1)} API calls)`)
      })
    }
    
    // 4. Test the comprehensive backfill with resume
    console.log('\n4️⃣ Testing comprehensive backfill with resume (small batch)...')
    const { data: backfillResult, error: backfillError } = await supabase.functions.invoke('comprehensive-price-backfill', {
      body: {
        batch_size: 3,
        resume: true,
        max_products: null
      }
    })
    
    if (backfillError) {
      console.error('❌ Backfill error:', backfillError)
    } else {
      console.log('✅ Backfill completed:')
      console.log(`   Processed: ${backfillResult.processed_products}`)
      console.log(`   Failed: ${backfillResult.failed_products}`)
      console.log(`   Price entries: ${backfillResult.price_history_entries}`)
      console.log(`   API calls: ${backfillResult.api_calls_used}`)
      console.log(`   Processing time: ${backfillResult.processing_time_ms}ms`)
      console.log(`   Resume enabled: ${backfillResult.resume_enabled}`)
    }
    
    // 5. Check updated progress
    console.log('\n5️⃣ Checking updated progress after backfill...')
    const { data: updatedProgressData } = await supabase
      .from('price_sync_progress')
      .select('*')
      .single()
    
    if (updatedProgressData) {
      console.log('📊 Updated Progress:')
      console.log(`   Completed: ${updatedProgressData.completed}`)
      console.log(`   Completion: ${updatedProgressData.completion_percentage}%`)
      console.log(`   Total API Calls: ${updatedProgressData.total_api_calls_made}`)
    }
    
    // 6. Test cleanup functions
    console.log('\n6️⃣ Testing cleanup functions...')
    const { data: cleanupResult } = await supabase.rpc('cleanup_stuck_processing')
    const { data: resetResult } = await supabase.rpc('reset_failed_skus')
    
    console.log(`🧹 Cleanup results:`)
    console.log(`   Stuck processing cleaned: ${cleanupResult?.[0]?.cleaned_count || 0}`)
    console.log(`   Failed SKUs reset: ${resetResult?.[0]?.reset_count || 0}`)
    
    console.log('\n🎉 SKU tracking system test completed!')
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testTrackingSystem()
