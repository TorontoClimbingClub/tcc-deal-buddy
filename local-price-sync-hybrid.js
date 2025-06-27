// Local Price History Sync - Hybrid approach using Edge Functions for tracking
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()

const supabaseUrl = 'https://owtcaztrzujjuwwuldhl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE'

const AVANTLINK_AFFILIATE_ID = '348445'
const AVANTLINK_API_KEY = process.env.AVANTLINK_API_KEY || 'your-api-key'

const supabase = createClient(supabaseUrl, supabaseKey)

class HybridPriceSync {
  constructor() {
    this.totalProcessed = 0
    this.totalSuccessful = 0
    this.totalFailed = 0
    this.totalApiCalls = 0
    this.totalPriceRecords = 0
    this.startTime = Date.now()
  }

  async getProgress() {
    const { data: progress } = await supabase
      .from('price_sync_progress')
      .select('*')
      .single()
    return progress
  }

  async getNextBatch(batchSize = 20) {
    // Use Edge Function to get pending SKUs (has service role access)
    const { data: result, error } = await supabase.functions.invoke('comprehensive-price-backfill', {
      body: {
        action: 'get_next_batch',
        batch_size: batchSize
      }
    })

    if (error) {
      console.error('❌ Error getting next batch:', error.message)
      return []
    }

    return result?.next_skus_to_process || []
  }

  async updateSKUStatus(sku, merchantId, status, errorMessage = null, priceRecordCount = 0) {
    // Use Edge Function to update status (has service role access)
    const { data: result, error } = await supabase.functions.invoke('comprehensive-price-backfill', {
      body: {
        action: 'update_status',
        sku,
        merchant_id: merchantId,
        status,
        error_message: errorMessage,
        price_record_count: priceRecordCount
      }
    })

    if (error) {
      console.error(`❌ Error updating ${sku} status:`, error.message)
    }

    return result
  }

  async fetchPriceHistory(sku, merchantId) {
    const apiUrl = new URL('https://classic.avantlink.com/api.php')
    apiUrl.searchParams.set('module', 'ProductPriceCheck')
    apiUrl.searchParams.set('affiliate_id', AVANTLINK_AFFILIATE_ID)
    apiUrl.searchParams.set('merchant_id', merchantId.toString())
    apiUrl.searchParams.set('sku', sku)
    apiUrl.searchParams.set('show_pricing_history', '1')
    apiUrl.searchParams.set('show_retail_price', '1')
    apiUrl.searchParams.set('output', 'xml')

    const response = await fetch(apiUrl.toString())
    this.totalApiCalls++

    if (!response.ok) {
      throw new Error(`AvantLink API error: ${response.status} ${response.statusText}`)
    }

    const xmlText = await response.text()
    return this.parseXMLPriceHistory(xmlText)
  }

  parseXMLPriceHistory(xmlText) {
    const priceHistory = []
    
    try {
      if (xmlText.includes('No pricing history found') || xmlText.includes('Error:') || xmlText.length < 200) {
        return []
      }

      const table1Regex = /<Table1>(.*?)<\/Table1>/gs
      let match
      
      while ((match = table1Regex.exec(xmlText)) !== null) {
        const tableContent = match[1]
        
        const dateMatch = tableContent.match(/<Date>(.*?)<\/Date>/)
        const retailPriceMatch = tableContent.match(/<Retail_Price>(.*?)<\/Retail_Price>/)
        const salePriceMatch = tableContent.match(/<Sale_Price>(.*?)<\/Sale_Price>/)
        
        if (dateMatch && retailPriceMatch && salePriceMatch) {
          const dateStr = dateMatch[1].trim()
          const retailPrice = parseFloat(retailPriceMatch[1].trim())
          const salePrice = parseFloat(salePriceMatch[1].trim())
          
          if (isNaN(retailPrice) || isNaN(salePrice) || retailPrice <= 0 || salePrice <= 0) {
            continue
          }
          
          const recordedDate = dateStr.split(' ')[0]
          
          if (!/^\d{4}-\d{2}-\d{2}$/.test(recordedDate)) {
            continue
          }
          
          const isSale = salePrice < retailPrice
          const discountPercent = isSale ? Math.round(((retailPrice - salePrice) / retailPrice) * 100) : 0
          
          priceHistory.push({
            date: recordedDate,
            price: salePrice,
            is_sale: isSale,
            discount_percent: discountPercent
          })
        }
      }
      
      priceHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      
    } catch (error) {
      console.error('❌ Error parsing XML:', error)
    }
    
    return priceHistory
  }

