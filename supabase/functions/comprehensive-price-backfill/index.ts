
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BackfillRequest {
  mode?: 'full_catalog' | 'test_batch'
  batch_size?: number
  max_products?: number
  specific_skus?: string[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Starting comprehensive price history backfill...')
    
    // Initialize Supabase client with service role key for database operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get AvantLink API credentials
    const affiliateId = Deno.env.get('AVANTLINK_AFFILIATE_ID')
    const apiKey = Deno.env.get('AVANTLINK_API_KEY')
    
    if (!affiliateId || !apiKey) {
      throw new Error('Missing AvantLink API credentials')
    }

    const requestBody = await req.json() as BackfillRequest
    const { 
      mode = 'full_catalog', 
      batch_size = 5, 
      max_products = 2184,
      specific_skus = []
    } = requestBody

    console.log(`📊 Backfill configuration:`, { mode, batch_size, max_products })

    // Fetch all products from database
    let query = supabaseClient
      .from('products')
      .select('sku, merchant_id, name, merchant_name')
      .order('merchant_id', { ascending: true })

    if (specific_skus.length > 0) {
      query = query.in('sku', specific_skus)
    } else if (mode === 'test_batch') {
      query = query.limit(10)
    } else {
      query = query.limit(max_products)
    }

    const { data: products, error: fetchError } = await query

    if (fetchError) {
      console.error('❌ Error fetching products:', fetchError)
      throw fetchError
    }

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'No products found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`📦 Processing ${products.length} products for price history backfill`)

    let totalProcessed = 0
    let totalSuccessful = 0
    let totalApiCalls = 0
    let totalPriceRecords = 0
    const errors: any[] = []

    // Process products in batches
    for (let i = 0; i < products.length; i += batch_size) {
      const batch = products.slice(i, i + batch_size)
      console.log(`\n🔄 Processing batch ${Math.floor(i / batch_size) + 1}/${Math.ceil(products.length / batch_size)}`)

      // Process each product in the batch
      for (const product of batch) {
        try {
          console.log(`📡 Fetching price history for ${product.sku} (${product.merchant_name})`)
          
          // Call AvantLink ProductPriceCheck API with XML output
          const apiUrl = 'https://classic.avantlink.com/api.php?' + new URLSearchParams({
            module: 'ProductPriceCheck',
            affiliate_id: affiliateId,
            merchant_id: product.merchant_id.toString(),
            sku: product.sku,
            show_pricing_history: 'true',
            show_retail_price: 'true',
            output: 'xml'
          }).toString()

          const response = await fetch(apiUrl)
          totalApiCalls++

          if (!response.ok) {
            console.error(`❌ API call failed for ${product.sku}: ${response.status}`)
            errors.push({ sku: product.sku, error: `API call failed: ${response.status}` })
            continue
          }

          const xmlText = await response.text()
          console.log(`📄 Received XML response for ${product.sku} (${xmlText.length} chars)`)

          // Parse XML price history
          const priceHistory = parseXMLPriceHistory(xmlText)
          console.log(`📈 Parsed ${priceHistory.length} price history entries for ${product.sku}`)

          if (priceHistory.length === 0) {
            console.log(`⚠️ No price history found for ${product.sku}`)
            continue
          }

          // Insert price history records with upsert logic
          for (const record of priceHistory) {
            try {
              const { error: insertError } = await supabaseClient
                .from('price_history')
                .upsert({
                  product_sku: product.sku,
                  merchant_id: product.merchant_id,
                  price: record.price,
                  is_sale: record.is_sale,
                  discount_percent: record.discount_percent,
                  recorded_date: record.date,
                  data_source: 'avantlink_backfill'
                }, {
                  onConflict: 'product_sku,merchant_id,recorded_date'
                })

              if (insertError) {
                console.error(`❌ Error inserting price history for ${product.sku}:`, insertError)
                errors.push({ sku: product.sku, error: insertError.message })
              } else {
                totalPriceRecords++
              }
            } catch (insertException) {
              console.error(`💥 Exception inserting price history for ${product.sku}:`, insertException)
              errors.push({ sku: product.sku, error: insertException.message })
            }
          }

          totalSuccessful++
          console.log(`✅ Successfully processed ${product.sku} - ${priceHistory.length} records`)

        } catch (error) {
          console.error(`💥 Error processing ${product.sku}:`, error)
          errors.push({ sku: product.sku, error: error.message })
        }

        totalProcessed++

        // Small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Longer delay between batches
      if (i + batch_size < products.length) {
        console.log('⏱️ Pausing between batches...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    // Final summary
    console.log(`\n🎉 Backfill completed!`)
    console.log(`📊 Summary:`)
    console.log(`   - Total products processed: ${totalProcessed}`)
    console.log(`   - Successful: ${totalSuccessful}`)
    console.log(`   - Errors: ${errors.length}`)
    console.log(`   - API calls made: ${totalApiCalls}`)
    console.log(`   - Price records created: ${totalPriceRecords}`)

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total_processed: totalProcessed,
          successful: totalSuccessful,
          errors: errors.length,
          api_calls_used: totalApiCalls,
          price_records_created: totalPriceRecords
        },
        errors: errors.slice(0, 10) // Limit error details to prevent huge responses
      }, null, 2),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('💥 Comprehensive backfill failed:', error)
    
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

/**
 * Parse XML price history from AvantLink API response
 */
function parseXMLPriceHistory(xmlText: string): any[] {
  const priceHistory: any[] = []
  
  try {
    // Extract Table1 entries using regex
    const table1Regex = /<Table1>(.*?)<\/Table1>/gs
    let match
    
    while ((match = table1Regex.exec(xmlText)) !== null) {
      const tableContent = match[1]
      
      // Extract individual fields
      const dateMatch = tableContent.match(/<Date>(.*?)<\/Date>/)
      const retailPriceMatch = tableContent.match(/<Retail_Price>(.*?)<\/Retail_Price>/)
      const salePriceMatch = tableContent.match(/<Sale_Price>(.*?)<\/Sale_Price>/)
      
      if (dateMatch && retailPriceMatch && salePriceMatch) {
        const dateStr = dateMatch[1].trim()
        const retailPrice = parseFloat(retailPriceMatch[1].trim())
        const salePrice = parseFloat(salePriceMatch[1].trim())
        
        // Parse date (format: "2025-01-22 11:15:06" -> "2025-01-22")
        const recordedDate = dateStr.split(' ')[0]
        
        // Determine if it's a sale and calculate discount
        const isSale = salePrice < retailPrice
        const discountPercent = isSale ? Math.round(((retailPrice - salePrice) / retailPrice) * 100) : 0
        
        priceHistory.push({
          date: recordedDate,
          price: salePrice, // Use sale price as the actual price
          is_sale: isSale,
          discount_percent: discountPercent
        })
      }
    }
    
    // Sort by date (oldest first)
    priceHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
  } catch (error) {
    console.error('❌ Error parsing XML:', error)
  }
  
  return priceHistory
}
