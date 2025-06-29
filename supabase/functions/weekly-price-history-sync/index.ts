import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PriceHistoryEntry {
  product_sku: string
  merchant_id: number
  price: number
  is_sale: boolean
  discount_percent?: number
  recorded_date: string
  price_change_reason?: string
  data_source: string
}

interface Product {
  sku: string
  merchant_id: number
  sync_priority?: number
  discount_percent?: number
  last_sync_date: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()
  
  try {
    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // AvantLink API credentials
    const affiliateId = Deno.env.get('AVANTLINK_AFFILIATE_ID')
    const apiKey = Deno.env.get('AVANTLINK_API_KEY')
    const websiteId = Deno.env.get('AVANTLINK_WEBSITE_ID')

    if (!affiliateId || !apiKey || !websiteId) {
      throw new Error('Missing AvantLink API credentials')
    }

    // Parse request parameters for batch configuration
    const url = new URL(req.url)
    const batchSize = parseInt(url.searchParams.get('batch_size') || '50')
    const maxApiCalls = parseInt(url.searchParams.get('max_api_calls') || '200')

    // Create sync job record with enhanced tracking
    const { data: syncJob, error: syncJobError } = await supabaseClient
      .from('sync_jobs')
      .insert({
        job_type: 'price_history',
        job_subtype: 'weekly_historical_update',
        status: 'running',
        scheduled_time: new Date().toISOString()
      })
      .select()
      .single()

    if (syncJobError) {
      throw new Error(`Failed to create sync job: ${syncJobError.message}`)
    }

    let totalApiCalls = 0
    let totalHistoryEntries = 0
    let processedProducts = 0
    let failedProducts = 0

    console.log(`Starting weekly price history sync with batch size ${batchSize}, max API calls ${maxApiCalls}`)

    // Get priority products for price history tracking
    // Focus on: recent products, high-priority items, products with significant discounts
    const { data: priorityProducts, error: productsError } = await supabaseClient
      .from('products')
      .select('sku, merchant_id, sync_priority, discount_percent, last_sync_date')
      .or(`
        sync_priority.lte.2,
        discount_percent.gte.25,
        last_sync_date.gte.${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
      `)
      .order('sync_priority', { ascending: true })
      .order('discount_percent', { ascending: false })
      .limit(batchSize)

    if (productsError) {
      throw new Error(`Failed to fetch priority products: ${productsError.message}`)
    }

    if (!priorityProducts || priorityProducts.length === 0) {
      console.log('No priority products found for price history sync')
      
      // Update sync job as completed with no work
      await supabaseClient
        .from('sync_jobs')
        .update({
          status: 'completed',
          records_processed: 0,
          api_calls_used: 0,
          price_history_entries: 0,
          last_run_duration_ms: Date.now() - startTime,
          completed_at: new Date().toISOString()
        })
        .eq('id', syncJob.id)

      return new Response(
        JSON.stringify({
          success: true,
          job_type: 'price_history',
          message: 'No priority products found for price history sync',
          processed_products: 0,
          api_calls_used: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    console.log(`Processing price history for ${priorityProducts.length} priority products`)

    // Process each priority product for detailed price history
    for (const product of priorityProducts as Product[]) {
      if (totalApiCalls >= maxApiCalls) {
        console.log(`Reached API call limit of ${maxApiCalls}`)
        break
      }

      try {
        console.log(`Processing price history for SKU: ${product.sku}, Merchant: ${product.merchant_id}`)

        // Build AvantLink ProductPriceCheck API URL for detailed price history
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
        
        // Parse XML to extract price history
        const priceHistoryData = parseAvantLinkXML(xmlText)
        
        if (priceHistoryData && priceHistoryData.length > 0) {
          const historyEntries: PriceHistoryEntry[] = []
          
          // Process historical pricing data
          for (const historyItem of priceHistoryData) {
            if (historyItem.sale_price && historyItem.date) {
              const salePrice = parseFloat(historyItem.sale_price)
              const retailPrice = parseFloat(historyItem.retail_price || historyItem.sale_price)
              const recordDate = new Date(historyItem.date).toISOString().split('T')[0]
              
              // Skip if date is invalid or too old (older than 1 year)
              const recordDateTime = new Date(recordDate)
              const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
              if (isNaN(recordDateTime.getTime()) || recordDateTime < oneYearAgo) {
                continue
              }
              
              // Determine if it was a sale based on retail vs sale price comparison
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
                recorded_date: recordDate,
                price_change_reason: 'weekly_historical_sync',
                data_source: 'ProductPriceCheck'
              })
            }
          }

          // Insert price history entries (avoid duplicates)
          if (historyEntries.length > 0) {
            const { error: historyError } = await supabaseClient
              .from('price_history')
              .upsert(historyEntries, {
                onConflict: 'product_sku,merchant_id,recorded_date'
              })

            if (historyError) {
              console.error(`Failed to insert price history for ${product.sku}:`, historyError.message)
              throw historyError
            }

            totalHistoryEntries += historyEntries.length
            console.log(`Added ${historyEntries.length} price history entries for ${product.sku}`)
          }

          processedProducts++

        } else {
          // No pricing history available
          console.log(`No pricing history available for ${product.sku}`)
          processedProducts++
        }

        // Rate limiting: delay between requests to respect API limits
        await new Promise(resolve => setTimeout(resolve, 250))

      } catch (error) {
        console.error(`Error processing ${product.sku}:`, error)
        failedProducts++
      }
    }

    const processingTime = Date.now() - startTime

    // Update sync job as completed with enhanced metrics
    await supabaseClient
      .from('sync_jobs')
      .update({
        status: 'completed',
        records_processed: processedProducts,
        api_calls_used: totalApiCalls,
        price_history_entries: totalHistoryEntries,
        last_run_duration_ms: processingTime,
        avg_processing_time_ms: Math.round(processingTime / Math.max(1, totalApiCalls)),
        success_rate: totalApiCalls > 0 ? Math.round(((processedProducts) / (processedProducts + failedProducts)) * 100) : 100.0,
        completed_at: new Date().toISOString()
      })
      .eq('id', syncJob.id)

    console.log(`Weekly price history sync completed successfully in ${processingTime}ms`)

    return new Response(
      JSON.stringify({
        success: true,
        job_type: 'price_history',
        processed_products: processedProducts,
        failed_products: failedProducts,
        price_history_entries: totalHistoryEntries,
        api_calls_used: totalApiCalls,
        processing_time_ms: processingTime,
        avg_time_per_product_ms: Math.round(processingTime / Math.max(1, processedProducts)),
        sync_focus: 'priority_products_historical'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Weekly price history sync error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        job_type: 'price_history',
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
      
      if (dateMatch && (retailPriceMatch || salePriceMatch)) {
        priceHistory.push({
          date: dateMatch[1].trim(),
          retail_price: retailPriceMatch ? retailPriceMatch[1].trim() : (salePriceMatch ? salePriceMatch[1].trim() : '0'),
          sale_price: salePriceMatch ? salePriceMatch[1].trim() : (retailPriceMatch ? retailPriceMatch[1].trim() : '0')
        })
      }
    }
    
    console.log(`Parsed ${priceHistory.length} price history entries from XML`)
    return priceHistory
  } catch (error) {
    console.error('Error parsing XML:', error)
    return []
  }
}