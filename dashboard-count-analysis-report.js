// Comprehensive analysis report for TCC Deal Buddy dashboard count discrepancies
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()

const supabaseUrl = 'https://owtcaztrzujjuwwuldhl.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function generateDashboardAnalysisReport() {
  console.log('📊 TCC DEAL BUDDY DASHBOARD COUNT ANALYSIS REPORT')
  console.log('=' .repeat(65))
  console.log()

  try {
    const today = new Date().toISOString().split('T')[0]

    // 1. Dashboard Hook Simulation
    console.log('🔍 DASHBOARD HOOK BEHAVIOR SIMULATION')
    console.log('-'.repeat(45))
    
    // Simulate exactly what the dashboard hook does
    const { data: dealsData, error: dealsError } = await supabase
      .from('current_deals')
      .select('calculated_discount_percent')

    const { count: totalCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('last_sync_date', today)

    console.log(`Dashboard Hook Results:`)
    console.log(`  Active Deals: ${dealsData?.length || 0}`)
    console.log(`  Total Products (today): ${totalCount || 0}`)
    
    if (dealsData && dealsData.length > 0) {
      const avgDiscount = Math.round(
        dealsData.reduce((sum, deal) => sum + (deal.calculated_discount_percent || 0), 0) / dealsData.length
      )
      console.log(`  Average Discount: ${avgDiscount}%`)
    }

    // 2. Actual Database State
    console.log('\n📊 ACTUAL DATABASE STATE')
    console.log('-'.repeat(30))
    
    const { count: totalProductsAllDates } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    const { data: latestDateData } = await supabase
      .from('products')
      .select('last_sync_date')
      .order('last_sync_date', { ascending: false })
      .limit(1)

    let latestDate = null
    let latestDateProductCount = 0
    
    if (latestDateData && latestDateData.length > 0) {
      latestDate = latestDateData[0].last_sync_date
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('last_sync_date', latestDate)
      latestDateProductCount = count || 0
    }

    console.log(`Database Reality:`)
    console.log(`  Total Products (all dates): ${totalProductsAllDates || 0}`)
    console.log(`  Today's Date: ${today}`)
    console.log(`  Products for Today: ${totalCount || 0}`)
    console.log(`  Latest Sync Date: ${latestDate}`)
    console.log(`  Products for Latest Date: ${latestDateProductCount}`)

    // 3. Current Deals View Analysis
    console.log('\n🎯 CURRENT_DEALS VIEW ANALYSIS')
    console.log('-'.repeat(35))
    
    const { data: allCurrentDeals } = await supabase
      .from('current_deals')
      .select('last_sync_date')

    if (allCurrentDeals) {
      const dateBreakdown = {}
      allCurrentDeals.forEach(deal => {
        dateBreakdown[deal.last_sync_date] = (dateBreakdown[deal.last_sync_date] || 0) + 1
      })

      console.log(`Current Deals View Breakdown:`)
      Object.entries(dateBreakdown)
        .sort(([a], [b]) => b.localeCompare(a))
        .forEach(([date, count]) => {
          console.log(`  ${date}: ${count} deals`)
        })
      console.log(`  Total in current_deals view: ${allCurrentDeals.length}`)
    }

    // 4. Problem Identification
    console.log('\n🚨 PROBLEM IDENTIFICATION')
    console.log('-'.repeat(30))
    
    console.log(`Issue Summary:`)
    console.log(`  1. Dashboard shows "${dealsData?.length || 0}" active deals`)
    console.log(`  2. Dashboard shows "${totalCount || 0}" total products`)
    console.log(`  3. But there are actually ${totalProductsAllDates || 0} total products in database`)
    console.log(`  4. The latest sync date is ${latestDate}, not ${today}`)
    console.log()
    
    console.log(`Root Cause Analysis:`)
    console.log(`  ❌ current_deals view uses CURRENT_DATE (${today})`)
    console.log(`  ❌ Dashboard hook filters products by today's date`)
    console.log(`  ❌ But the latest data is from ${latestDate}`)
    console.log(`  ❌ No sync has run for today, so counts are incorrect`)

    // 5. Fix Recommendations
    console.log('\n💡 RECOMMENDED FIXES')
    console.log('-'.repeat(25))
    
    console.log(`Option 1: Update current_deals view to use latest sync date`)
    console.log(`  - Change WHERE p.last_sync_date = CURRENT_DATE`)
    console.log(`  - To WHERE p.last_sync_date = (SELECT MAX(last_sync_date) FROM products)`)
    console.log()
    
    console.log(`Option 2: Update dashboard hook to use latest sync date`)
    console.log(`  - First query for MAX(last_sync_date) from products`)
    console.log(`  - Then filter by that date instead of today's date`)
    console.log()
    
    console.log(`Option 3: Ensure daily sync runs and updates current date`)
    console.log(`  - Fix the sync job to run daily`)
    console.log(`  - Ensure products table gets updated with current date`)

    // 6. Verification of the exact "1000" source
    console.log('\n🔢 SOURCE OF "1000" COUNT')
    console.log('-'.repeat(30))
    
    if (dealsData && dealsData.length === 1000) {
      console.log(`✅ The "1000" comes from current_deals view returning exactly 1000 records`)
      console.log(`   This is likely due to:`)
      console.log(`   - Database query limit/pagination`)
      console.log(`   - Or coincidentally having exactly 1000 valid deals`)
    } else {
      console.log(`🤔 The "1000" doesn't directly match current_deals count of ${dealsData?.length || 0}`)
    }

    console.log('\n✅ Analysis complete!')
    console.log('\nNext steps: Choose one of the recommended fixes above.')

  } catch (error) {
    console.error('❌ Error generating report:', error.message)
  }
}

// Run the analysis
generateDashboardAnalysisReport().catch(console.error)