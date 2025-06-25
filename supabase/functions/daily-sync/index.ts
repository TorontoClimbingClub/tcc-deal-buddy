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
}

const TARGET_MERCHANTS = [9272] // MEC Mountain Equipment Company Ltd

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

    // Create sync job record
    const { data: syncJob, error: syncJobError } = await supabaseClient
      .from('sync_jobs')
      .insert({
        job_type: 'daily_products',
        status: 'running'
      })
      .select()
      .single()

    if (syncJobError) {
      throw new Error(`Failed to create sync job: ${syncJobError.message}`)
    }

    let totalRecords = 0
    let totalApiCalls = 0
    const allProducts: TransformedProduct[] = []

    // Sync products for each target merchant
    for (const merchantId of TARGET_MERCHANTS) {
      console.log(`Syncing products for merchant ${merchantId}`)
      
      try {
        // Build AvantLink API URL for sale items only
        const apiUrl = new URL('https://classic.avantlink.com/api.php')
        apiUrl.searchParams.set('module', 'ProductSearch')
        apiUrl.searchParams.set('affiliate_id', affiliateId)
        apiUrl.searchParams.set('website_id', websiteId)
        apiUrl.searchParams.set('search_term', '*') // All products
        apiUrl.searchParams.set('merchant_ids', merchantId.toString())
        apiUrl.searchParams.set('search_on_sale_only', '1') // Only sale items
        apiUrl.searchParams.set('search_results_count', '200') // Max results per call
        apiUrl.searchParams.set('output', 'json')
        apiUrl.searchParams.set('search_results_fields', 
          'Product SKU|Merchant Id|Merchant Name|Product Name|Brand Name|Sale Price|Retail Price|Price Discount Percent|Price Discount Amount|Thumbnail Image|Buy URL|Description|Category Name|Subcategory Name'
        )

        const response = await fetch(apiUrl.toString())
        totalApiCalls++

        if (!response.ok) {
          throw new Error(`AvantLink API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        
        if (data && Array.isArray(data)) {
          const transformedProducts = data.map(transformProduct).filter(Boolean)
          allProducts.push(...transformedProducts)
          totalRecords += transformedProducts.length
          
          console.log(`Fetched ${transformedProducts.length} products from merchant ${merchantId}`)
        }

      } catch (error) {
        console.error(`Error syncing merchant ${merchantId}:`, error)
        // Continue with other merchants even if one fails
      }
    }

    // Batch insert products to Supabase
    if (allProducts.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('products')
        .upsert(allProducts, {
          onConflict: 'sku,merchant_id,last_sync_date'
        })

      if (insertError) {
        throw new Error(`Failed to insert products: ${insertError.message}`)
      }

      // Create price history records for tracking
      const priceHistoryRecords = allProducts
        .filter(p => p.sale_price)
        .map(p => ({
          product_sku: p.sku,
          merchant_id: p.merchant_id,
          price: p.sale_price!,
          is_sale: true,
          discount_percent: p.discount_percent || 0
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
        }
      }
    }

    // Update sync job as completed
    await supabaseClient
      .from('sync_jobs')
      .update({
        status: 'completed',
        records_processed: totalRecords,
        api_calls_used: totalApiCalls,
        completed_at: new Date().toISOString()
      })
      .eq('id', syncJob.id)

    return new Response(
      JSON.stringify({
        success: true,
        records_processed: totalRecords,
        api_calls_used: totalApiCalls,
        merchants_synced: TARGET_MERCHANTS
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Daily sync error:', error)
    
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

function transformProduct(product: AvantLinkProduct): TransformedProduct | null {
  if (!product["Product SKU"] || !product["Merchant Id"]) {
    return null
  }

  return {
    sku: product["Product SKU"],
    merchant_id: parseInt(product["Merchant Id"]),
    merchant_name: product["Merchant Name"] || '',
    name: product["Product Name"] || '',
    brand_name: product["Brand Name"] || null,
    sale_price: product["Sale Price"] ? parseFloat(product["Sale Price"]) : null,
    retail_price: product["Retail Price"] ? parseFloat(product["Retail Price"]) : null,
    discount_percent: product["Price Discount Percent"] ? parseInt(product["Price Discount Percent"]) : null,
    discount_amount: product["Price Discount Amount"] ? parseFloat(product["Price Discount Amount"]) : null,
    image_url: product["Thumbnail Image"] || null,
    buy_url: product["Buy URL"] || null,
    description: product["Description"] || null,
    category: product["Category Name"] || null,
    subcategory: product["Subcategory Name"] || null
  }
}