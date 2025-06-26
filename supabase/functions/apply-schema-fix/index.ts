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
    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔧 Applying schema fixes...')

    // Apply the missing columns
    const sqlCommands = [
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS sync_priority INTEGER DEFAULT 3`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS availability_score FLOAT DEFAULT 1.0`,
      `CREATE INDEX IF NOT EXISTS idx_products_sync_priority ON products(sync_priority, last_sync_date)`,
      `CREATE INDEX IF NOT EXISTS idx_products_availability ON products(availability_score) WHERE availability_score < 1.0`
    ]

    const results = []
    
    for (const sql of sqlCommands) {
      try {
        console.log(`Executing: ${sql}`)
        const { data, error } = await supabaseClient.rpc('exec_sql', { sql_query: sql })
        
        if (error) {
          console.error(`SQL Error for "${sql}":`, error)
          results.push({ sql, success: false, error: error.message })
        } else {
          console.log(`✅ Success: ${sql}`)
          results.push({ sql, success: true })
        }
      } catch (err) {
        console.error(`Exception for "${sql}":`, err)
        results.push({ sql, success: false, error: err.message })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Schema fix attempted',
        results
      }, null, 2),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Schema fix error:', error)
    
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