
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🧪 Testing price history backfill with sample products...')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Test with a few sample products
    const { data: sampleProducts, error } = await supabaseClient
      .from('products')
      .select('sku, merchant_id, name')
      .limit(3)

    if (error) {
      throw error
    }

    console.log(`📦 Testing with ${sampleProducts?.length || 0} sample products`)

    // Test sync_queue table access
    const { data: queueTest, error: queueError } = await supabaseClient
      .from('sync_queue')
      .select('*')
      .limit(1)

    if (queueError) {
      console.error('❌ sync_queue table access failed:', queueError)
    } else {
      console.log('✅ sync_queue table accessible')
    }

    // Test price_history table access
    const { data: historyTest, error: historyError } = await supabaseClient
      .from('price_history')
      .select('*')
      .limit(1)

    if (historyError) {
      console.error('❌ price_history table access failed:', historyError)
    } else {
      console.log('✅ price_history table accessible')
    }

    // Check AvantLink API credentials
    const affiliateId = Deno.env.get('AVANTLINK_AFFILIATE_ID')
    const apiKey = Deno.env.get('AVANTLINK_API_KEY')
    
    console.log(`🔑 AvantLink credentials: ${affiliateId ? 'Present' : 'Missing'} / ${apiKey ? 'Present' : 'Missing'}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test completed successfully',
        results: {
          sample_products: sampleProducts?.length || 0,
          sync_queue_accessible: !queueError,
          price_history_accessible: !historyError,
          avantlink_credentials: !!(affiliateId && apiKey)
        }
      }, null, 2),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('💥 Test failed:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
