// Test basic Edge Function connectivity and simple operations
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://owtcaztrzujjuwwuldhl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testBasicFunctionality() {
  console.log('🔧 Testing Basic Edge Function Connectivity...\n')
  
  try {
    // Test the basic test function first
    console.log('1. 📋 Testing test-price-backfill function:')
    const { data: testResult, error: testError } = await supabase.functions.invoke('test-price-backfill')
    
    if (testError) {
      console.log('❌ test-price-backfill failed:', testError.message)
    } else {
      console.log('✅ test-price-backfill success:')
      console.log(JSON.stringify(testResult, null, 2))
    }
    
    // Try a minimal comprehensive backfill with just 1 product
    console.log('\n2. 🧪 Testing minimal comprehensive backfill (1 product):')
    const { data: minimalResult, error: minimalError } = await supabase.functions.invoke('comprehensive-price-backfill', {
      body: {
        mode: 'test_single',
        max_products: 1,
        batch_size: 1,
        test_sku: '6027-627' // Known working SKU
      }
    })
    
    if (minimalError) {
      console.log('❌ Minimal backfill failed:', minimalError.message)
      console.log('Error details:', JSON.stringify(minimalError, null, 2))
    } else {
      console.log('✅ Minimal backfill response:')
      console.log(JSON.stringify(minimalResult, null, 2))
    }
    
    // Check database state after test
    console.log('\n3. 📊 Database state check:')
    const { count: currentHistoryCount } = await supabase
      .from('price_history')
      .select('*', { count: 'exact', head: true })
    
    console.log(`   Price history records: ${currentHistoryCount || 0}`)
    
    if (currentHistoryCount && currentHistoryCount > 0) {
      const { data: latestRecords } = await supabase
        .from('price_history')
        .select('product_sku, price, is_sale, recorded_date, created_at')
        .order('created_at', { ascending: false })
        .limit(3)
      
      console.log('   Latest records:')
      latestRecords?.forEach((record, index) => {
        console.log(`     ${index + 1}. ${record.product_sku}: $${record.price} (${record.recorded_date}) ${record.is_sale ? '🏷️' : ''}`)
      })
      
      console.log('\n🎉 SUCCESS! Price history system is working!')
    } else {
      console.log('\n⚠️ Still no data inserted - need to check Edge Function logs')
    }
    
    // Also test direct database insertion to verify permissions
    console.log('\n4. 🔐 Testing direct database insertion:')
    try {
      const testRecord = {
        product_sku: 'TEST-123',
        merchant_id: 18557,
        price: 99.99,
        is_sale: false,
        discount_percent: 0,
        recorded_date: new Date().toISOString().split('T')[0]
      }
      
      const { data: insertResult, error: insertError } = await supabase
        .from('price_history')
        .insert(testRecord)
        .select()
      
      if (insertError) {
        console.log('❌ Direct insert failed:', insertError.message)
        console.log('   This suggests RLS policy issues')
      } else {
        console.log('✅ Direct insert successful:', insertResult)
        
        // Clean up test record
        await supabase
          .from('price_history')
          .delete()
          .eq('product_sku', 'TEST-123')
        
        console.log('   (Test record cleaned up)')
      }
    } catch (insertTestError) {
      console.log('❌ Direct insert test failed:', insertTestError.message)
    }
    
  } catch (error) {
    console.error('💥 Basic test failed:', error)
  }
}

testBasicFunctionality()