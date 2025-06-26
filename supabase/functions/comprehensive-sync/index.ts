import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AvantLinkProduct {
  // Actual field names from AvantLink API
  lngProductId: string
  strProductSKU: string
  strProductName: string
  strBrandName?: string
  dblProductPrice: string
  dblProductSalePrice?: string
  strThumbnailImage?: string
  strMediumImage?: string
  strLargeImage?: string
  strBuyURL: string
  txtShortDescription?: string
  txtLongDescription?: string
  strDepartmentName?: string
  strCategoryName?: string
  strSubCategoryName?: string
  strMerchantName: string
  lngMerchantId: string
  intSearchResultScore?: string
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

interface PriceRange {
  min: number
  max: number
  label: string
}

interface SyncOptions {
  merchantIds?: number[]
  testMode?: boolean
  maxProductsTotal?: number
}

// MEC Merchant Configuration
const MERCHANT_CONFIG = {
  18557: { name: 'MEC Mountain Equipment Company Ltd', priority: 1 }
}

const DEFAULT_MERCHANTS = Object.keys(MERCHANT_CONFIG).map(Number)

// Use broad search approach instead of specific categories
// Based on AvantLink API docs, we'll use search_term wildcards
const SEARCH_STRATEGIES = [
  { term: '*', description: 'All products' },
  { term: 'jacket', description: 'Jackets' },
  { term: 'clothing', description: 'Clothing items' },
  { term: 'outdoor', description: 'Outdoor gear' },
  { term: 'equipment', description: 'Equipment' }
]

// Price range subdivision strategy
const PRICE_RANGES: PriceRange[] = [
  { min: 0, max: 25, label: 'Under $25' },
  { min: 25, max: 50, label: '$25-50' },
  { min: 50, max: 100, label: '$50-100' },
  { min: 100, max: 200, label: '$100-200' },
  { min: 200, max: 500, label: '$200-500' },
  { min: 500, max: 1000, label: '$500-1000' },
  { min: 1000, max: 9999, label: '$1000+' }
]

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse sync options from request
    let syncOptions: SyncOptions = {}
    if (req.method === 'POST') {
      try {
        const body = await req.json()
        syncOptions = { ...syncOptions, ...body }
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

    // Determine target merchants
    const targetMerchants = syncOptions.merchantIds || DEFAULT_MERCHANTS
    const testMode = syncOptions.testMode || false
    const maxProductsTotal = syncOptions.maxProductsTotal || (testMode ? 1000 : 50000)

    console.log(`🚀 Starting comprehensive sync for merchants: ${targetMerchants.join(', ')}`)
    console.log(`📊 Test mode: ${testMode}, Max products: ${maxProductsTotal}`)

    // Create sync job record (using full_catalog type for compatibility)
    const { data: syncJob, error: syncJobError } = await supabaseClient
      .from('sync_jobs')
      .insert({
        job_type: 'full_catalog',
        job_subtype: 'comprehensive_price_subdivision',
        status: 'running',
        merchant_ids: targetMerchants,
        categories_synced: SEARCH_STRATEGIES.map(s => s.description)
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
    const allProducts: TransformedProduct[] = []
    const startTime = Date.now()
    const coverageReport = {
      categoriesProcessed: 0,
      priceRangesUsed: 0,
      categoriesSubdivided: 0,
      totalApiCalls: 0
    }

    // Process each merchant
    for (const merchantId of targetMerchants) {
      const merchantInfo = MERCHANT_CONFIG[merchantId as keyof typeof MERCHANT_CONFIG]
      console.log(`\n🏪 Processing merchant ${merchantId} (${merchantInfo?.name || 'Unknown'})`)

      const merchantProducts: TransformedProduct[] = []

      // Process each search strategy with adaptive subdivision
      for (const strategy of SEARCH_STRATEGIES) {
        if (totalRecords >= maxProductsTotal) {
          console.log(`📊 Reached maximum product limit (${maxProductsTotal}), stopping`)
          break
        }

        console.log(`\n🔍 Processing search: ${strategy.description} (${strategy.term})`)
        coverageReport.categoriesProcessed++

        try {
          // Step 1: Try basic search first
          const searchResults = await searchTermBasic(
            strategy.term, merchantId, affiliateId, apiKey, websiteId
          )
          totalApiCalls++
          coverageReport.totalApiCalls++

          console.log(`  📦 Basic search returned ${searchResults.length} products`)

          // Step 2: Check if we hit the 200-result limit (indicating more products available)
          if (searchResults.length === 200) {
            console.log(`  🔄 Search ${strategy.term} hit 200-result limit, subdividing by price ranges`)
            coverageReport.categoriesSubdivided++

            // Subdivide by price ranges
            const subdivisionResults: TransformedProduct[] = []

            for (const priceRange of PRICE_RANGES) {
              if (totalRecords >= maxProductsTotal) break

              console.log(`    💰 Searching ${strategy.term} in range ${priceRange.label}`)
              
              const rangeResults = await searchTermPriceRange(
                strategy.term, priceRange, merchantId, affiliateId, apiKey, websiteId
              )
              totalApiCalls++
              coverageReport.totalApiCalls++
              coverageReport.priceRangesUsed++

              console.log(`    💰 Range ${priceRange.label}: ${rangeResults.length} products`)
              subdivisionResults.push(...rangeResults)

              // Add delay to respect rate limits
              await new Promise(resolve => setTimeout(resolve, 150))
            }

            // Use subdivision results instead of basic results
            const transformedProducts = subdivisionResults
              .map(product => transformProduct(product, merchantInfo?.priority || 3))
              .filter(Boolean) as TransformedProduct[]

            // Deduplicate by SKU
            const newProducts = transformedProducts.filter(p => 
              !merchantProducts.some(existing => existing.sku === p.sku)
            )

            merchantProducts.push(...newProducts)
            totalRecords += newProducts.length
            console.log(`  ✅ Search ${strategy.term}: ${newProducts.length} unique products (${subdivisionResults.length} total from ranges)`)

          } else {
            // Use basic search results (no subdivision needed)
            const transformedProducts = searchResults
              .map(product => transformProduct(product, merchantInfo?.priority || 3))
              .filter(Boolean) as TransformedProduct[]

            const newProducts = transformedProducts.filter(p => 
              !merchantProducts.some(existing => existing.sku === p.sku)
            )

            merchantProducts.push(...newProducts)
            totalRecords += newProducts.length
            console.log(`  ✅ Search ${strategy.term}: ${newProducts.length} unique products (no subdivision needed)`)
          }

        } catch (error) {
          console.error(`❌ Error processing search ${strategy.term}:`, error)
          // Continue with other searches even if one fails
        }

        // Add delay between categories
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      allProducts.push(...merchantProducts)
      console.log(`\n🏪 Completed merchant ${merchantId}: ${merchantProducts.length} total products`)
    }

    // Deduplicate products globally before inserting
    const uniqueProducts = allProducts.reduce((acc: TransformedProduct[], product) => {
      const existingIndex = acc.findIndex(p => p.sku === product.sku && p.merchant_id === product.merchant_id)
      if (existingIndex === -1) {
        acc.push(product)
      }
      return acc
    }, [])

    // Batch insert products to Supabase
    if (uniqueProducts.length > 0) {
      console.log(`\n💾 Inserting ${uniqueProducts.length} unique products to database (${allProducts.length} total found)...`)
      
      const { error: insertError } = await supabaseClient
        .from('products')
        .upsert(uniqueProducts, {
          onConflict: 'sku,merchant_id,last_sync_date'
        })

      if (insertError) {
        throw new Error(`Failed to insert products: ${insertError.message}`)
      }

      productsAdded = uniqueProducts.length

      // Create price history records
      const priceHistoryRecords = uniqueProducts
        .filter(p => p.sale_price || p.retail_price)
        .map(p => ({
          product_sku: p.sku,
          merchant_id: p.merchant_id,
          price: p.sale_price || p.retail_price || 0,
          is_sale: !!p.sale_price && p.sale_price < (p.retail_price || Infinity),
          discount_percent: p.discount_percent || 0,
          data_source: 'ComprehensiveSync',
          price_change_reason: 'comprehensive_catalog_sync'
        }))

      if (priceHistoryRecords.length > 0) {
        const { error: historyError } = await supabaseClient
          .from('price_history')
          .upsert(priceHistoryRecords, {
            onConflict: 'product_sku,merchant_id,recorded_date'
          })

        if (historyError) {
          console.error('Failed to insert price history:', historyError.message)
        } else {
          priceHistoryEntries = priceHistoryRecords.length
        }
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
        products_updated: 0,
        price_history_entries: priceHistoryEntries,
        avg_processing_time_ms: processingTime,
        completed_at: new Date().toISOString()
      })
      .eq('id', syncJob.id)

    // Generate comprehensive report
    const report = {
      success: true,
      sync_type: 'comprehensive_category_price_subdivision',
      records_processed: totalRecords,
      api_calls_used: totalApiCalls,
      products_added: productsAdded,
      price_history_entries: priceHistoryEntries,
      merchants_synced: targetMerchants,
      processing_time_ms: processingTime,
      processing_time_readable: `${Math.round(processingTime / 1000)}s`,
      sync_job_id: syncJob.id,
      coverage_report: {
        ...coverageReport,
        search_strategies_total: SEARCH_STRATEGIES.length,
        price_ranges_total: PRICE_RANGES.length,
        subdivision_rate: `${((coverageReport.categoriesSubdivided / coverageReport.categoriesProcessed) * 100).toFixed(1)}%`,
        avg_products_per_search: Math.round(totalRecords / coverageReport.categoriesProcessed),
        api_efficiency: `${Math.round(totalRecords / totalApiCalls)} products per API call`
      }
    }

    console.log(`\n🎉 Comprehensive sync completed!`)
    console.log(`📊 ${totalRecords} products, ${totalApiCalls} API calls, ${Math.round(processingTime / 1000)}s`)
    console.log(`📈 Coverage: ${coverageReport.categoriesProcessed} categories, ${coverageReport.categoriesSubdivided} subdivided`)

    return new Response(
      JSON.stringify(report),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Comprehensive sync error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        sync_type: 'comprehensive_category_price_subdivision'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Helper function: Basic search term search  
async function searchTermBasic(
  searchTerm: string,
  merchantId: number,
  affiliateId: string,
  apiKey: string,
  websiteId: string
): Promise<AvantLinkProduct[]> {
  const apiUrl = new URL('https://classic.avantlink.com/api.php')
  apiUrl.searchParams.set('module', 'ProductSearch')
  apiUrl.searchParams.set('affiliate_id', affiliateId)
  apiUrl.searchParams.set('website_id', websiteId)
  apiUrl.searchParams.set('search_term', searchTerm)
  apiUrl.searchParams.set('merchant_ids', merchantId.toString())
  apiUrl.searchParams.set('search_results_count', '200')
  apiUrl.searchParams.set('search_results_base', '0')
  apiUrl.searchParams.set('output', 'json')

  const response = await fetch(apiUrl.toString())
  
  if (!response.ok) {
    throw new Error(`AvantLink API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return Array.isArray(data) ? data : []
}

// Helper function: Search term + price range search with pagination
async function searchTermPriceRange(
  searchTerm: string,
  priceRange: PriceRange,
  merchantId: number,
  affiliateId: string,
  apiKey: string,
  websiteId: string
): Promise<AvantLinkProduct[]> {
  const allResults: AvantLinkProduct[] = []
  let currentBase = 0
  let hasMoreResults = true
  
  // Paginate within this price range (up to 5 pages = 1000 products max)
  while (hasMoreResults && allResults.length < 1000) {
    const apiUrl = new URL('https://classic.avantlink.com/api.php')
    apiUrl.searchParams.set('module', 'ProductSearch')
    apiUrl.searchParams.set('affiliate_id', affiliateId)
    apiUrl.searchParams.set('website_id', websiteId)
    apiUrl.searchParams.set('search_term', searchTerm)
    apiUrl.searchParams.set('search_price_minimum', priceRange.min.toString())
    apiUrl.searchParams.set('search_price_maximum', priceRange.max.toString())
    apiUrl.searchParams.set('merchant_ids', merchantId.toString())
    apiUrl.searchParams.set('search_results_count', '200')
    apiUrl.searchParams.set('search_results_base', currentBase.toString())
    apiUrl.searchParams.set('output', 'json')

    const response = await fetch(apiUrl.toString())
    
    if (!response.ok) {
      console.error(`Price range API error: ${response.status} ${response.statusText}`)
      break
    }

    const data = await response.json()
    
    if (data && Array.isArray(data) && data.length > 0) {
      allResults.push(...data)
      
      // Check if we got less than requested (indicates end of results)
      if (data.length < 200) {
        hasMoreResults = false
      } else {
        currentBase += 200
      }
    } else {
      hasMoreResults = false
    }

    // Safety break to prevent infinite loops
    if (currentBase > 800) { // Max 5 pages per price range
      break
    }
  }

  return allResults
}

// Transform AvantLink product to our format
function transformProduct(product: AvantLinkProduct, merchantPriority: number = 3): TransformedProduct | null {
  if (!product.strProductSKU || !product.lngMerchantId) {
    return null
  }

  // Calculate sync priority
  let syncPriority = merchantPriority
  
  // Boost priority for sale items
  if (product.dblProductSalePrice && product.dblProductPrice) {
    const salePrice = parseFloat(product.dblProductSalePrice)
    const retailPrice = parseFloat(product.dblProductPrice)
    if (salePrice < retailPrice) {
      syncPriority = Math.max(1, syncPriority - 1)
    }
  }

  // Calculate discount percentage
  let discountPercent = null
  if (product.dblProductSalePrice && product.dblProductPrice) {
    const salePrice = parseFloat(product.dblProductSalePrice)
    const retailPrice = parseFloat(product.dblProductPrice)
    if (salePrice < retailPrice) {
      discountPercent = Math.round(((retailPrice - salePrice) / retailPrice) * 100)
    }
  }

  return {
    sku: product.strProductSKU,
    merchant_id: parseInt(product.lngMerchantId),
    merchant_name: product.strMerchantName || '',
    name: product.strProductName || '',
    brand_name: product.strBrandName || null,
    sale_price: product.dblProductSalePrice ? parseFloat(product.dblProductSalePrice) : null,
    retail_price: product.dblProductPrice ? parseFloat(product.dblProductPrice) : null,
    discount_percent: discountPercent,
    discount_amount: null,
    image_url: product.strThumbnailImage || product.strMediumImage || null,
    buy_url: product.strBuyURL || null,
    description: product.txtLongDescription || product.txtShortDescription || null,
    category: product.strCategoryName || null,
    subcategory: product.strSubCategoryName || null,
    sync_priority: syncPriority,
    availability_score: 1.0
  }
}