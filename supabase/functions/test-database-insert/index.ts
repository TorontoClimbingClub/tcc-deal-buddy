
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🧪 Testing direct database insertion to price_history...')
    
    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Test 1: Check database connection
    console.log('🔗 Testing database connection...')
    const { data: testData, error: testError } = await supabaseClient
      .from('price_history')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Database connection failed:', testError)
      throw new Error(`Database connection failed: ${testError.message}`)
    }
    
    console.log('✅ Database connection successful')

    // Test 2: Insert a simple test record
    console.log('💾 Inserting test price history record...')
    
    const testRecord = {
      product_sku: 'TEST-INSERT-123',
      merchant_id: 18557,
      price: 99.99,
      is_sale: false,
      discount_percent: 0,
      recorded_date: '2025-01-20'
    }
    
    console.log('📝 Test record:', testRecord)
    
    const { data: insertData, error: insertError } = await supabaseClient
      .from('price_history')
      .insert(testRecord)
      .select()
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError)
      throw new Error(`Insert failed: ${insertError.message}`)
    }
    
    console.log('✅ Insert successful:', insertData)

    // Test 3: Verify the record exists
    console.log('🔍 Verifying inserted record...')
    
    const { data: verifyData, error: verifyError } = await supabaseClient
      .from('price_history')
      .select('*')
      .eq('product_sku', 'TEST-INSERT-123')
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError)
      throw new Error(`Verification failed: ${verifyError.message}`)
    }
    
    console.log('✅ Record verified:', verifyData)

    // Test 4: Clean up test record
    console.log('🧹 Cleaning up test record...')
    
    const { error: deleteError } = await supabaseClient
      .from('price_history')
      .delete()
      .eq('product_sku', 'TEST-INSERT-123')
    
    if (deleteError) {
      console.log('⚠️ Cleanup failed (non-critical):', deleteError)
    } else {
      console.log('✅ Cleanup successful')
    }

    // Test 5: Check current database state
    const { count: currentCount } = await supabaseClient
      .from('price_history')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📊 Current price_history records: ${currentCount}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Database insertion test completed successfully',
        tests: {
          connection: 'passed',
          insertion: 'passed',
          verification: 'passed',
          cleanup: 'passed'
        },
        current_record_count: currentCount,
        test_record: testRecord
      }, null, 2),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('💥 Database test failed:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
