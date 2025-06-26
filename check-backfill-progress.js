// Check progress of the comprehensive price history backfill
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://owtcaztrzujjuwwuldhl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkBackfillProgress() {
  console.log('🔍 Checking Comprehensive Backfill Progress...\n')
  
  try {
    // Check current price history count
    const { count: historyCount, error: historyError } = await supabase
      .from('price_history')
      .select('*', { count: 'exact', head: true })
    
    if (historyError) {
      console.log('❌ Error checking price history:', historyError.message)
      return
    }
    
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📊 Current Status:`)
    console.log(`   Products: ${productCount}`)
    console.log(`   Price History Records: ${historyCount || 0}`)
    console.log(`   Coverage: ${productCount > 0 ? Math.round((historyCount || 0) / productCount * 100) : 0}%`)
    console.log(`   Average records per product: ${productCount > 0 ? Math.round((historyCount || 0) / productCount * 10) / 10 : 0}`)
    
    // Check sync queue status
    console.log('\n📋 Sync Queue Status:')
    const { data: queueStats, error: queueError } = await supabase
      .from('sync_queue')
      .select('status')
    
    if (queueError) {
      console.log('❌ Error checking sync queue:', queueError.message)
    } else if (queueStats) {
      const statusCounts = queueStats.reduce((acc, item) => {
        acc[item.status || 'pending'] = (acc[item.status || 'pending'] || 0) + 1
        return acc
      }, {})
      
      console.log(`   Queue items: ${queueStats.length}`)
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`)
      })
    }
    
    // Check recent sync jobs
    console.log('\n🔧 Recent Sync Jobs:')
    const { data: recentJobs, error: jobsError } = await supabase
      .from('sync_jobs')
      .select('job_type, status, records_processed, api_calls_used, created_at')
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (jobsError) {
      console.log('❌ Error checking sync jobs:', jobsError.message)
    } else if (recentJobs && recentJobs.length > 0) {
      recentJobs.forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.job_type} - ${job.status} (${job.records_processed || 0} records, ${job.api_calls_used || 0} API calls)`)
      })
    } else {
      console.log('   No recent sync jobs found')
    }
    
    // Sample recent price history entries
    if (historyCount && historyCount > 0) {
      console.log('\n📈 Recent Price History Entries:')
      const { data: recentHistory, error: recentError } = await supabase
        .from('price_history')
        .select('product_sku, price, is_sale, discount_percent, recorded_date')
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (recentError) {
        console.log('❌ Error fetching recent history:', recentError.message)
      } else if (recentHistory) {
        recentHistory.forEach((record, index) => {
          console.log(`   ${index + 1}. ${record.product_sku}: $${record.price} (${record.recorded_date}) ${record.is_sale ? '🏷️' : ''} ${record.discount_percent}% off`)
        })
      }
    }
    
    // Progress assessment
    console.log('\n🎯 Progress Assessment:')
    if (historyCount === 0) {
      console.log('⏳ Backfill may still be starting or processing first batch')
      console.log('   Expected: 5-15 minutes for first results to appear')
    } else if (historyCount < 1000) {
      console.log('🔄 Backfill in progress - early stage')
      console.log('   Expected: 10,000-15,000 total records when complete')
    } else if (historyCount >= 1000 && historyCount < 5000) {
      console.log('🔄 Backfill in progress - mid stage')
      console.log('   Good progress, continuing processing...')
    } else if (historyCount >= 5000) {
      console.log('✅ Backfill showing excellent progress!')
      console.log('   Price intelligence system becoming functional')
    }
    
  } catch (error) {
    console.error('💥 Progress check failed:', error)
  }
}

checkBackfillProgress()