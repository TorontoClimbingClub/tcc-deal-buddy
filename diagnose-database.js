import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://owtcaztrzujjuwwuldhl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE')

async function diagnoseDatabaseIssue() {
  console.log('🚨 CRITICAL: Diagnosing Database Connection Issue\n')
  
  try {
    // Test 1: Basic connection health
    console.log('1️⃣ Testing basic connection...')
    const { data: healthCheck, error: healthError } = await supabase
      .from('products')
      .select('count')
      .limit(1)
    
    if (healthError) {
      console.error('❌ DATABASE CONNECTION FAILED:', healthError.message)
      console.error('❌ Error code:', healthError.code)
      console.error('❌ Error details:', healthError.details)
      return
    }
    
    console.log('✅ Basic connection working')
    
    // Test 2: Check products table count
    console.log('\n2️⃣ Checking products table...')
    const { count: productCount, error: productError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    if (productError) {
      console.error('❌ Products table error:', productError.message)
    } else {
      console.log(`📦 Products table: ${productCount} records`)
    }
    
    // Test 3: Check current_deals view (what the website uses)
    console.log('\n3️⃣ Checking current_deals view...')
    const { count: dealsCount, error: dealsError } = await supabase
      .from('current_deals')
      .select('*', { count: 'exact', head: true })
    
    if (dealsError) {
      console.error('❌ CURRENT_DEALS VIEW ERROR:', dealsError.message)
      console.error('❌ This is likely why the website is broken!')
    } else {
      console.log(`🏷️ Current deals view: ${dealsCount} records`)
    }
    
    // Test 4: Sample products data
    console.log('\n4️⃣ Testing sample products...')
    const { data: sampleProducts, error: sampleError } = await supabase
      .from('products')
      .select('sku, name, sale_price, retail_price, last_sync_date')
      .limit(5)
    
    if (sampleError) {
      console.error('❌ Sample products error:', sampleError.message)
    } else if (sampleProducts && sampleProducts.length > 0) {
      console.log('📋 Sample products:')
      sampleProducts.forEach((p, i) => {
        console.log(`   ${i+1}. ${p.sku}: ${p.name}`)
        console.log(`      Sale: $${p.sale_price}, Retail: $${p.retail_price}`)
        console.log(`      Last sync: ${p.last_sync_date}`)
      })
    } else {
      console.log('❌ NO PRODUCTS FOUND - This explains the website issue!')
    }
    
    // Test 5: Check website-critical tables
    console.log('\n5️⃣ Checking website-critical data...')
    
    // Check if products have current sync date
    const { data: recentProducts, error: recentError } = await supabase
      .from('products')
      .select('sku, last_sync_date')
      .gte('last_sync_date', '2025-06-20')
      .limit(5)
    
    if (recentError) {
      console.error('❌ Recent products check failed:', recentError.message)
    } else {
      console.log(`📅 Products with recent sync dates: ${recentProducts?.length || 0}`)
    }
    
    // Test 6: Check sync status
    console.log('\n6️⃣ Checking sync system status...')
    const { data: syncProgress } = await supabase
      .from('price_sync_progress')
      .select('*')
      .single()
    
    if (syncProgress) {
      console.log('📊 Sync system status:')
      console.log(`   Total SKUs: ${syncProgress.total_skus}`)
      console.log(`   Completed: ${syncProgress.completed}`)
      console.log(`   Last activity: ${syncProgress.last_activity}`)
    }
    
    console.log('\n🔍 Database diagnosis complete!')
    
  } catch (error) {
    console.error('💥 CRITICAL DATABASE ERROR:', error.message)
    console.error('💥 Full error:', error)
  }
}

diagnoseDatabaseIssue()