  async storePriceHistory(sku, merchantId, priceHistory) {
    if (priceHistory.length === 0) return 0

    // Deduplicate by date
    const uniqueEntries = new Map()
    priceHistory.forEach(entry => {
      const key = `${sku}-${merchantId}-${entry.date}`
      if (!uniqueEntries.has(key) || entry.price < uniqueEntries.get(key).price) {
        uniqueEntries.set(key, {
          product_sku: sku,
          merchant_id: merchantId,
          price: entry.price,
          is_sale: entry.is_sale,
          discount_percent: entry.discount_percent,
          recorded_date: entry.date
        })
      }
    })

    const deduplicatedEntries = Array.from(uniqueEntries.values())

    const { error } = await supabase
      .from('price_history')
      .upsert(deduplicatedEntries, {
        onConflict: 'product_sku,merchant_id,recorded_date'
      })

    if (error) {
      throw new Error(`Failed to store price history: ${error.message}`)
    }

    return deduplicatedEntries.length
  }

  async processSKU(sku, merchantId) {
    try {
      console.log(`🔄 Processing ${sku}...`)
      
      // Mark as processing via Edge Function
      await this.updateSKUStatus(sku, merchantId, 'processing')
      
      // Fetch price history from AvantLink
      const priceHistory = await this.fetchPriceHistory(sku, merchantId)
      
      if (priceHistory.length > 0) {
        // Store in database
        const recordCount = await this.storePriceHistory(sku, merchantId, priceHistory)
        await this.updateSKUStatus(sku, merchantId, 'completed', null, recordCount)
        
        this.totalPriceRecords += recordCount
        this.totalSuccessful++
        console.log(`✅ ${sku}: ${recordCount} price records stored`)
      } else {
        await this.updateSKUStatus(sku, merchantId, 'no_data')
        this.totalSuccessful++
        console.log(`ℹ️  ${sku}: No price history available`)
      }
      
    } catch (error) {
      await this.updateSKUStatus(sku, merchantId, 'failed', error.message)
      this.totalFailed++
      console.error(`❌ ${sku}: ${error.message}`)
    }
    
    this.totalProcessed++
  }

  async showProgress() {
    const progress = await this.getProgress()
    
    if (progress) {
      const elapsed = Math.round((Date.now() - this.startTime) / 1000)
      const rate = this.totalProcessed / (elapsed / 60)
      
      console.log(`\n📊 Progress Update:`)
      console.log(`   Completion: ${progress.completion_percentage}% (${progress.completed}/${progress.total_skus})`)
      console.log(`   Session: ${this.totalProcessed} processed, ${this.totalSuccessful} successful, ${this.totalFailed} failed`)
      console.log(`   API calls: ${this.totalApiCalls}, Price records: ${this.totalPriceRecords}`)
      console.log(`   Rate: ${rate.toFixed(1)} SKUs/min, Elapsed: ${Math.floor(elapsed/60)}m ${elapsed%60}s`)
      console.log(`   Remaining: ${progress.pending} pending, ${progress.failed} failed\n`)
    }
  }

  async run(batchSize = 20, maxBatches = null) {
    console.log('🚀 Hybrid Local Price History Sync Starting...\n')
    
    const initialProgress = await this.getProgress()
    if (initialProgress) {
      console.log('📊 Initial Progress:')
      console.log(`   Completion: ${initialProgress.completion_percentage}% (${initialProgress.completed}/${initialProgress.total_skus})`)
      console.log(`   Pending: ${initialProgress.pending}, Failed: ${initialProgress.failed}\n`)
      
      if (initialProgress.pending === 0) {
        console.log('🎉 All SKUs have been processed!')
        return
      }
    }
    
    let batchNumber = 1
    
    while (maxBatches === null || batchNumber <= maxBatches) {
      console.log(`--- Batch ${batchNumber} ---`)
      
      const batch = await this.getNextBatch(batchSize)
      
      if (batch.length === 0) {
        console.log('🎉 No more pending SKUs - sync complete!')
        break
      }
      
      console.log(`Processing ${batch.length} SKUs...`)
      
      for (const item of batch) {
        await this.processSKU(item.sku, item.merchant_id)
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      await this.showProgress()
      
      batchNumber++
      
      if (batch.length === batchSize) {
        console.log('⏱️  Pausing 3 seconds between batches...')
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    }
    
    console.log('\n🎯 Hybrid local sync completed!')
    await this.showProgress()
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2)
  const batchSize = parseInt(args[0]) || 20
  const maxBatches = args[1] ? parseInt(args[1]) : null
  
  if (AVANTLINK_API_KEY === 'your-api-key') {
    console.log('❌ Please set AVANTLINK_API_KEY in your .env.local file')
    process.exit(1)
  }
  
  console.log(`🚀 Starting hybrid price sync (batch size: ${batchSize}${maxBatches ? `, max batches: ${maxBatches}` : ', unlimited batches'})...`)
  
  const sync = new HybridPriceSync()
  await sync.run(batchSize, maxBatches)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { HybridPriceSync }