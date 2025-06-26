import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AvantLinkProduct {
  "Product SKU": string
  "Merchant Id": string
  "Merchant Name": string
  "Product Name": string
  "Brand Name"?: string
  "Sale Price"?: string
  "Retail Price"?: string
  "Price Discount Percent"?: string
  "Price Discount Amount"?: string
  "Thumbnail Image"?: string
  "Buy URL"?: string
  "Description"?: string
  "Category Name"?: string
  "Subcategory Name"?: string
}

interface TransformedProduct {
  sku: string
  merchant_id: number
  merchant_name: string
  name: string
  brand_name?: string
  sale_price?: number
  retail_price?: number
  discount_percent?: number
  discount_amount?: number
  image_url?: string
  buy_url?: string
  description?: string
  category?: string
  subcategory?: string
  sync_priority: number
  availability_score: number
}

interface SyncOptions {
  merchants?: number[]
  categories?: string[]
  includeNonSaleItems?: boolean
  maxProductsPerMerchant?: number
  syncType?: 'full_catalog' | 'favorites_only' | 'price_history_backfill'
}

// Extended merchant list for outdoor equipment
const DEFAULT_MERCHANTS = [
  9272,   // MEC Mountain Equipment Company Ltd
  18557,  // Mountain Equipment Coop
  31349,  // Climb On Equipment (if valid)
  // Add more merchants as needed
]

