
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const affiliateId = Deno.env.get('AVANTLINK_AFFILIATE_ID')
    const apiKey = Deno.env.get('AVANTLINK_API_KEY')

    if (!affiliateId || !apiKey) {
      throw new Error('Missing AvantLink API credentials')
    }

    // Parse request parameters
    let requestBody: any = {}
    if (req.method === 'POST') {
      try {
        requestBody = await req.json()
      } catch (error) {
        // Ignore JSON parse errors for GET requests
      }
    }

    const batchSize = requestBody.batch_size || 10
    const maxProducts = requestBody.max_products || null
    const resume = requestBody.resume !== false // Default to true
    const skipRecentHours = requestBody.skip_recent_hours || 24

    console.log(`🚀 Starting comprehensive price backfill with resume=${resume}, batch_size=${batchSize}`)

    // Initialize tracking table if resume is enabled
    if (resume) {
      console.log('📊 Populating SKU tracking table...')
      const { data: populateResult, error: populateError } = await supabaseClient
        .rpc('populate_sku_tracking')

      if (populateError) {
        console.error('❌ Failed to populate SKU tracking:', populateError)
      } else {
        console.log(`✅ Added ${populateResult?.[0]?.inserted_count || 0} new SKUs to tracking`)
      }

      // Cleanup stuck processing records
      const { data: cleanupResult, error: cleanupError } = await supabaseClient
        .rpc('cleanup_stuck_processing')

      if (cleanupError) {
        console.error('❌ Failed to cleanup stuck processing:', cleanupError)
      } else {
        console.log(`🧹 Reset ${cleanupResult?.[0]?.cleaned_count || 0} stuck processing records`)
      }
    }

    // Get progress overview
    const { data: progressData, error: progressError } = await supabaseClient
      .from('price_sync_progress')
      .select('*')
      .single()

    if (!progressError && progressData) {
      console.log(`📈 Sync Progress: ${progressData.completed}/${progressData.total_skus} completed (${progressData.completion_percentage}%)`)
      console.log(`📊 Status breakdown: Pending: ${progressData.pending}, Processing: ${progressData.processing}, Failed: ${progressData.failed}`)
    }

    let productsToProcess: any[] = []

    if (resume) {
      // Get pending SKUs from tracking table
      const { data: pendingSKUs, error: skuError } = await supabaseClient
        .from('sku_api_tracking')
        .select('sku, merchant_id, api_call_count, last_api_call')
        .eq('status', 'pending')
        .order('api_call_count', { ascending: true }) // Process SKUs with fewer attempts first
        .order('created_at', { ascending: true })
        .limit(batchSize)

      if (skuError) {
        throw new Error(`Failed to fetch pending SKUs: ${skuError.message}`)
      }

      if (!pendingSKUs || pendingSKUs.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'No pending SKUs found - all products have been processed',
            processed_products: 0,
            api_calls_used: 0,
            progress_data: progressData
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      // Get product details for the pending SKUs
      const skuList = pendingSKUs.map(item => item.sku)
      const { data: productData, error: productError } = await supabaseClient
        .from('products')
        .select('sku, merchant_id, name')
        .in('sku', skuList)

      if (productError) {
        throw new Error(`Failed to fetch product data: ${productError.message}`)
      }

      productsToProcess = productData || []
      console.log(`📦 Found ${productsToProcess.length} products to process from tracking system`)

    } else {
      // Legacy mode: get products directly from products table
      let query = supabaseClient
        .from('products')
        .select('sku, merchant_id, name, last_sync_date')
        .eq('merchant_id', 18557) // Only process TCC products
        .order('sku', { ascending: true })

      if (maxProducts) {
        query = query.limit(maxProducts)
      }

      const { data: productData, error: productError } = await query

      if (productError) {
        throw new Error(`Failed to fetch products: ${productError.message}`)
      }

      productsToProcess = productData || []
      console.log(`📦 Found ${productsToProcess.length} products to process (legacy mode)`)
    }

    if (productsToProcess.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No products found to process',
          processed_products: 0,
          api_calls_used: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    let totalApiCalls = 0
    let totalHistoryEntries = 0
    let processedProducts = 0
    let failedProducts = 0
    const startTime = Date.now()

    // Process each product
    for (const product of productsToProcess) {
      try {
        console.log(`🔄 Processing ${product.sku} (${product.name})`)

        // Mark as processing in tracking table (if using resume mode)
        if (resume) {
          await supabaseClient
            .from('sku_api_tracking')
            .update({
              status: 'processing',
              last_api_call: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('sku', product.sku)
            .eq('merchant_id', product.merchant_id)
        }

        // Build AvantLink API URL
        const apiUrl = new URL('https://classic.avantlink.com/api.php')
        apiUrl.searchParams.set('module', 'ProductPriceCheck')
        apiUrl.searchParams.set('affiliate_id', affiliateId)
        apiUrl.searchParams.set('merchant_id', product.merchant_id.toString())
        apiUrl.searchParams.set('sku', product.sku)
        apiUrl.searchParams.set('show_pricing_history', '1')
        apiUrl.searchParams.set('show_retail_price', '1')
        apiUrl.searchParams.set('output', 'xml')

        const response = await fetch(apiUrl.toString())
        totalApiCalls++

        if (!response.ok) {
          throw new Error(`AvantLink API error: ${response.status} ${response.statusText}`)
        }

        const xmlText = await response.text()
        console.log(`📥 XML Response preview for ${product.sku}:`, xmlText.substring(0, 200))

        // Parse XML to extract price history
        const priceHistoryData = parseAvantLinkXML(xmlText)
        
        if (priceHistoryData && priceHistoryData.length > 0) {
          const historyEntries: any[] = []
          
          for (const historyItem of priceHistoryData) {
            if (historyItem.sale_price && historyItem.date) {
              const salePrice = parseFloat(historyItem.sale_price)
              const retailPrice = parseFloat(historyItem.retail_price)
              const recordDate = new Date(historyItem.date).toISOString().split('T')[0]
              
              const isSale = salePrice < retailPrice
              const discountPercent = isSale 
                ? Math.round(((retailPrice - salePrice) / retailPrice) * 100)
                : 0

              historyEntries.push({
                product_sku: product.sku,
                merchant_id: product.merchant_id,
                price: salePrice,
                is_sale: isSale,
                discount_percent: discountPercent,
                recorded_date: recordDate
              })
            }
          }

          // Insert price history entries
          if (historyEntries.length > 0) {
            const uniqueEntries = new Map()
            historyEntries.forEach(entry => {
              const key = `${entry.product_sku}-${entry.merchant_id}-${entry.recorded_date}`
              if (!uniqueEntries.has(key) || entry.price < uniqueEntries.get(key).price) {
                uniqueEntries.set(key, entry)
              }
            })
            const deduplicatedEntries = Array.from(uniqueEntries.values())

            console.log(`📊 Deduplicated ${historyEntries.length} entries to ${deduplicatedEntries.length} unique entries for ${product.sku}`)

            // Insert deduplicated price history entries
            const { error: historyError } = await supabaseClient
              .from('price_history')
              .upsert(deduplicatedEntries, {
                onConflict: 'product_sku,merchant_id,recorded_date'
              })

            if (historyError) {
              console.error(`❌ Failed to insert price history for ${product.sku}:`, historyError.message)
              throw historyError
            }

            totalHistoryEntries += deduplicatedEntries.length
            console.log(`✅ Added ${deduplicatedEntries.length} price history entries for ${product.sku}`)
          }

          // Mark as completed in tracking table
          if (resume) {
            // Get current api_call_count
            const { data: currentTracking } = await supabaseClient
              .from('sku_api_tracking')
              .select('api_call_count')
              .eq('sku', product.sku)
              .eq('merchant_id', product.merchant_id)
              .single()

            await supabaseClient
              .from('sku_api_tracking')
              .update({
                status: 'completed',
                last_successful_call: new Date().toISOString(),
                api_call_count: (currentTracking?.api_call_count || 0) + 1,
                updated_at: new Date().toISOString()
              })
              .eq('sku', product.sku)
              .eq('merchant_id', product.merchant_id)
          }

          processedProducts++

        } else {
          console.log(`ℹ️  No pricing history available for ${product.sku}`)
          
          // Mark as no_data in tracking table
          if (resume) {
            // Get current api_call_count
            const { data: currentTracking } = await supabaseClient
              .from('sku_api_tracking')
              .select('api_call_count')
              .eq('sku', product.sku)
              .eq('merchant_id', product.merchant_id)
              .single()

            await supabaseClient
              .from('sku_api_tracking')
              .update({
                status: 'no_data',
                last_successful_call: new Date().toISOString(),
                api_call_count: (currentTracking?.api_call_count || 0) + 1,
                updated_at: new Date().toISOString()
              })
              .eq('sku', product.sku)
              .eq('merchant_id', product.merchant_id)
          }

          processedProducts++
        }

        // Rate limiting: delay between requests
        await new Promise(resolve => setTimeout(resolve, 200))

      } catch (error) {
        console.error(`❌ Error processing ${product.sku}:`, error)
        
        // Mark as failed in tracking table
        if (resume) {
          // Get current api_call_count
          const { data: currentTracking } = await supabaseClient
            .from('sku_api_tracking')
            .select('api_call_count')
            .eq('sku', product.sku)
            .eq('merchant_id', product.merchant_id)
            .single()

          await supabaseClient
            .from('sku_api_tracking')
            .update({
              status: 'failed',
              error_message: error.message,
              api_call_count: (currentTracking?.api_call_count || 0) + 1,
              updated_at: new Date().toISOString()
            })
            .eq('sku', product.sku)
            .eq('merchant_id', product.merchant_id)
        }

        failedProducts++
      }
    }

    const processingTime = Date.now() - startTime

    // Get final progress overview
    const { data: finalProgressData } = await supabaseClient
      .from('price_sync_progress')
      .select('*')
      .single()

    return new Response(
      JSON.stringify({
        success: true,
        processed_products: processedProducts,
        failed_products: failedProducts,
        price_history_entries: totalHistoryEntries,
        api_calls_used: totalApiCalls,
        processing_time_ms: processingTime,
        avg_time_per_product_ms: Math.round(processingTime / Math.max(1, processedProducts)),
        progress_data: finalProgressData,
        resume_enabled: resume
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('💥 Comprehensive price backfill error:', error)
    
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

// XML parsing function for AvantLink ProductPriceCheck response
function parseAvantLinkXML(xmlText: string): Array<{date: string, retail_price: string, sale_price: string}> {
  try {
    const priceHistory: Array<{date: string, retail_price: string, sale_price: string}> = []
    
    // Basic XML parsing - look for Table1 entries
    const table1Regex = /<Table1>(.*?)<\/Table1>/gs
    let match
    
    while ((match = table1Regex.exec(xmlText)) !== null) {
      const tableContent = match[1]
      
      // Extract date, retail_price, and sale_price
      const dateMatch = tableContent.match(/<Date>(.*?)<\/Date>/)
      const retailPriceMatch = tableContent.match(/<Retail_Price>(.*?)<\/Retail_Price>/)
      const salePriceMatch = tableContent.match(/<Sale_Price>(.*?)<\/Sale_Price>/)
      
      if (dateMatch && retailPriceMatch && salePriceMatch) {
        priceHistory.push({
          date: dateMatch[1].trim(),
          retail_price: retailPriceMatch[1].trim(),
          sale_price: salePriceMatch[1].trim()
        })
      }
    }
    
    console.log(`📊 Parsed ${priceHistory.length} price history entries from XML`)
    return priceHistory
  } catch (error) {
    console.error('❌ Error parsing XML:', error)
    return []
  }
}
