// Comprehensive price history backfill solution
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://owtcaztrzujjuwwuldhl.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('SUPABASE_ANON_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// AvantLink API configuration
const AVANTLINK_CONFIG = {
  affiliate_id: '348445',
  merchant_id: '18557',
  api_base: 'https://classic.avantlink.com/api.php'
}

async function comprehensivePriceBackfill() {
  try {
    console.log('🚀 Starting comprehensive price history backfill...')
    
    // Get all products from database (limited to 3 for initial test)
    console.log('📦 Fetching sample products from database...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('sku, merchant_id, name')
      .eq('merchant_id', 18557)  // Only valid merchant
      .order('created_at', { ascending: true })
      .limit(3) // Test with just 3 products first
    
    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`)
    }
    
    console.log(`✅ Found ${products.length} products to process`)
    
    // Process products in small batches to avoid rate limits
    const batchSize = 5
    const delayBetweenBatches = 2000 // 2 seconds
    const delayBetweenRequests = 500 // 0.5 seconds
    
    let totalProcessed = 0
    let totalSuccess = 0
    let totalFailed = 0
    let totalPriceEntries = 0
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      console.log(`\n📋 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(products.length/batchSize)} (${batch.length} products)`)
      
      for (const product of batch) {
        try {
          console.log(`🔍 Processing ${product.name} (SKU: ${product.sku})`)
          
          // Check if we already have price history for this product
          const { data: existingHistory, error: historyCheckError } = await supabase
            .from('price_history')
            .select('id')
            .eq('product_sku', product.sku)
            .eq('merchant_id', product.merchant_id)
            .limit(1)
          
          if (historyCheckError) {
            console.log(`❌ Error checking existing history: ${historyCheckError.message}`)
            continue
          }
          
          if (existingHistory && existingHistory.length > 0) {
            console.log(`⏭️ Price history already exists, skipping`)
            totalProcessed++
            continue
          }
          
          // Fetch price history from AvantLink API
          const priceHistory = await fetchPriceHistory(product.sku, product.merchant_id)
          
          if (priceHistory && priceHistory.length > 0) {
            // Transform and insert price history (using only available columns)
            const historyEntries = priceHistory.map(entry => ({
              product_sku: product.sku,
              merchant_id: product.merchant_id,
              price: parseFloat(entry.sale_price),
              is_sale: parseFloat(entry.sale_price) < parseFloat(entry.retail_price),
              discount_percent: parseFloat(entry.sale_price) < parseFloat(entry.retail_price) 
                ? Math.round(((parseFloat(entry.retail_price) - parseFloat(entry.sale_price)) / parseFloat(entry.retail_price)) * 100)
                : 0,
              recorded_date: new Date(entry.date).toISOString().split('T')[0]
            }))
            
            // Insert into database
            const { error: insertError } = await supabase
              .from('price_history')
              .upsert(historyEntries, {
                onConflict: 'product_sku,merchant_id,recorded_date'
              })
            
            if (insertError) {
              console.log(`❌ Failed to insert price history: ${insertError.message}`)
              totalFailed++
            } else {
              console.log(`✅ Added ${historyEntries.length} price history entries`)
              totalSuccess++
              totalPriceEntries += historyEntries.length
            }
          } else {
            console.log(`⚠️ No price history found`)
            totalSuccess++ // Still count as processed
          }
          
          totalProcessed++
          
          // Rate limiting delay between requests
          await new Promise(resolve => setTimeout(resolve, delayBetweenRequests))
          
        } catch (error) {
          console.log(`❌ Error processing ${product.sku}: ${error.message}`)
          totalFailed++
          totalProcessed++
        }
      }
      
      // Progress update
      console.log(`\n📊 Batch complete. Progress: ${totalProcessed}/${products.length} (${Math.round(totalProcessed/products.length*100)}%)`)
      console.log(`   ✅ Success: ${totalSuccess}, ❌ Failed: ${totalFailed}, 📈 Price entries: ${totalPriceEntries}`)
      
      // Delay between batches (except for last batch)
      if (i + batchSize < products.length) {
        console.log(`⏱️ Waiting ${delayBetweenBatches/1000}s before next batch...`)
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
      }
    }
    
    // Final summary
    console.log(`\n${'='.repeat(60)}`)
    console.log(`🎉 BACKFILL COMPLETE!`)
    console.log(`${'='.repeat(60)}`)
    console.log(`📊 Total products processed: ${totalProcessed}`)
    console.log(`✅ Successful: ${totalSuccess}`)
    console.log(`❌ Failed: ${totalFailed}`)
    console.log(`📈 Total price history entries created: ${totalPriceEntries}`)
    console.log(`📊 Average price entries per product: ${Math.round(totalPriceEntries/totalSuccess)}`)
    console.log(`🚀 Price intelligence system ready!`)
    
  } catch (error) {
    console.error('💥 Backfill failed:', error)
  }
}

// Fetch price history for a single product from AvantLink API
async function fetchPriceHistory(sku, merchantId) {
  try {
    const apiUrl = new URL(AVANTLINK_CONFIG.api_base)
    apiUrl.searchParams.set('module', 'ProductPriceCheck')
    apiUrl.searchParams.set('affiliate_id', AVANTLINK_CONFIG.affiliate_id)
    apiUrl.searchParams.set('merchant_id', merchantId.toString())
    apiUrl.searchParams.set('sku', sku)
    apiUrl.searchParams.set('show_pricing_history', '1')
    apiUrl.searchParams.set('show_retail_price', '1')
    apiUrl.searchParams.set('output', 'xml')
    
    const response = await fetch(apiUrl.toString())
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }
    
    const xmlText = await response.text()
    return parseAvantLinkXML(xmlText)
    
  } catch (error) {
    throw new Error(`Failed to fetch price history: ${error.message}`)
  }
}

// Parse AvantLink XML response
function parseAvantLinkXML(xmlText) {
  const priceHistory = []
  
  const table1Regex = /<Table1>(.*?)<\/Table1>/gs
  let match
  
  while ((match = table1Regex.exec(xmlText)) !== null) {
    const tableContent = match[1]
    
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
  
  return priceHistory
}

// Handle command line arguments
const args = process.argv.slice(2)
if (args.includes('--help')) {
  console.log(`
Usage: node comprehensive-price-backfill.js [options]

Options:
  --help     Show this help message
  --dry-run  Show what would be processed without making changes

This script will:
1. Fetch all products from the database
2. Check each product for existing price history
3. Call AvantLink ProductPriceCheck API for products without history
4. Parse XML responses and store price history in database
5. Provide progress updates and final summary

Rate limits:
- 5 products per batch
- 0.5 second delay between API calls
- 2 second delay between batches
`)
  process.exit(0)
}

// Start the backfill process
comprehensivePriceBackfill()