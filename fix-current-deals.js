import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://owtcaztrzujjuwwuldhl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE')

async function investigateCurrentDeals() {
  console.log('🔍 Investigating current_deals view issue...\n')
  
  // Check products that should be in current_deals
  console.log('1️⃣ Checking products with discounts...')
  const { data: allProducts, error: allError } = await supabase
    .from('products')
    .select('sku, name, sale_price, retail_price, last_sync_date')
    .limit(100)
  
  // Filter for discounted products manually
  const discountedProducts = allProducts?.filter(p => p.sale_price < p.retail_price) || []
  
  if (allError) {
    console.error('❌ Error checking products:', allError.message)
  } else {
    console.log(`📊 Products with sale_price < retail_price: ${discountedProducts?.length || 0}`)
    if (discountedProducts && discountedProducts.length > 0) {
      discountedProducts.forEach((p, i) => {
        const discount = Math.round(((p.retail_price - p.sale_price) / p.retail_price) * 100)
        console.log(`   ${i+1}. ${p.sku}: $${p.sale_price} (was $${p.retail_price}) - ${discount}% off`)
      })
    }
  }
  
  // Check if current_deals view has a date filter issue
  console.log('\n2️⃣ Checking date-based filtering...')
  const { data: todayProducts, error: todayError } = await supabase
    .from('products')
    .select('sku, last_sync_date')
    .eq('last_sync_date', '2025-06-26')
    .limit(5)
  
  console.log(`📅 Products synced on 2025-06-26: ${todayProducts?.length || 0}`)
  
  const { data: recentProducts, error: recentError } = await supabase
    .from('products')
    .select('sku, last_sync_date')
    .gte('last_sync_date', '2025-06-25')
    .limit(5)
  
  console.log(`📅 Products synced since 2025-06-25: ${recentProducts?.length || 0}`)
  
  // Check current_deals view definition issue
  console.log('\n3️⃣ Testing manual current_deals query...')
  
  // Try to recreate what current_deals should return
  const { data: todayProducts2, error: manualError } = await supabase
    .from('products')
    .select('sku, name, sale_price, retail_price, last_sync_date')
    .eq('last_sync_date', '2025-06-26')
    .limit(50)
  
  const manualDeals = todayProducts2?.filter(p => p.sale_price < p.retail_price) || []
  
  if (manualError) {
    console.error('❌ Manual deals query failed:', manualError.message)
  } else {
    console.log(`🔧 Manual current_deals recreation: ${manualDeals?.length || 0} results`)
    if (manualDeals && manualDeals.length > 0) {
      console.log('✅ SOLUTION FOUND: Products exist but current_deals view filter is wrong!')
      manualDeals.forEach((p, i) => {
        console.log(`   ${i+1}. ${p.sku}: ${p.name} - $${p.sale_price}`)
      })
    }
  }
  
  // Check if view is filtering by today's date only
  console.log('\n4️⃣ Testing broader date range...')
  const { data: broadProducts, error: broadError } = await supabase
    .from('products')
    .select('sku, name, sale_price, retail_price, last_sync_date')
    .gte('last_sync_date', '2025-06-25')
    .limit(50)
  
  const broadDeals = broadProducts?.filter(p => p.sale_price < p.retail_price) || []
  
  if (broadDeals && broadDeals.length > 0) {
    console.log(`✅ FOUND ${broadDeals.length} deals with broader date range!`)
    console.log('💡 The current_deals view likely has a too-restrictive date filter')
  }
  
  console.log('\n🎯 Investigation complete!')
}

investigateCurrentDeals()