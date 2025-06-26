import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AvantLinkPriceCheckResponse {
  pricing_history?: Array<{
    price: string
    date: string
    is_sale?: string
  }>
  current_price?: string
  retail_price?: string
  is_on_sale?: string
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

interface SyncQueueItem {
  id: string
  product_sku: string
  merchant_id: number
  sync_type: string
  priority: number
  requested_by_user_id?: string
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

    // AvantLink API credentials
    const affiliateId = Deno.env.get('AVANTLINK_AFFILIATE_ID')
    const apiKey = Deno.env.get('AVANTLINK_API_KEY')
    const websiteId = Deno.env.get('AVANTLINK_WEBSITE_ID')

    if (!affiliateId || !apiKey || !websiteId) {
      throw new Error('Missing AvantLink API credentials')
    }

    // Parse request parameters
    const url = new URL(req.url)
    const batchSize = parseInt(url.searchParams.get('batch_size') || '10')
    const maxApiCalls = parseInt(url.searchParams.get('max_api_calls') || '100')

    // Create sync job record
    const { data: syncJob, error: syncJobError } = await supabaseClient
      .from('sync_jobs')
      .insert({
        job_type: 'price_history',
        job_subtype: 'historical_price_backfill',
        status: 'running'
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
    const startTime = Date.now()

    // Get pending items from sync queue, prioritized by user requests and priority
    const { data: queueItems, error: queueError } = await supabaseClient
      .from('sync_queue')
      .select('*')
      .eq('status', 'pending')
      .in('sync_type', ['full_history', 'price_check'])
      .order('priority', { ascending: true })
      .order('requested_by_user_id', { ascending: false, nullsFirst: false })
      .limit(batchSize)

    if (queueError) {
      throw new Error(`Failed to fetch sync queue: ${queueError.message}`)
    }

    if (!queueItems || queueItems.length === 0) {
      // No items in queue, let's add some high-priority products
      await addPriorityProductsToQueue(supabaseClient)
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No items in sync queue, added priority products for next run',
          processed_products: 0,
          api_calls_used: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    console.log(`Processing ${queueItems.length} items from sync queue`)

    // Process each item in the queue
    for (const item of queueItems as SyncQueueItem[]) {
      if (totalApiCalls >= maxApiCalls) {
        console.log(`Reached API call limit of ${maxApiCalls}`)
        break
      }

      try {
        // Mark item as processing
        await supabaseClient
          .from('sync_queue')
          .update({ status: 'processing', processed_at: new Date().toISOString() })
          .eq('id', item.id)

        console.log(`Processing price history for SKU: ${item.product_sku}, Merchant: ${item.merchant_id}`)

        // Build AvantLink ProductPriceCheck API URL
        const apiUrl = new URL('https://classic.avantlink.com/api.php')
        apiUrl.searchParams.set('module', 'ProductPriceCheck')
        apiUrl.searchParams.set('affiliate_id', affiliateId)
        apiUrl.searchParams.set('merchant_id', item.merchant_id.toString())
        apiUrl.searchParams.set('sku', item.product_sku)
        apiUrl.searchParams.set('show_pricing_history', 'true')
        apiUrl.searchParams.set('show_retail_price', 'true')
        apiUrl.searchParams.set('output', 'json')

        const response = await fetch(apiUrl.toString())
        totalApiCalls++

        if (!response.ok) {
          throw new Error(`AvantLink API error: ${response.status} ${response.statusText}`)
        }

        const data: AvantLinkPriceCheckResponse = await response.json()
        
        if (data && data.pricing_history && Array.isArray(data.pricing_history)) {
          const historyEntries: PriceHistoryEntry[] = []
          
          // Process historical pricing data
          for (const historyItem of data.pricing_history) {
            if (historyItem.price && historyItem.date) {
              const price = parseFloat(historyItem.price)
              const recordDate = new Date(historyItem.date).toISOString().split('T')[0]
              
              // Determine if it was a sale based on retail price comparison
              let isSale = false
              let discountPercent = 0
              
              if (data.retail_price && price < parseFloat(data.retail_price)) {
                isSale = true
                discountPercent = Math.round(((parseFloat(data.retail_price) - price) / parseFloat(data.retail_price)) * 100)
              }

              historyEntries.push({
                product_sku: item.product_sku,
                merchant_id: item.merchant_id,
                price: price,
                is_sale: isSale,
                discount_percent: discountPercent,
                recorded_date: recordDate,
                price_change_reason: 'historical_sync',
                data_source: 'ProductPriceCheck'
              })
            }
          }

          // Add current price if available and not already in history
          if (data.current_price) {
            const currentPrice = parseFloat(data.current_price)
            const today = new Date().toISOString().split('T')[0]
            
            // Check if we already have today's price
            const hasTodayPrice = historyEntries.some(entry => entry.recorded_date === today)
            
            if (!hasTodayPrice) {
              let isSale = false
              let discountPercent = 0
              
              if (data.retail_price && currentPrice < parseFloat(data.retail_price)) {
                isSale = true
                discountPercent = Math.round(((parseFloat(data.retail_price) - currentPrice) / parseFloat(data.retail_price)) * 100)
              }

              historyEntries.push({
                product_sku: item.product_sku,
                merchant_id: item.merchant_id,
                price: currentPrice,
                is_sale: isSale,
                discount_percent: discountPercent,
                recorded_date: today,
                price_change_reason: 'current_price_sync',
                data_source: 'ProductPriceCheck'
              })
            }
          }

          // Insert price history entries
          if (historyEntries.length > 0) {
            const { error: historyError } = await supabaseClient
              .from('price_history')
              .upsert(historyEntries, {
                onConflict: 'product_sku,merchant_id,recorded_date'
              })

            if (historyError) {
              console.error(`Failed to insert price history for ${item.product_sku}:`, historyError.message)
              throw historyError
            }

            totalHistoryEntries += historyEntries.length
            console.log(`Added ${historyEntries.length} price history entries for ${item.product_sku}`)
          }

          // Update product with enhanced metadata
          await supabaseClient
            .from('products')
            .update({
              sync_priority: Math.max(1, item.priority - 1), // Increase priority for successfully synced items
              availability_score: data.current_price ? 1.0 : 0.5 // Lower if no current price available
            })
            .eq('sku', item.product_sku)
            .eq('merchant_id', item.merchant_id)

          // Mark queue item as completed
          await supabaseClient
            .from('sync_queue')
            .update({
              status: 'completed',
              api_calls_used: 1,
              processed_at: new Date().toISOString()
            })
            .eq('id', item.id)

          processedProducts++

        } else {
          // No pricing history available
          console.log(`No pricing history available for ${item.product_sku}`)
          
          await supabaseClient
            .from('sync_queue')
            .update({
              status: 'completed',
              api_calls_used: 1,
              error_message: 'No pricing history available',
              processed_at: new Date().toISOString()
            })
            .eq('id', item.id)

          processedProducts++
        }

        // Rate limiting: delay between requests
        await new Promise(resolve => setTimeout(resolve, 200))

      } catch (error) {
        console.error(`Error processing ${item.product_sku}:`, error)
        
        // Mark item as failed
        await supabaseClient
          .from('sync_queue')
          .update({
            status: 'failed',
            error_message: error.message,
            api_calls_used: totalApiCalls > 0 ? 1 : 0,
            processed_at: new Date().toISOString()
          })
          .eq('id', item.id)

        failedProducts++
      }
    }

    const processingTime = Date.now() - startTime

    // Update sync job as completed
    await supabaseClient
      .from('sync_jobs')
      .update({
        status: 'completed',
        records_processed: processedProducts,
        api_calls_used: totalApiCalls,
        price_history_entries: totalHistoryEntries,
        avg_processing_time_ms: Math.round(processingTime / Math.max(1, totalApiCalls)),
        completed_at: new Date().toISOString()
      })
      .eq('id', syncJob.id)

    return new Response(
      JSON.stringify({
        success: true,
        processed_products: processedProducts,
        failed_products: failedProducts,
        price_history_entries: totalHistoryEntries,
        api_calls_used: totalApiCalls,
        processing_time_ms: processingTime,
        avg_time_per_product_ms: Math.round(processingTime / Math.max(1, processedProducts))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Price history sync error:', error)
    
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

// Helper function to add priority products to sync queue
async function addPriorityProductsToQueue(supabaseClient: any) {
  try {
    // Get high-priority products that need price history
    const { data: products } = await supabaseClient
      .from('products')
      .select('sku, merchant_id, sync_priority, discount_percent')
      .eq('last_sync_date', new Date().toISOString().split('T')[0])
      .or('sync_priority.lte.2,discount_percent.gte.30')
      .limit(50)

    if (products && products.length > 0) {
      const queueItems = products.map((product: any) => ({
        product_sku: product.sku,
        merchant_id: product.merchant_id,
        sync_type: 'full_history',
        priority: product.sync_priority || 3,
        scheduled_for: new Date(Date.now() + Math.random() * 1800000).toISOString() // Random delay up to 30 minutes
      }))

      await supabaseClient
        .from('sync_queue')
        .upsert(queueItems, {
          onConflict: 'product_sku,merchant_id,sync_type,status'
        })

      console.log(`Added ${queueItems.length} priority products to sync queue`)
    }
  } catch (error) {
    console.error('Error adding priority products to queue:', error)
  }
}