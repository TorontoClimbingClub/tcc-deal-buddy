
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SyncOptions {
  merchantIds?: number[]
  testMode?: boolean
  maxProductsTotal?: number
  includePriceHistory?: boolean
}

const SYNC_CONFIG = {
  MERCHANTS: {
    MEC: { id: 18557, name: 'MEC Mountain Equipment Company Ltd', priority: 1 }
  },
  AVANTLINK: {
    AFFILIATE_ID: '348445',
    BASE_URL: 'https://classic.avantlink.com/api.php',
    RATE_LIMIT_MS: 500
  },
  SEARCH_STRATEGIES: [
    { term: '*', description: 'All products' },
    { term: 'jacket', description: 'Jackets' },
    { term: 'clothing', description: 'Clothing items' },
    { term: 'outdoor', description: 'Outdoor gear' },
    { term: 'equipment', description: 'Equipment' }
  ],
  PRICE_RANGES: [
    { min: 0, max: 25, label: 'Under $25' },
    { min: 25, max: 50, label: '$25-50' },
    { min: 50, max: 100, label: '$50-100' },
    { min: 100, max: 200, label: '$100-200' },
    { min: 200, max: 500, label: '$200-500' },
    { min: 500, max: 1000, label: '$500-1000' },
    { min: 1000, max: 9999, label: '$1000+' }
  ]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let syncOptions: SyncOptions = {}
    if (req.method === 'POST') {
      try {
        const body = await req.json()
        syncOptions = { ...syncOptions, ...body }
      } catch {
        // Use defaults if no valid JSON body
      }
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const affiliateId = Deno.env.get('AVANTLINK_AFFILIATE_ID')
    const apiKey = Deno.env.get('AVANTLINK_API_KEY')
    const websiteId = Deno.env.get('AVANTLINK_WEBSITE_ID')

    if (!affiliateId || !apiKey || !websiteId) {
      throw new Error('Missing AvantLink API credentials')
    }

    const targetMerchants = syncOptions.merchantIds || [SYNC_CONFIG.MERCHANTS.MEC.id]
    const testMode = syncOptions.testMode || false
    const maxProductsTotal = syncOptions.maxProductsTotal || (testMode ? 1000 : 50000)
    const includePriceHistory = syncOptions.includePriceHistory || false

    console.log(`🚀 Starting unified comprehensive sync`)
    console.log(`📊 Merchants: ${targetMerchants.join(', ')}, Test mode: ${testMode}`)
    console.log(`📦 Max products: ${maxProductsTotal}, Price history: ${includePriceHistory}`)

    // Create sync job record
    const { data: syncJob, error: syncJobError } = await supabaseClient
      .from('sync_jobs')
      .insert({
        job_type: 'comprehensive_sync',
        job_subtype: 'unified_api_service',
        status: 'running',
        merchant_ids: targetMerchants
      })
      .select()
      .single()

    if (syncJobError) {
      throw new Error(`Failed to create sync job: ${syncJobError.message}`)
    }

    let totalRecords = 0
    let totalApiCalls = 0
    let productsAdded = 0
    let priceHistoryEntries = 0
    const allProducts: any[] = []
    const startTime = Date.now()
    const errors: string[] = []

    // Rate limiter
    let lastApiCall = 0
    const rateLimitDelay = async () => {
      const now = Date.now()
      const timeSinceLastCall = now - lastApiCall
      if (timeSinceLastCall < SYNC_CONFIG.AVANTLINK.RATE_LIMIT_MS) {
        await new Promise(resolve => setTimeout(resolve, SYNC_CONFIG.AVANTLINK.RATE_LIMIT_MS - timeSinceLastCall))
      }
      lastApiCall = Date.now()
    }

    // Process each merchant
    for (const merchantId of targetMerchants) {
      console.log(`\n🏪 Processing merchant ${merchantId}`)
      const merchantProducts: any[] = []

      // Process each search strategy
      for (const strategy of SYNC_CONFIG.SEARCH_STRATEGIES) {
        if (totalRecords >= maxProductsTotal) break

        console.log(`🔍 Processing search: ${strategy.description}`)

        try {
          await rateLimitDelay()

          // Basic search
          const searchResults = await searchProducts(
            strategy.term, merchantId, affiliateId, websiteId
          )
          totalApiCalls++

          let finalResults = searchResults

          // Use price subdivision if we hit the limit
          if (searchResults.length === 200) {
            console.log(`🔄 Search hit limit, using price subdivision`)
            finalResults = await searchWithPriceSubdivision(
              strategy.term, merchantId, affiliateId, websiteId, rateLimitDelay
            )
            totalApiCalls += SYNC_CONFIG.PRICE_RANGES.length
          }

          const transformedProducts = finalResults
            .map(transformProduct)
            .filter(Boolean)

          const newProducts = transformedProducts.filter(p => 
            !merchantProducts.some(existing => existing.sku === p.sku)
          )

          merchantProducts.push(...newProducts)
          totalRecords += newProducts.length

          console.log(`✅ ${strategy.description}: ${newProducts.length} unique products`)

        } catch (error) {
          console.error(`❌ Error processing ${strategy.description}:`, error)
          errors.push(`${strategy.description}: ${error.message}`)
        }
      }

      allProducts.push(...merchantProducts)
      console.log(`🏪 Merchant ${merchantId} completed: ${merchantProducts.length} products`)
    }

    // Save products to database
    if (allProducts.length > 0) {
      console.log(`💾 Saving ${allProducts.length} products to database...`)
      
      const { error: insertError } = await supabaseClient
        .from('products')
        .upsert(allProducts, {
          onConflict: 'sku,merchant_id,last_sync_date'
        })

      if (insertError) {
        throw new Error(`Failed to insert products: ${insertError.message}`)
      }

      productsAdded = allProducts.length

      // Create price history if requested
      if (includePriceHistory) {
        const priceHistoryRecords = allProducts
          .filter(p => p.sale_price || p.retail_price)
          .map(p => ({
            product_sku: p.sku,
            merchant_id: p.merchant_id,
            price: p.sale_price || p.retail_price || 0,
            is_sale: !!p.sale_price && p.sale_price < (p.retail_price || Infinity),
            discount_percent: p.discount_percent || 0
          }))

        if (priceHistoryRecords.length > 0) {
          const { error: historyError } = await supabaseClient
            .from('price_history')
            .upsert(priceHistoryRecords, {
              onConflict: 'product_sku,merchant_id,recorded_date'
            })

          if (!historyError) {
            priceHistoryEntries = priceHistoryRecords.length
          }
        }
      }
    }

    const processingTime = Date.now() - startTime

    // Update sync job
    await supabaseClient
      .from('sync_jobs')
      .update({
        status: 'completed',
        records_processed: totalRecords,
        api_calls_used: totalApiCalls,
        products_added: productsAdded,
        price_history_entries: priceHistoryEntries,
        avg_processing_time_ms: processingTime,
        completed_at: new Date().toISOString()
      })
      .eq('id', syncJob.id)

    const report = {
      success: true,
      sync_type: 'unified_comprehensive_sync',
      records_processed: totalRecords,
      api_calls_used: totalApiCalls,
      products_added: productsAdded,
      price_history_entries: priceHistoryEntries,
      merchants_synced: targetMerchants,
      processing_time_ms: processingTime,
      processing_time_readable: `${Math.round(processingTime / 1000)}s`,
      sync_job_id: syncJob.id,
      errors: errors.length > 0 ? errors : undefined,
      performance_metrics: {
        avg_products_per_api_call: Math.round(totalRecords / totalApiCalls),
        processing_rate: `${Math.round(totalRecords / (processingTime / 1000))} products/second`,
        error_rate: `${((errors.length / totalApiCalls) * 100).toFixed(2)}%`
      }
    }

    console.log(`🎉 Unified sync completed: ${totalRecords} products, ${totalApiCalls} API calls`)

    return new Response(
      JSON.stringify(report),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Unified sync error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        sync_type: 'unified_comprehensive_sync'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Helper functions
async function searchProducts(
  searchTerm: string,
  merchantId: number,
  affiliateId: string,
  websiteId: string
): Promise<any[]> {
  const apiUrl = new URL(SYNC_CONFIG.AVANTLINK.BASE_URL)
  apiUrl.searchParams.set('module', 'ProductSearch')
  apiUrl.searchParams.set('affiliate_id', affiliateId)
  apiUrl.searchParams.set('website_id', websiteId)
  apiUrl.searchParams.set('search_term', searchTerm)
  apiUrl.searchParams.set('merchant_ids', merchantId.toString())
  apiUrl.searchParams.set('search_results_count', '200')
  apiUrl.searchParams.set('output', 'json')

  const response = await fetch(apiUrl.toString())
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return Array.isArray(data) ? data : []
}

async function searchWithPriceSubdivision(
  searchTerm: string,
  merchantId: number,
  affiliateId: string,
  websiteId: string,
  rateLimitDelay: () => Promise<void>
): Promise<any[]> {
  const allResults: any[] = []

  for (const priceRange of SYNC_CONFIG.PRICE_RANGES) {
    await rateLimitDelay()

    const apiUrl = new URL(SYNC_CONFIG.AVANTLINK.BASE_URL)
    apiUrl.searchParams.set('module', 'ProductSearch')
    apiUrl.searchParams.set('affiliate_id', affiliateId)
    apiUrl.searchParams.set('website_id', websiteId)
    apiUrl.searchParams.set('search_term', searchTerm)
    apiUrl.searchParams.set('search_price_minimum', priceRange.min.toString())
    apiUrl.searchParams.set('search_price_maximum', priceRange.max.toString())
    apiUrl.searchParams.set('merchant_ids', merchantId.toString())
    apiUrl.searchParams.set('search_results_count', '200')
    apiUrl.searchParams.set('output', 'json')

    try {
      const response = await fetch(apiUrl.toString())
      
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          allResults.push(...data)
        }
      }
    } catch (error) {
      console.error(`Price range ${priceRange.label} error:`, error)
    }
  }

  return allResults
}

function transformProduct(product: any): any | null {
  if (!product.strProductSKU || !product.lngMerchantId) {
    return null
  }

  const salePrice = product.dblProductSalePrice ? parseFloat(product.dblProductSalePrice) : null
  const retailPrice = product.dblProductPrice ? parseFloat(product.dblProductPrice) : null
  
  let discountPercent = null
  if (salePrice && retailPrice && salePrice < retailPrice) {
    discountPercent = Math.round(((retailPrice - salePrice) / retailPrice) * 100)
  }

  return {
    sku: product.strProductSKU,
    merchant_id: parseInt(product.lngMerchantId),
    merchant_name: product.strMerchantName || '',
    name: product.strProductName || '',
    brand_name: product.strBrandName || null,
    sale_price: salePrice,
    retail_price: retailPrice,
    discount_percent: discountPercent,
    discount_amount: null,
    image_url: product.strThumbnailImage || product.strMediumImage || null,
    buy_url: product.strBuyURL || null,
    description: product.txtLongDescription || product.txtShortDescription || null,
    category: product.strCategoryName || null,
    subcategory: product.strSubCategoryName || null,
    sync_priority: 1,
    availability_score: 1.0
  }
}
