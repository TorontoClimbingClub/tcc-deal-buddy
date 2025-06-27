// Script to analyze the current_deals view in detail
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()

const supabaseUrl = 'https://owtcaztrzujjuwwuldhl.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function analyzeCurrenDeals() {
  console.log('🔍 Analyzing current_deals view in detail...\n')

  try {
    // 1. Check the definition of current_deals view by examining products that match the criteria
    console.log('1. Checking products that should be in current_deals view...')
    const today = new Date().toISOString().split('T')[0]
    
    const { data: todayProducts, error: todayError } = await supabase
      .from('products')
      .select('*')
      .eq('last_sync_date', today)
      .not('sale_price', 'is', null)
      .not('retail_price', 'is', null)
    
    console.log(`Products for today (${today}): ${todayProducts?.length || 0}`)
    
    if (todayProducts && todayProducts.length > 0) {
      const validDeals = todayProducts.filter(p => p.sale_price < p.retail_price)
      console.log(`Valid deals (sale_price < retail_price): ${validDeals.length}`)
    }

    // 2. Check products for the most recent sync date
    console.log('\n2. Checking products for most recent sync date...')
    const { data: latestDateData } = await supabase
      .from('products')
      .select('last_sync_date')
      .order('last_sync_date', { ascending: false })
      .limit(1)
    
    if (latestDateData && latestDateData.length > 0) {
      const latestDate = latestDateData[0].last_sync_date
      console.log(`Latest sync date: ${latestDate}`)
      
      const { data: latestProducts, error: latestError } = await supabase
        .from('products')
        .select('*')
        .eq('last_sync_date', latestDate)
        .not('sale_price', 'is', null)
        .not('retail_price', 'is', null)
      
      if (latestError) {
        console.error('❌ Error fetching latest products:', latestError.message)
      } else {
        console.log(`Products for latest date (${latestDate}): ${latestProducts?.length || 0}`)
        
        if (latestProducts && latestProducts.length > 0) {
          const validDeals = latestProducts.filter(p => p.sale_price < p.retail_price)
          console.log(`Valid deals (sale_price < retail_price): ${validDeals.length}`)
          
          // Check if this matches the current_deals count
          if (validDeals.length === 1000) {
            console.log('⚠️  This matches the current_deals count of 1000!')
          }
        }
      }
    }

    // 3. Check current_deals view directly with details
    console.log('\n3. Checking current_deals view directly...')
    const { data: currentDeals, error: dealsError } = await supabase
      .from('current_deals')
      .select('last_sync_date, calculated_discount_percent')
      .limit(10)
    
    if (dealsError) {
      console.error('❌ Error fetching current_deals:', dealsError.message)
    } else if (currentDeals && currentDeals.length > 0) {
      console.log('Sample current_deals records:')
      console.log('Sync Date | Discount %')
      console.log('----------|----------')
      currentDeals.forEach(deal => {
        console.log(`${deal.last_sync_date} | ${deal.calculated_discount_percent}%`)
      })
    }

    // 4. Check the exact SQL definition that current_deals view uses
    console.log('\n4. Checking what date current_deals view is using...')
    const { data: currentDealsAll, error: allDealsError } = await supabase
      .from('current_deals')
      .select('last_sync_date')
    
    if (allDealsError) {
      console.error('❌ Error fetching all current_deals dates:', allDealsError.message)
    } else if (currentDealsAll && currentDealsAll.length > 0) {
      const uniqueDates = [...new Set(currentDealsAll.map(deal => deal.last_sync_date))]
      console.log('Dates found in current_deals view:')
      uniqueDates.forEach(date => {
        const count = currentDealsAll.filter(deal => deal.last_sync_date === date).length
        console.log(`${date}: ${count} deals`)
      })
    }

    // 5. Test the actual current_deals view SQL condition
    console.log('\n5. Testing current_deals SQL condition manually...')
    
    // The view uses: WHERE p.last_sync_date = CURRENT_DATE
    // Let's see what CURRENT_DATE returns in the database
    console.log(`Local current date: ${new Date().toISOString().split('T')[0]}`)
    
    // Check if there are deals from yesterday that might be showing as "current"
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    console.log(`Checking products from ${yesterdayStr} that would be valid deals...`)
    const { data: yesterdayProducts } = await supabase
      .from('products')
      .select('sale_price, retail_price')
      .eq('last_sync_date', yesterdayStr)
      .not('sale_price', 'is', null)
      .not('retail_price', 'is', null)
    
    if (yesterdayProducts) {
      const validYesterdayDeals = yesterdayProducts.filter(p => p.sale_price < p.retail_price)
      console.log(`Valid deals from ${yesterdayStr}: ${validYesterdayDeals.length}`)
    }

    console.log('\n✅ Current deals analysis completed!')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the analysis
analyzeCurrenDeals().catch(console.error)