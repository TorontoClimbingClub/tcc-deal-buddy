// Script to check actual database counts for TCC Deal Buddy dashboard verification
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()

const supabaseUrl = 'https://owtcaztrzujjuwwuldhl.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabaseCounts() {
  console.log('🔍 Checking TCC Deal Buddy database counts...\n')

  try {
    // 1. Check current_deals view count
    console.log('1. Checking current_deals view (active deals)...')
    const { data: currentDeals, error: dealsError } = await supabase
      .from('current_deals')
      .select('calculated_discount_percent')
    
    if (dealsError) {
      console.error('❌ Error fetching current_deals:', dealsError.message)
    } else {
      console.log(`✅ Current deals count: ${currentDeals?.length || 0}`)
      if (currentDeals && currentDeals.length > 0) {
        const avgDiscount = Math.round(
          currentDeals.reduce((sum, deal) => sum + (deal.calculated_discount_percent || 0), 0) / currentDeals.length
        )
        console.log(`   Average discount: ${avgDiscount}%`)
      }
    }

    // 2. Check total products count (no date filter)
    console.log('\n2. Checking total products count (no date filter)...')
    const { count: totalProducts, error: totalCountError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    if (totalCountError) {
      console.error('❌ Error fetching total products:', totalCountError.message)
    } else {
      console.log(`✅ Total products (all dates): ${totalProducts || 0}`)
    }

    // 3. Check products count for today (what dashboard hook checks)
    console.log('\n3. Checking products count for today...')
    const today = new Date().toISOString().split('T')[0]
    const { count: todayProducts, error: todayCountError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('last_sync_date', today)
    
    if (todayCountError) {
      console.error('❌ Error fetching today products:', todayCountError.message)
    } else {
      console.log(`✅ Products for today (${today}): ${todayProducts || 0}`)
    }

    // 4. Check all sync dates and counts
    console.log('\n4. Checking all sync dates and product counts...')
    const { data: allProducts, error: allProductsError } = await supabase
      .from('products')
      .select('last_sync_date')
    
    if (allProductsError) {
      console.error('❌ Error fetching all products:', allProductsError.message)
    } else {
      // Get unique dates and count for each
      const uniqueDates = [...new Set(allProducts?.map(item => item.last_sync_date) || [])]
      console.log('   Sync dates and counts:')
      
      for (const date of uniqueDates.sort().reverse()) {
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('last_sync_date', date)
        console.log(`   ${date}: ${count} products`)
      }
    }

    // 5. Check products count for the most recent sync date
    console.log('\n5. Checking products count for most recent sync date...')
    const { data: latestDateData, error: latestDateError } = await supabase
      .from('products')
      .select('last_sync_date')
      .order('last_sync_date', { ascending: false })
      .limit(1)
    
    if (latestDateError) {
      console.error('❌ Error fetching latest sync date:', latestDateError.message)
    } else if (latestDateData && latestDateData.length > 0) {
      const latestDate = latestDateData[0].last_sync_date
      const { count: latestProducts, error: latestCountError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('last_sync_date', latestDate)
      
      if (latestCountError) {
        console.error('❌ Error fetching latest date products:', latestCountError.message)
      } else {
        console.log(`✅ Products for latest sync date (${latestDate}): ${latestProducts || 0}`)
      }
    }

    // 6. Check for any exact count of 1000 that might be causing the issue
    console.log('\n6. Checking for exact 1000 count anomaly...')
    const { data: allProductsForCheck, error: checkError } = await supabase
      .from('products')
      .select('last_sync_date')
    
    if (checkError) {
      console.error('❌ Error checking for 1000 count anomaly:', checkError.message)
    } else if (allProductsForCheck) {
      const uniqueDatesForCheck = [...new Set(allProductsForCheck?.map(item => item.last_sync_date) || [])]
      
      for (const date of uniqueDatesForCheck) {
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('last_sync_date', date)
        
        if (count === 1000) {
          console.log(`⚠️  Found exactly 1000 products for date: ${date}`)
        }
      }
    }

    // 7. Check recent sync jobs
    console.log('\n7. Checking recent sync jobs...')
    const { data: syncJobs, error: syncJobsError } = await supabase
      .from('sync_jobs')
      .select('job_type, status, records_processed, sync_date, started_at, completed_at')
      .order('started_at', { ascending: false })
      .limit(5)
    
    if (syncJobsError) {
      console.error('❌ Error fetching sync jobs:', syncJobsError.message)
    } else if (syncJobs && syncJobs.length > 0) {
      console.log('   Recent sync jobs:')
      syncJobs.forEach(job => {
        console.log(`   ${job.sync_date} - ${job.job_type}: ${job.status} (${job.records_processed || 0} records)`)
      })
    } else {
      console.log('   No sync jobs found')
    }

    console.log('\n✅ Database count check completed!')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the check
checkDatabaseCounts().catch(console.error)