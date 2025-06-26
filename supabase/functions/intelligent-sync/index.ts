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

interface SyncOptions {
  mode?: 'daily' | 'weekly' | 'full' | 'comprehensive' | 'sale_only' | 'favorites'
  merchants?: number[]
  categories?: string[]
  maxProductsPerMerchant?: number
  forceFullSync?: boolean
}

// Merchant configuration - Using verified working merchant IDs
const MERCHANT_CONFIG = {
  18557: { name: 'MEC Mountain Equipment Company Ltd', priority: 1 },
  // Note: 9272 and 31349 were invalid, keeping only verified working merchant for now
}

const DEFAULT_MERCHANTS = Object.keys(MERCHANT_CONFIG).map(Number)

// Search strategy based on sync mode
const SYNC_STRATEGIES = {
  daily: {
    saleOnly: true,
    searchTerms: ['*'],
    maxPerMerchant: 1000,
    jobType: 'daily_products'
  },
  weekly: {
    saleOnly: false,
    searchTerms: ['*'],
    maxPerMerchant: 2000,
    jobType: 'weekly_catalog'
  },
  full: {
    saleOnly: false,
    searchTerms: ['*'],
    maxPerMerchant: 5000,
    jobType: 'full_catalog'
  },
  comprehensive: {
    saleOnly: false,
    searchTerms: ['*'],
    maxPerMerchant: 50000,
    jobType: 'comprehensive_catalog',
    useComprehensiveFunction: true
  },
  sale_only: {
    saleOnly: true,
    searchTerms: ['*'],
    maxPerMerchant: 1000,
    jobType: 'sale_items'
  },
  favorites: {
    saleOnly: false,
    searchTerms: ['*'],
    maxPerMerchant: 1000,
    jobType: 'favorites_sync'
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse sync options from request
    let syncOptions: SyncOptions = { mode: 'daily' }
    if (req.method === 'POST') {
      try {
        const body = await req.json()
        syncOptions = { ...syncOptions, ...body }
      } catch {
        // Use defaults if no valid JSON body
      }
    }

    // Determine sync mode from URL or body
    const url = new URL(req.url)
    const modeFromUrl = url.searchParams.get('mode') as SyncOptions['mode']
    const mode = syncOptions.mode || modeFromUrl || 'daily'

    // Get strategy for this sync mode
    const strategy = SYNC_STRATEGIES[mode]
    if (!strategy) {
      throw new Error(`Invalid sync mode: ${mode}`)
    }

    // Redirect to comprehensive-sync function if using comprehensive mode
    if (mode === 'comprehensive' && strategy.useComprehensiveFunction) {
      console.log('🔄 Redirecting to comprehensive-sync function for complete catalog coverage')
      
      // Call the comprehensive-sync function
      const comprehensiveUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/comprehensive-sync`
      const comprehensiveResponse = await fetch(comprehensiveUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        },
        body: JSON.stringify({
          merchantIds: syncOptions.merchants || DEFAULT_MERCHANTS,
          testMode: false,
          maxProductsTotal: strategy.maxPerMerchant
        })
      })

      if (!comprehensiveResponse.ok) {
        throw new Error(`Comprehensive sync failed: ${comprehensiveResponse.status}`)
      }

      const comprehensiveResult = await comprehensiveResponse.json()
      
      return new Response(
        JSON.stringify({
          ...comprehensiveResult,
          redirected_from: 'intelligent-sync',
          original_mode: mode
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
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
    const targetMerchants = syncOptions.merchants || DEFAULT_MERCHANTS
    const maxPerMerchant = syncOptions.maxProductsPerMerchant || strategy.maxPerMerchant

    console.log(`Starting ${mode} sync for merchants: ${targetMerchants.join(', ')}`)

    // Create sync job record
    const { data: syncJob, error: syncJobError } = await supabaseClient
      .from('sync_jobs')
      .insert({
        job_type: strategy.jobType,
        job_subtype: mode,
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
      const merchantInfo = MERCHANT_CONFIG[merchantId as keyof typeof MERCHANT_CONFIG]
      console.log(`Syncing ${mode} for merchant ${merchantId} (${merchantInfo?.name || 'Unknown'})`)
      
      try {
        const merchantProducts: TransformedProduct[] = []

        // Process each search term for this merchant
        for (const searchTerm of strategy.searchTerms) {
          let currentBase = 0
          let hasMoreResults = true
          
          while (hasMoreResults && merchantProducts.length < maxPerMerchant) {
            // Build AvantLink API URL
            const apiUrl = new URL('https://classic.avantlink.com/api.php')
            apiUrl.searchParams.set('module', 'ProductSearch')
            apiUrl.searchParams.set('affiliate_id', affiliateId)
            apiUrl.searchParams.set('website_id', websiteId)
            apiUrl.searchParams.set('search_term', searchTerm)
            apiUrl.searchParams.set('merchant_ids', merchantId.toString())
            
            // Apply sale-only filter based on strategy
            if (strategy.saleOnly) {
              apiUrl.searchParams.set('search_on_sale_only', '1')
            }
            
            apiUrl.searchParams.set('search_results_count', '200') // Max per call
            apiUrl.searchParams.set('search_results_base', currentBase.toString())
            apiUrl.searchParams.set('output', 'json')
            // Don't specify fields - let AvantLink return default field names
            // The API returns fields like strProductSKU, strProductName, etc.

            // Add category filter if specified
            if (syncOptions.categories && syncOptions.categories.length > 0) {
              apiUrl.searchParams.set('search_category', syncOptions.categories.join('|'))
            }

            console.log(`API call: ${searchTerm} (base: ${currentBase}) for merchant ${merchantId}`)
            const response = await fetch(apiUrl.toString())
            totalApiCalls++

            if (!response.ok) {
              console.error(`AvantLink API error: ${response.status} ${response.statusText}`)
              hasMoreResults = false
              break
            }

            const data = await response.json()
            
            if (data && Array.isArray(data) && data.length > 0) {
              const transformedProducts = data
                .map(product => transformProduct(product, merchantInfo?.priority || 3))
                .filter(Boolean) as TransformedProduct[]
              
              // Deduplicate by SKU within this merchant
              const newProducts = transformedProducts.filter(p => 
                !merchantProducts.some(existing => existing.sku === p.sku)
              )
              
              merchantProducts.push(...newProducts)
              totalRecords += newProducts.length

              console.log(`Fetched ${newProducts.length} new products (${data.length} total returned)`)

              // Check if we got less than requested (indicates end of results)
              if (data.length < 200) {
                hasMoreResults = false
              } else {
                currentBase += 200
              }

              // Add delay to respect rate limits
              await new Promise(resolve => setTimeout(resolve, 100))
            } else {
              hasMoreResults = false
            }

            // Safety break to prevent infinite loops
            if (currentBase > 10000) {
              console.log(`Reached maximum base offset (${currentBase}) for search term: ${searchTerm}`)
              break
            }
          }

          // Add delay between search terms
          await new Promise(resolve => setTimeout(resolve, 200))
        }

        allProducts.push(...merchantProducts)
        console.log(`Completed merchant ${merchantId}: ${merchantProducts.length} total products`)

      } catch (error) {
        console.error(`Error syncing merchant ${merchantId}:`, error)
        // Continue with other merchants even if one fails
      }

      // Add delay between merchants
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Batch insert products to Supabase
    if (allProducts.length > 0) {
      console.log(`Inserting ${allProducts.length} products to database...`)
      
      const { error: insertError } = await supabaseClient
        .from('products')
        .upsert(allProducts, {
          onConflict: 'sku,merchant_id,last_sync_date'
        })

      if (insertError) {
        throw new Error(`Failed to insert products: ${insertError.message}`)
      }

      productsAdded = allProducts.length

      // Create price history records for products with prices
      const priceHistoryRecords = allProducts
        .filter(p => p.sale_price || p.retail_price)
        .map(p => ({
          product_sku: p.sku,
          merchant_id: p.merchant_id,
          price: p.sale_price || p.retail_price || 0,
          is_sale: !!p.sale_price && p.sale_price < (p.retail_price || Infinity),
          discount_percent: p.discount_percent || 0,
          data_source: 'ProductSearch',
          price_change_reason: mode === 'daily' ? 'daily_sync' : 'catalog_sync'
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
        avg_processing_time_ms: processingTime,
        completed_at: new Date().toISOString()
      })
      .eq('id', syncJob.id)

    console.log(`Sync completed: ${totalRecords} products, ${totalApiCalls} API calls, ${processingTime}ms`)

    return new Response(
      JSON.stringify({
        success: true,
        mode,
        records_processed: totalRecords,
        api_calls_used: totalApiCalls,
        products_added: productsAdded,
        price_history_entries: priceHistoryEntries,
        merchants_synced: targetMerchants,
        processing_time_ms: processingTime,
        sync_job_id: syncJob.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Intelligent sync error:', error)
    
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

function transformProduct(product: AvantLinkProduct, merchantPriority: number = 3): TransformedProduct | null {
  if (!product.strProductSKU || !product.lngMerchantId) {
    return null
  }

  // Calculate sync priority based on merchant priority and product characteristics
  let syncPriority = merchantPriority
  
  // Boost priority for sale items
  if (product.dblProductSalePrice && product.dblProductPrice) {
    const salePrice = parseFloat(product.dblProductSalePrice)
    const retailPrice = parseFloat(product.dblProductPrice)
    if (salePrice < retailPrice) {
      syncPriority = Math.max(1, syncPriority - 1)
    }
  }

  // Boost priority for climbing/outdoor categories
  const category = product.strCategoryName?.toLowerCase() || ''
  if (category.includes('climbing') || category.includes('outdoor') || category.includes('mountaineering')) {
    syncPriority = Math.max(1, syncPriority - 1)
  }

  // Calculate discount percentage if not provided
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
    discount_amount: null, // Calculate from prices if needed
    image_url: product.strThumbnailImage || product.strMediumImage || null,
    buy_url: product.strBuyURL || null,
    description: product.txtLongDescription || product.txtShortDescription || null,
    category: product.strCategoryName || null,
    subcategory: product.strSubCategoryName || null,
    sync_priority: syncPriority,
    availability_score: 1.0 // Default to fully available
  }
}