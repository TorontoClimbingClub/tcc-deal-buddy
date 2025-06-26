
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BackfillRequest {
  mode?: 'full_catalog' | 'test_batch' | 'test' | 'test_single'
  batch_size?: number
  max_products?: number
  specific_skus?: string[]
  resume?: boolean
  skip_recent_hours?: number
  test_skus?: string[]
  test_sku?: string
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

    console.log(`✅ API credentials loaded: affiliate_id=${affiliateId}`)

    const requestBody = await req.json() as BackfillRequest
    const { 
      mode = 'test', 
      batch_size = 5, 
      max_products = null, // Remove hard-coded limit
      specific_skus = [],
      resume = true,
      skip_recent_hours = 24, // Skip products updated in last 24 hours
      test_skus = [],
      test_sku = ''
    } = requestBody

    console.log(`📊 Backfill configuration:`, { mode, batch_size, max_products, resume, skip_recent_hours })

    // Test database connection first
    console.log('🔗 Testing database connection...')
    const { data: testData, error: testError } = await supabaseClient
      .from('price_history')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Database connection failed:', testError)
      throw new Error(`Database connection failed: ${testError.message}`)
    }
    
    console.log('✅ Database connection successful')

    // Fetch ALL products from database - ONLY merchant 18557 (MEC)
    let query = supabaseClient
      .from('products')
      .select('sku, merchant_id, name, merchant_name')
      .eq('merchant_id', 18557) // Only use valid merchant ID
      .order('sku', { ascending: true })

    if (mode === 'test_single' && test_sku) {
      query = query.eq('sku', test_sku)
    } else if (test_skus.length > 0) {
      query = query.in('sku', test_skus)
    } else if (specific_skus.length > 0) {
      query = query.in('sku', specific_skus)
    } else if (mode === 'test_batch') {
      query = query.limit(10)
    } else if (max_products) {
      query = query.limit(max_products)
    }
    // Remove max_products limit to fetch ALL products by default

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

    // Smart API optimization: Check which products need API calls
    console.log(`🧠 Analyzing which products need API calls...`)
    
    const recentCutoff = new Date()
    recentCutoff.setHours(recentCutoff.getHours() - skip_recent_hours)
    
    console.log(`📅 Recent cutoff: ${recentCutoff.toISOString()} (skip if newer, process if older)`)

    // Get latest price history per product using optimized approach
    console.log(`🔍 Checking existing price history using efficient query...`)
    
    // First, get all unique product SKUs that have price history
    const { data: skusWithHistory, error: skuError } = await supabaseClient
      .from('price_history')
      .select('product_sku')
      .eq('merchant_id', 18557)
      .not('product_sku', 'is', null)
    
    if (skuError) {
      console.log('⚠️ Warning: Could not check existing SKUs, proceeding with all products:', skuError.message)
    }
    
    // Get latest created_at timestamp for products updated recently (for skip logic)
    // Exclude placeholder records (price=0) from recent updates so they can be refreshed
    const { data: recentUpdates, error: recentError } = await supabaseClient
      .from('price_history')
      .select('product_sku, created_at, price')
      .eq('merchant_id', 18557)
      .gte('created_at', recentCutoff.toISOString())
      .neq('price', 0) // Exclude placeholder records from "recent" classification
    
    const priceHistoryStatus = recentUpdates
    const statusError = recentError

    if (statusError) {
      console.log('⚠️ Warning: Could not check price history status, proceeding with all products:', statusError.message)
    }

    // Analyze which products need API calls using optimized logic
    const productStatusMap = new Map<string, 'skip_recent' | 'needs_refresh' | 'missing'>()
    
    // Create sets for efficient lookup
    const existingSkusSet = new Set(skusWithHistory?.map(item => item.product_sku) || [])
    const recentlyUpdatedSkusSet = new Set(priceHistoryStatus?.map(item => item.product_sku) || [])
    
    console.log(`📊 Optimization Results:`)
    console.log(`   Products with any price history: ${existingSkusSet.size}`)
    console.log(`   Products updated in last 24 hours: ${recentlyUpdatedSkusSet.size}`)
    
    // Classify each product using simplified logic
    products.forEach(product => {
      if (!existingSkusSet.has(product.sku)) {
        // No price history at all - needs API call
        productStatusMap.set(product.sku, 'needs_processing')
      } else if (recentlyUpdatedSkusSet.has(product.sku)) {
        // Updated within last 24 hours - skip
        productStatusMap.set(product.sku, 'skip_recent')
      } else {
        // Has price history but not updated in 24+ hours - needs API call
        productStatusMap.set(product.sku, 'needs_processing')
      }
    })
    
    const skipCount = Array.from(productStatusMap.values()).filter(status => status === 'skip_recent').length
    const processCount = Array.from(productStatusMap.values()).filter(status => status === 'needs_processing').length
    
    console.log(`📊 API Call Analysis:`)
    console.log(`   - Skip (updated in last 24h): ${skipCount} products`)
    console.log(`   - Process (missing or 24h+ old): ${processCount} products`)
    console.log(`   - Total API calls needed: ${processCount}`)
    console.log(`   - API calls saved: ${skipCount}`)
    
    // Calculate real completion percentage
    const totalMecProducts = products.length // Now fetches ALL products
    const productsWithHistory = existingSkusSet.size
    const productsWithoutHistory = processCount - (processCount - products.filter(p => !existingSkusSet.has(p.sku)).length)
    const completionPercent = Math.round((productsWithHistory / totalMecProducts) * 100)
    
    console.log(`\n🎯 REAL COMPLETION STATUS:`)
    console.log(`   Total MEC Products: ${totalMecProducts}`)
    console.log(`   Products WITH price history: ${productsWithHistory}`)
    console.log(`   Products needing processing: ${processCount}`)
    console.log(`   Completion: ${completionPercent}%`)
    
    // Filter products to ONLY those that need API calls BEFORE batching
    const productsNeedingWork = products.filter(product => {
      const status = productStatusMap.get(product.sku)
      return status === 'needs_processing'
    })

    console.log(`\n🚀 FILTERED PROCESSING: ${productsNeedingWork.length} products need API calls`)
    console.log(`📊 Efficiency: ${products.length - productsNeedingWork.length} products pre-filtered (won't waste time processing)`)

    let totalProcessed = 0
    let totalSuccessful = 0
    let totalSkipped = skipCount // Pre-set to skip count since we filtered them out
    let totalApiCalls = 0
    let totalPriceRecords = 0
    const errors: any[] = []

    // Process ONLY products that need work in batches
    for (let i = 0; i < productsNeedingWork.length; i += batch_size) {
      try {
        const batch = productsNeedingWork.slice(i, i + batch_size)
        
        const currentBatch = Math.floor(i / batch_size) + 1
        const totalWorkBatches = Math.ceil(productsNeedingWork.length / batch_size)
        const apiProgress = totalApiCalls
        const apiNeeded = processCount
        const currentCompletion = Math.round(((productsWithHistory + totalSuccessful) / totalMecProducts) * 100)
        
        console.log(`\n🔄 Work Batch ${currentBatch}/${totalWorkBatches} | Completion: ${currentCompletion}% | API: ${apiProgress}/${apiNeeded} | All ${batch.length} products need API calls`)
        
        // Add memory and progress monitoring to debug batch 17 failures
        if (typeof Deno !== 'undefined' && Deno.memoryUsage) {
          const memory = Deno.memoryUsage()
          console.log(`💾 Memory: ${Math.round(memory.heapUsed / 1024 / 1024)}MB heap, ${Math.round(memory.external / 1024 / 1024)}MB external`)
        }
        
        // Add batch-level error handling
        if (currentBatch >= 15) {
          console.log(`🔍 Debug: Approaching problematic batch area (batch ${currentBatch})`)
        }

      // Process each product in the batch (all need API calls)
      for (const product of batch) {
        try {
          const productStatus = productStatusMap.get(product.sku)
          
          const reason = !skusWithHistory?.some(item => item.product_sku === product.sku) ? 
                        'no price history' : 
                        `stale data (>24h old)`
          
          console.log(`📡 Fetching price history for ${product.sku} (${reason})`)
          
          // Call AvantLink ProductPriceCheck API with XML output
          const apiUrl = 'https://classic.avantlink.com/api.php?' + new URLSearchParams({
            module: 'ProductPriceCheck',
            affiliate_id: affiliateId,
            merchant_id: '18557', // Use hardcoded valid merchant ID
            sku: product.sku,
            show_pricing_history: '1', // Must be '1' not 'true'
            show_retail_price: '1',
            output: 'xml'
          }).toString()

          console.log(`🌐 API URL: ${apiUrl}`)

          const response = await fetch(apiUrl)
          totalApiCalls++

          if (!response.ok) {
            console.error(`❌ API call failed for ${product.sku}: ${response.status} ${response.statusText}`)
            errors.push({ sku: product.sku, error: `API call failed: ${response.status}` })
            continue
          }

          const xmlText = await response.text()
          console.log(`📄 Received XML response for ${product.sku} (${xmlText.length} chars)`)
          
          // Log the API URL and first part of XML for debugging
          console.log(`🌐 API URL: ${apiUrl}`)
          if (xmlText.includes('<error>')) {
            console.log(`📄 Full XML: ${xmlText}`)
          }

          // Log first 200 characters for debugging
          if (xmlText.length > 200) {
            console.log(`📄 XML preview: ${xmlText.substring(0, 200)}...`)
          } else {
            console.log(`📄 Full XML: ${xmlText}`)
          }

          // Parse XML price history
          const priceHistory = parseXMLPriceHistory(xmlText)
          console.log(`📈 Parsed ${priceHistory.length} price history entries for ${product.sku}`)

          if (priceHistory.length === 0) {
            console.log(`📝 No price history from AvantLink for ${product.sku} - inserting placeholder to prevent re-checking`)
            
            // Insert placeholder record to mark this product as "checked but no data available"
            try {
              const { error: placeholderError } = await supabaseClient
                .from('price_history')
                .upsert({
                  product_sku: product.sku,
                  merchant_id: 18557,
                  price: 0, // Placeholder price
                  is_sale: false,
                  discount_percent: 0,
                  recorded_date: new Date().toISOString().split('T')[0] // Today's date
                }, {
                  onConflict: 'product_sku,merchant_id,recorded_date'
                })

              if (placeholderError) {
                console.error(`❌ Error inserting placeholder for ${product.sku}:`, placeholderError)
                errors.push({ sku: product.sku, error: `Placeholder insert failed: ${placeholderError.message}` })
              } else {
                console.log(`✅ Placeholder inserted for ${product.sku} - won't be checked again`)
                totalPriceRecords++
              }
            } catch (placeholderException) {
              console.error(`💥 Exception inserting placeholder for ${product.sku}:`, placeholderException)
              errors.push({ sku: product.sku, error: `Placeholder exception: ${placeholderException.message}` })
            }
            
            totalSuccessful++
            totalProcessed++
            continue
          }

          // Insert price history records - FIXED: removed non-existent data_source column
          for (const record of priceHistory) {
            try {
              console.log(`💾 Inserting price record: ${product.sku} - $${record.price} on ${record.date}`)
              
              const { error: insertError } = await supabaseClient
                .from('price_history')
                .upsert({
                  product_sku: product.sku,
                  merchant_id: 18557, // Use hardcoded valid merchant ID
                  price: record.price,
                  is_sale: record.is_sale,
                  discount_percent: record.discount_percent,
                  recorded_date: record.date
                }, {
                  onConflict: 'product_sku,merchant_id,recorded_date'
                })

              if (insertError) {
                console.error(`❌ Error inserting price history for ${product.sku}:`, insertError)
                errors.push({ sku: product.sku, error: insertError.message })
              } else {
                totalPriceRecords++
                console.log(`✅ Successfully inserted price record for ${product.sku}`)
              }
            } catch (insertException) {
              console.error(`💥 Exception inserting price history for ${product.sku}:`, insertException)
              errors.push({ sku: product.sku, error: insertException.message })
            }
          }

          totalSuccessful++
          console.log(`✅ Successfully processed ${product.sku} - ${priceHistory.length} records | API: ${totalApiCalls}/${processCount}`)

        } catch (error) {
          console.error(`💥 Error processing ${product.sku}:`, error)
          errors.push({ sku: product.sku, error: error.message })
        }

        totalProcessed++

        // Small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 500))
      }

        // Longer delay between batches
        if (i + batch_size < productsNeedingWork.length) {
          console.log('⏱️ Pausing between batches...')
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
        
      } catch (batchError) {
        console.error(`💥 Batch ${Math.floor(i / batch_size) + 1} failed:`, batchError)
        const currentBatch = Math.floor(i / batch_size) + 1
        errors.push({ batch: currentBatch, error: batchError.message })
        
        // Continue with next batch instead of failing completely
        console.log(`🔄 Continuing to next batch after error in batch ${currentBatch}`)
      }
    }

    // Final summary
    console.log(`\n🎉 Backfill completed!`)
    console.log(`📊 Summary:`)
    console.log(`   - Total products processed: ${totalProcessed}`)
    console.log(`   - Successful: ${totalSuccessful}`)
    console.log(`   - Skipped (recently synced): ${totalSkipped}`)
    console.log(`   - Errors: ${errors.length}`)
    console.log(`   - API calls made: ${totalApiCalls}`)
    console.log(`   - Price records created: ${totalPriceRecords}`)

    // Verify data was inserted
    const { count: finalCount } = await supabaseClient
      .from('price_history')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📊 Final database count: ${finalCount} price history records`)

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total_processed: totalProcessed,
          successful: totalSuccessful,
          skipped: totalSkipped,
          errors: errors.length,
          api_calls_used: totalApiCalls,
          price_records_created: totalPriceRecords,
          final_database_count: finalCount
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
 * Parse XML price history from AvantLink API response - IMPROVED VERSION
 */
function parseXMLPriceHistory(xmlText: string): any[] {
  const priceHistory: any[] = []
  
  try {
    // Handle different types of responses
    if (xmlText.includes('No pricing history found') || xmlText.includes('Error:') || xmlText.length < 200) {
      console.log('⚠️ XML indicates no pricing history or error response')
      return []
    }

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
        const retailPriceStr = retailPriceMatch[1].trim()
        const salePriceStr = salePriceMatch[1].trim()
        
        // Validate numeric values
        const retailPrice = parseFloat(retailPriceStr)
        const salePrice = parseFloat(salePriceStr)
        
        if (isNaN(retailPrice) || isNaN(salePrice) || retailPrice <= 0 || salePrice <= 0) {
          console.log(`⚠️ Skipping invalid price data: retail=${retailPriceStr}, sale=${salePriceStr}`)
          continue
        }
        
        // Parse date (format: "2025-01-22 11:15:06" -> "2025-01-22")
        const recordedDate = dateStr.split(' ')[0]
        
        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(recordedDate)) {
          console.log(`⚠️ Skipping invalid date format: ${dateStr}`)
          continue
        }
        
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
    
    console.log(`📈 Successfully parsed ${priceHistory.length} valid price entries`)
    
  } catch (error) {
    console.error('❌ Error parsing XML:', error)
  }
  
  return priceHistory
}