// Popular outdoor categories to prioritize
const PRIORITY_CATEGORIES = [
  'Outdoor Recreation',
  'Sports & Recreation', 
  'Clothing',
  'Footwear',
  'Exercise & Fitness'
]

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body for sync options
    let syncOptions: SyncOptions = {}
    if (req.method === 'POST') {
      try {
        syncOptions = await req.json()
      } catch {
        // Use defaults if no valid JSON body
      }
    }

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

    // Determine sync configuration
    const targetMerchants = syncOptions.merchants || DEFAULT_MERCHANTS
    const includeNonSale = syncOptions.includeNonSaleItems ?? true
    const maxPerMerchant = syncOptions.maxProductsPerMerchant || 1000
    const syncType = syncOptions.syncType || 'full_catalog'

    // Create sync job record
    const { data: syncJob, error: syncJobError } = await supabaseClient
      .from('sync_jobs')
      .insert({
        job_type: 'daily_products',
        job_subtype: syncType,
        status: 'running',
        merchant_ids: targetMerchants,
        categories_synced: syncOptions.categories || []
      })
      .select()
      .single()

    if (syncJobError) {
      throw new Error(`Failed to create sync job: ${syncJobError.message}`)
    }

    let totalRecords = 0
    let totalApiCalls = 0
    let productsAdded = 0
    let productsUpdated = 0
    let priceHistoryEntries = 0
    const allProducts: TransformedProduct[] = []
    const startTime = Date.now()

    // Sync products for each target merchant
    for (const merchantId of targetMerchants) {
      console.log(`Starting full catalog sync for merchant ${merchantId}`)
      
      try {
        // Multiple API calls to get different product segments
        const searchQueries = [
          '*', // All products
          'climbing', // Climbing gear
          'hiking', // Hiking equipment
          'camping', // Camping gear
          'outdoor', // General outdoor
        ]

        for (const searchTerm of searchQueries) {
          let currentBase = 0
          let hasMoreResults = true
          
          while (hasMoreResults && allProducts.length < maxPerMerchant) {
            // Build AvantLink API URL
            const apiUrl = new URL('https://classic.avantlink.com/api.php')
            apiUrl.searchParams.set('module', 'ProductSearch')
            apiUrl.searchParams.set('affiliate_id', affiliateId)
            apiUrl.searchParams.set('website_id', websiteId)
            apiUrl.searchParams.set('search_term', searchTerm)
            apiUrl.searchParams.set('merchant_ids', merchantId.toString())
            
            // Include all products or just sale items
            if (!includeNonSale) {
              apiUrl.searchParams.set('search_on_sale_only', '1')
            }
            
            apiUrl.searchParams.set('search_results_count', '200') // Max per call
            apiUrl.searchParams.set('search_results_base', currentBase.toString())
            apiUrl.searchParams.set('output', 'json')
            apiUrl.searchParams.set('search_results_fields', 
              'Product SKU|Merchant Id|Merchant Name|Product Name|Brand Name|Sale Price|Retail Price|Price Discount Percent|Price Discount Amount|Thumbnail Image|Buy URL|Description|Category Name|Subcategory Name'
            )

            // Add category filter if specified
            if (syncOptions.categories && syncOptions.categories.length > 0) {
              apiUrl.searchParams.set('search_category', syncOptions.categories.join('|'))
            }

            const response = await fetch(apiUrl.toString())
            totalApiCalls++

            if (!response.ok) {
              console.error(`AvantLink API error: ${response.status} ${response.statusText}`)
              hasMoreResults = false
              continue
            }

            const data = await response.json()
            
            if (data && Array.isArray(data) && data.length > 0) {
              const transformedProducts = data
                .map(product => transformProduct(product, searchTerm))
                .filter(Boolean) as TransformedProduct[]
              
              // Remove duplicates based on SKU + merchant combination
              const uniqueProducts = transformedProducts.filter(product => 
                !allProducts.some(existing => 
                  existing.sku === product.sku && existing.merchant_id === product.merchant_id
                )
              )
              
              allProducts.push(...uniqueProducts)
              totalRecords += uniqueProducts.length
              
              console.log(`Fetched ${uniqueProducts.length} unique products (${data.length} total) from merchant ${merchantId}, search "${searchTerm}", base ${currentBase}`)
              
              // Check if we got fewer results than requested (end of results)
              if (data.length < 200) {
                hasMoreResults = false
              } else {
                currentBase += 200
              }
              
              // Rate limiting: small delay between requests
              await new Promise(resolve => setTimeout(resolve, 100))
              
            } else {
              hasMoreResults = false
            }
            
            // Safety check to prevent infinite loops
            if (currentBase > 5000) {
              console.log(`Reached safety limit for merchant ${merchantId}, search "${searchTerm}"`)
              hasMoreResults = false
            }
          }
        }

      } catch (error) {
        console.error(`Error syncing merchant ${merchantId}:`, error)
        // Continue with other merchants even if one fails
      }
    }

    console.log(`Total unique products collected: ${allProducts.length}`)

    // Batch insert products to Supabase
    if (allProducts.length > 0) {
      // Check for existing products to determine adds vs updates
      const existingProducts = await supabaseClient
        .from('products')
        .select('sku, merchant_id')
        .in('sku', allProducts.map(p => p.sku))

      const existingSkuMerchantPairs = new Set(
        existingProducts.data?.map(p => `${p.sku}-${p.merchant_id}`) || []
      )

      productsAdded = allProducts.filter(p => 
        !existingSkuMerchantPairs.has(`${p.sku}-${p.merchant_id}`)
      ).length
      productsUpdated = allProducts.length - productsAdded

      const { error: insertError } = await supabaseClient
        .from('products')
        .upsert(allProducts, {
          onConflict: 'sku,merchant_id,last_sync_date'
        })

      if (insertError) {
        throw new Error(`Failed to insert products: ${insertError.message}`)
      }

      // Create comprehensive price history records
      const priceHistoryRecords = allProducts
        .filter(p => p.sale_price || p.retail_price)
        .map(p => ({
          product_sku: p.sku,
          merchant_id: p.merchant_id,
          price: p.sale_price || p.retail_price!,
          is_sale: !!(p.sale_price && p.retail_price && p.sale_price < p.retail_price),
          discount_percent: p.discount_percent || 0,
          price_change_reason: 'initial_tracking' as const,
          data_source: 'ProductSearch' as const
        }))

      if (priceHistoryRecords.length > 0) {
        const { error: historyError } = await supabaseClient
          .from('price_history')
          .upsert(priceHistoryRecords, {
            onConflict: 'product_sku,merchant_id,recorded_date'
          })

        if (historyError) {
          console.error('Failed to insert price history:', historyError.message)
          // Don't fail the entire job for history errors
        } else {
          priceHistoryEntries = priceHistoryRecords.length
        }
      }

      // Add high-priority products to sync queue for detailed price history
      const priorityProducts = allProducts
        .filter(p => 
          p.sync_priority <= 2 || // High priority items
          PRIORITY_CATEGORIES.some(cat => p.category?.includes(cat)) ||
          (p.discount_percent && p.discount_percent > 30) // Great deals
        )
        .slice(0, 50) // Limit to prevent API overuse

      if (priorityProducts.length > 0) {
        const queueItems = priorityProducts.map(p => ({
          product_sku: p.sku,
          merchant_id: p.merchant_id,
          sync_type: 'full_history' as const,
          priority: p.sync_priority,
          scheduled_for: new Date(Date.now() + Math.random() * 3600000).toISOString() // Random delay up to 1 hour
        }))

        await supabaseClient
          .from('sync_queue')
          .upsert(queueItems, {
            onConflict: 'product_sku,merchant_id,sync_type,status'
          })
      }
    }

    const processingTime = Date.now() - startTime

    // Update sync job as completed
    await supabaseClient
      .from('sync_jobs')
      .update({
        status: 'completed',
        records_processed: totalRecords,
        api_calls_used: totalApiCalls,
        products_added: productsAdded,
        products_updated: productsUpdated,
        price_history_entries: priceHistoryEntries,
        avg_processing_time_ms: Math.round(processingTime / totalApiCalls),
        completed_at: new Date().toISOString()
      })
      .eq('id', syncJob.id)

    return new Response(
      JSON.stringify({
        success: true,
        sync_type: syncType,
        records_processed: totalRecords,
        products_added: productsAdded,
        products_updated: productsUpdated,
        price_history_entries: priceHistoryEntries,
        api_calls_used: totalApiCalls,
        merchants_synced: targetMerchants,
        processing_time_ms: processingTime,
        avg_time_per_call_ms: Math.round(processingTime / totalApiCalls)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Full catalog sync error:', error)
    
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

function transformProduct(product: AvantLinkProduct, searchContext: string): TransformedProduct | null {
  if (!product["Product SKU"] || !product["Merchant Id"]) {
    return null
  }

  // Calculate sync priority based on product characteristics
  let syncPriority = 3 // Default medium priority
  
  // Higher priority for sale items
  const isOnSale = product["Sale Price"] && product["Retail Price"] && 
    parseFloat(product["Sale Price"]) < parseFloat(product["Retail Price"])
  if (isOnSale) syncPriority = Math.max(1, syncPriority - 1)
  
  // Higher priority for climbing/outdoor categories
  const category = product["Category Name"] || ''
  if (PRIORITY_CATEGORIES.some(cat => category.includes(cat))) {
    syncPriority = Math.max(1, syncPriority - 1)
  }
  
  // Higher priority if found by specific search terms
  if (['climbing', 'hiking', 'camping'].includes(searchContext)) {
    syncPriority = Math.max(1, syncPriority - 1)
  }

  // Calculate availability score (assume available unless we have evidence otherwise)
  let availabilityScore = 1.0
  
  // Lower availability for very old or very cheap items (might be clearance)
  const salePrice = product["Sale Price"] ? parseFloat(product["Sale Price"]) : null
  if (salePrice && salePrice < 10) {
    availabilityScore = 0.8
  }

  return {
    sku: product["Product SKU"],
    merchant_id: parseInt(product["Merchant Id"]),
    merchant_name: product["Merchant Name"] || '',
    name: product["Product Name"] || '',
    brand_name: product["Brand Name"] || null,
    sale_price: salePrice,
    retail_price: product["Retail Price"] ? parseFloat(product["Retail Price"]) : null,
    discount_percent: product["Price Discount Percent"] ? parseInt(product["Price Discount Percent"]) : null,
    discount_amount: product["Price Discount Amount"] ? parseFloat(product["Price Discount Amount"]) : null,
    image_url: product["Thumbnail Image"] || null,
    buy_url: product["Buy URL"] || null,
    description: product["Description"] || null,
    category: product["Category Name"] || null,
    subcategory: product["Subcategory Name"] || null,
    sync_priority: syncPriority,
    availability_score: availabilityScore
  }
}