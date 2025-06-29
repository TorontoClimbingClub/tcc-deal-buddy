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
  "Medium Image"?: string
  "Large Image"?: string
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

// Comprehensive merchant list for weekly catalog sync
const TARGET_MERCHANTS = [
  9272,   // MEC Mountain Equipment Company Ltd
  18557,  // Mountain Equipment Coop
]

// Categories to target for comprehensive catalog coverage
const TARGET_CATEGORIES = [
  'Outdoor Recreation',
  'Sports & Recreation', 
  'Clothing',
  'Footwear',
  'Exercise & Fitness',
  'Camping',
  'Hiking',
  'Climbing',
  'Water Sports',
  'Winter Sports'
]

// Search terms for comprehensive product discovery
const SEARCH_TERMS = [
  '*',           // All products (primary)
  'outdoor',     // General outdoor
  'climbing',    // Climbing gear
  'hiking',      // Hiking equipment
  'camping',     // Camping gear
  'backpack',    // Backpacks and bags
  'jacket',      // Clothing
  'boots',       // Footwear
  'equipment',   // General equipment
]

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

    // Create sync job record with enhanced tracking
    const { data: syncJob, error: syncJobError } = await supabaseClient
      .from('sync_jobs')
      .insert({
        job_type: 'weekly_catalog',
        job_subtype: 'comprehensive_catalog',
        status: 'running',
        scheduled_time: new Date().toISOString(),
        merchant_ids: TARGET_MERCHANTS,
        categories_synced: TARGET_CATEGORIES
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

    console.log(`Starting weekly catalog sync for ${TARGET_MERCHANTS.length} merchants with ${SEARCH_TERMS.length} search terms`)

    // Comprehensive sync for each merchant and search term combination
    for (const merchantId of TARGET_MERCHANTS) {
      console.log(`Starting comprehensive catalog sync for merchant ${merchantId}`)
      
      for (const searchTerm of SEARCH_TERMS) {
        try {
          let currentBase = 0
          let hasMoreResults = true
          
          // Paginate through results for this search term
          while (hasMoreResults && allProducts.length < 10000) { // Safety limit
            console.log(`Fetching merchant ${merchantId}, search "${searchTerm}", page ${Math.floor(currentBase/200) + 1}`)
            
            // Build AvantLink API URL for comprehensive catalog
            const apiUrl = new URL('https://classic.avantlink.com/api.php')
            apiUrl.searchParams.set('module', 'ProductSearch')
            apiUrl.searchParams.set('affiliate_id', affiliateId)
            apiUrl.searchParams.set('website_id', websiteId)
            apiUrl.searchParams.set('search_term', searchTerm)
            apiUrl.searchParams.set('merchant_ids', merchantId.toString())
            // NOTE: No search_on_sale_only parameter - we want ALL products
            apiUrl.searchParams.set('search_results_count', '200')
            apiUrl.searchParams.set('search_results_base', currentBase.toString())
            apiUrl.searchParams.set('output', 'json')
            apiUrl.searchParams.set('search_results_fields', 
              'Product SKU|Merchant Id|Merchant Name|Product Name|Brand Name|Sale Price|Retail Price|Price Discount Percent|Price Discount Amount|Thumbnail Image|Medium Image|Large Image|Buy URL|Description|Category Name|Subcategory Name'
            )

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
              
              console.log(`Added ${uniqueProducts.length} unique products (${data.length} total)`)
              
              // Check if we got fewer results than requested (end of results)
              if (data.length < 200) {
                hasMoreResults = false
              } else {
                currentBase += 200
              }
              
              // Rate limiting: delay between requests
              await new Promise(resolve => setTimeout(resolve, 150))
              
            } else {
              hasMoreResults = false
            }
            
            // Safety check to prevent infinite loops
            if (currentBase > 5000) {
              console.log(`Reached safety limit for merchant ${merchantId}, search "${searchTerm}"`)
              hasMoreResults = false
            }
          }

        } catch (error) {
          console.error(`Error syncing merchant ${merchantId}, search "${searchTerm}":`, error)
          // Continue with next search term
        }
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

      // Batch upsert in chunks of 1000 to avoid timeouts
      const batchSize = 1000
      for (let i = 0; i < allProducts.length; i += batchSize) {
        const batch = allProducts.slice(i, i + batchSize)
        
        const { error: insertError } = await supabaseClient
          .from('products')
          .upsert(batch, {
            onConflict: 'sku,merchant_id'
          })

        if (insertError) {
          throw new Error(`Failed to insert products batch ${i}: ${insertError.message}`)
        }

        console.log(`Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allProducts.length/batchSize)}`)
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
          price_change_reason: 'weekly_catalog_sync',
          data_source: 'weekly_catalog_sync'
        }))

      if (priceHistoryRecords.length > 0) {
        // Batch insert price history in chunks
        for (let i = 0; i < priceHistoryRecords.length; i += batchSize) {
          const batch = priceHistoryRecords.slice(i, i + batchSize)
          
          const { error: historyError } = await supabaseClient
            .from('price_history')
            .upsert(batch, {
              onConflict: 'product_sku,merchant_id,recorded_date'
            })

          if (historyError) {
            console.error(`Failed to insert price history batch ${i}:`, historyError.message)
            // Don't fail the entire job for history errors
          } else {
            priceHistoryEntries += batch.length
          }
        }
      }
    }

    const processingTime = Date.now() - startTime

    // Update sync job as completed with enhanced metrics
    await supabaseClient
      .from('sync_jobs')
      .update({
        status: 'completed',
        records_processed: totalRecords,
        api_calls_used: totalApiCalls,
        products_added: productsAdded,
        products_updated: productsUpdated,
        price_history_entries: priceHistoryEntries,
        last_run_duration_ms: processingTime,
        avg_processing_time_ms: Math.round(processingTime / Math.max(1, totalApiCalls)),
        success_rate: 100.0,
        completed_at: new Date().toISOString()
      })
      .eq('id', syncJob.id)

    console.log(`Weekly catalog sync completed successfully in ${processingTime}ms`)

    return new Response(
      JSON.stringify({
        success: true,
        job_type: 'weekly_catalog',
        records_processed: totalRecords,
        products_added: productsAdded,
        products_updated: productsUpdated,
        price_history_entries: priceHistoryEntries,
        api_calls_used: totalApiCalls,
        merchants_synced: TARGET_MERCHANTS,
        search_terms_used: SEARCH_TERMS.length,
        processing_time_ms: processingTime,
        avg_time_per_call_ms: Math.round(processingTime / Math.max(1, totalApiCalls)),
        sync_focus: 'comprehensive_catalog'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Weekly catalog sync error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        job_type: 'weekly_catalog',
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
  
  // Higher priority for outdoor/climbing categories
  const category = product["Category Name"] || ''
  if (TARGET_CATEGORIES.some(cat => category.toLowerCase().includes(cat.toLowerCase()))) {
    syncPriority = Math.max(1, syncPriority - 1)
  }
  
  // Higher priority if found by specific search terms
  if (['climbing', 'hiking', 'camping', 'outdoor'].includes(searchContext)) {
    syncPriority = Math.max(1, syncPriority - 1)
  }

  // Calculate availability score
  let availabilityScore = 1.0
  
  // Lower availability for very cheap items (might be clearance)
  const salePrice = product["Sale Price"] ? parseFloat(product["Sale Price"]) : null
  const retailPrice = product["Retail Price"] ? parseFloat(product["Retail Price"]) : null
  
  if (salePrice && salePrice < 10) {
    availabilityScore = 0.8
  }

  // Prioritize higher quality images
  let imageUrl = product["Large Image"] || product["Medium Image"] || product["Thumbnail Image"] || null

  return {
    sku: product["Product SKU"],
    merchant_id: parseInt(product["Merchant Id"]),
    merchant_name: product["Merchant Name"] || '',
    name: product["Product Name"] || '',
    brand_name: product["Brand Name"] || null,
    sale_price: salePrice,
    retail_price: retailPrice,
    discount_percent: product["Price Discount Percent"] ? parseInt(product["Price Discount Percent"]) : null,
    discount_amount: product["Price Discount Amount"] ? parseFloat(product["Price Discount Amount"]) : null,
    image_url: imageUrl,
    buy_url: product["Buy URL"] || null,
    description: product["Description"] || null,
    category: product["Category Name"] || null,
    subcategory: product["Subcategory Name"] || null,
    sync_priority: syncPriority,
    availability_score: availabilityScore
  }
}