
// Comprehensive test of all Edge Functions to verify data insertion
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://owtcaztrzujjuwwuldhl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAllEdgeFunctions() {
  console.log('🧪 Testing All Edge Functions for Data Insertion...\n')
  
  try {
    // Get initial database state
    console.log('📊 Initial Database State:')
    const { count: initialCount } = await supabase
      .from('price_history')
      .select('*', { count: 'exact', head: true })
    console.log(`   Initial price_history records: ${initialCount || 0}`)
    
    // Test 1: Database insertion test (new function)
    console.log('\n🧪 1. Testing Direct Database Insertion:')
    const { data: dbTestResult, error: dbTestError } = await supabase.functions.invoke('test-database-insert')
    
    if (dbTestError) {
      console.log('❌ Database test failed:', dbTestError.message)
    } else {
      console.log('✅ Database test passed:', dbTestResult.message)
      console.log('   Tests:', JSON.stringify(dbTestResult.tests, null, 2))
    }
    
    // Test 2: Basic connectivity test
    console.log('\n🧪 2. Testing Basic Function Connectivity:')
    const { data: basicTestResult, error: basicTestError } = await supabase.functions.invoke('test-price-backfill')
    
    if (basicTestError) {
      console.log('❌ Basic test failed:', basicTestError.message)
    } else {
      console.log('✅ Basic test passed:', basicTestResult)
    }
    
    // Test 3: Comprehensive backfill with single product (FIXED VERSION)
    console.log('\n🧪 3. Testing Fixed Comprehensive Backfill (Single Product):')
    const { data: backfillResult, error: backfillError } = await supabase.functions.invoke('comprehensive-price-backfill', {
      body: {
        mode: 'test_single',
        max_products: 1,
        batch_size: 1,
        test_sku: '6027-627' // Known working SKU
      }
    })
    
    if (backfillError) {
      console.log('❌ Comprehensive backfill failed:', backfillError.message)
      console.log('Error details:', JSON.stringify(backfillError, null, 2))
    } else {
      console.log('✅ Comprehensive backfill response:')
      console.log(JSON.stringify(backfillResult, null, 2))
    }
    
    // Test 4: Small batch test with multiple products
    console.log('\n🧪 4. Testing Small Batch Backfill (3 products):')
    const { data: batchResult, error: batchError } = await supabase.functions.invoke('comprehensive-price-backfill', {
      body: {
        mode: 'test',
        max_products: 3,
        batch_size: 2
      }
    })
    
    if (batchError) {
      console.log('❌ Batch backfill failed:', batchError.message)
    } else {
      console.log('✅ Batch backfill response:')
      console.log(JSON.stringify(batchResult, null, 2))
    }
    
    // Test 5: Check final database state
    console.log('\n📊 Final Database State Check:')
    
    // Wait a moment for any async operations
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const { count: finalCount } = await supabase
      .from('price_history')
      .select('*', { count: 'exact', head: true })
    
    console.log(`   Final price_history records: ${finalCount || 0}`)
    console.log(`   Records added: ${(finalCount || 0) - (initialCount || 0)}`)
    
    if (finalCount && finalCount > initialCount) {
      console.log('\n🎉 SUCCESS! Price history data is being inserted!')
      
      // Show sample records
      const { data: sampleData } = await supabase
        .from('price_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      
      console.log('\n📈 Sample price history records:')
      sampleData?.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.product_sku}: $${record.price} (${record.recorded_date}) ${record.is_sale ? '🏷️ Sale' : ''}`)
      })
      
    } else {
      console.log('\n⚠️ No new data was inserted')
      console.log('   Check Edge Function logs for detailed error information')
    }
    
    // Test 6: Summary and recommendations
    console.log('\n📋 Test Summary:')
    console.log(`   Database connection: ${dbTestResult?.success ? '✅' : '❌'}`)
    console.log(`   Basic function test: ${basicTestResult ? '✅' : '❌'}`)
    console.log(`   Single product backfill: ${backfillResult?.success ? '✅' : '❌'}`)
    console.log(`   Batch backfill: ${batchResult?.success ? '✅' : '❌'}`)
    console.log(`   Data insertion working: ${finalCount > initialCount ? '✅' : '❌'}`)
    
    if (finalCount > initialCount) {
      console.log('\n🚀 SYSTEM READY!')
      console.log('   Your price history backfill is now working correctly.')
      console.log('   You can run larger batches to populate more historical data.')
    } else {
      console.log('\n🔧 NEEDS INVESTIGATION:')
      console.log('   Check Supabase Edge Function logs for detailed error messages.')
      console.log('   Verify API credentials are properly set in Supabase secrets.')
    }
    
  } catch (error) {
    console.error('💥 Test suite failed:', error)
  }
}

testAllEdgeFunctions()
