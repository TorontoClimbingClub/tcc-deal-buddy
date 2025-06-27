// Local Price History Sync - Processes AvantLink API calls outside Supabase constraints
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()

const supabaseUrl = 'https://owtcaztrzujjuwwuldhl.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE'

// AvantLink API credentials
const AVANTLINK_AFFILIATE_ID = process.env.AVANTLINK_AFFILIATE_ID || '348445'
const AVANTLINK_API_KEY = process.env.AVANTLINK_API_KEY || 'your-api-key'

const supabase = createClient(supabaseUrl, supabaseKey)

class LocalPriceSync {
  constructor() {
    this.totalProcessed = 0
    this.totalSuccessful = 0
    this.totalFailed = 0
    this.totalApiCalls = 0
    this.totalPriceRecords = 0
    this.startTime = Date.now()
  }

  async initialize() {
    console.log('🚀 Local Price History Sync Starting...\n')
    
    // Get initial progress
    const { data: progress } = await supabase
      .from('price_sync_progress')
      .select('*')
      .single()
    
    if (progress) {
      console.log('📊 Current Progress:')
      console.log(`   Total SKUs: ${progress.total_skus}`)
      console.log(`   Completed: ${progress.completed} (${progress.completion_percentage}%)`)
      console.log(`   Pending: ${progress.pending}`)
      console.log(`   Failed: ${progress.failed}`)
      console.log(`   Processing: ${progress.processing}`)
      console.log(`   Total API calls made: ${progress.total_api_calls_made}\n`)
      
      if (progress.pending === 0) {
        console.log('🎉 All SKUs have been processed!')
        return false
      }
    }
    
    return true
  }

  async getNextBatch(batchSize = 20) {
    const { data: pendingSKUs, error } = await supabase
      .from('sku_api_tracking')
      .select('sku, merchant_id, api_call_count, last_api_call')
      .eq('status', 'pending')
      .order('api_call_count', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(batchSize)
    
    if (error) {
      console.error('❌ Error fetching pending SKUs:', error.message)
      return []
    }
    
    return pendingSKUs || []
  }

  async markAsProcessing(sku, merchantId) {
    const { error } = await supabase
      .from('sku_api_tracking')
      .update({
        status: 'processing',
        last_api_call: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('sku', sku)
      .eq('merchant_id', merchantId)
    
    if (error) {
      console.error(`❌ Error marking ${sku} as processing:`, error.message)
    }
  }

  async markAsCompleted(sku, merchantId, priceRecordCount = 0) {
    // Get current API call count
    const { data: current } = await supabase
      .from('sku_api_tracking')
      .select('api_call_count')
      .eq('sku', sku)
      .eq('merchant_id', merchantId)
      .single()
    
    const newCount = (current?.api_call_count || 0) + 1
    
    const { error } = await supabase
      .from('sku_api_tracking')
      .update({
        status: 'completed',
        last_successful_call: new Date().toISOString(),
        api_call_count: newCount,
        updated_at: new Date().toISOString(),
        error_message: null
      })
      .eq('sku', sku)
      .eq('merchant_id', merchantId)
    
    if (error) {
      console.error(`❌ Error marking ${sku} as completed:`, error.message)
    }
  }

  async markAsNoData(sku, merchantId) {
    const { data: current } = await supabase
      .from('sku_api_tracking')
      .select('api_call_count')
      .eq('sku', sku)
      .eq('merchant_id', merchantId)
      .single()
    
    const newCount = (current?.api_call_count || 0) + 1
    
    const { error } = await supabase
      .from('sku_api_tracking')
      .update({
        status: 'no_data',
        last_successful_call: new Date().toISOString(),
        api_call_count: newCount,
        updated_at: new Date().toISOString(),
        error_message: null
      })
      .eq('sku', sku)
      .eq('merchant_id', merchantId)
    
    if (error) {
      console.error(`❌ Error marking ${sku} as no_data:`, error.message)
    }
  }

  async markAsFailed(sku, merchantId, errorMessage) {
    const { data: current } = await supabase
      .from('sku_api_tracking')
      .select('api_call_count')
      .eq('sku', sku)
      .eq('merchant_id', merchantId)
      .single()
    
    const newCount = (current?.api_call_count || 0) + 1
    
    const { error } = await supabase
      .from('sku_api_tracking')
      .update({
        status: 'failed',
        api_call_count: newCount,
        error_message: errorMessage,
        updated_at: new Date().toISOString()
      })
      .eq('sku', sku)
      .eq('merchant_id', merchantId)
    
    if (error) {
      console.error(`❌ Error marking ${sku} as failed:`, error.message)
    }
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
      // Handle error responses
      if (xmlText.includes('No pricing history found') || xmlText.includes('Error:') || xmlText.length < 200) {
        return []
      }

      // Extract Table1 entries using regex
      const table1Regex = /<Table1>(.*?)<\/Table1>/gs
      let match
      
      while ((match = table1Regex.exec(xmlText)) !== null) {
        const tableContent = match[1]
        
        const dateMatch = tableContent.match(/<Date>(.*?)<\/Date>/)
        const retailPriceMatch = tableContent.match(/<Retail_Price>(.*?)<\/Retail_Price>/)
        const salePriceMatch = tableContent.match(/<Sale_Price>(.*?)<\/Sale_Price>/)
        
        if (dateMatch && retailPriceMatch && salePriceMatch) {
          const dateStr = dateMatch[1].trim()
          const retailPriceStr = retailPriceMatch[1].trim()
          const salePriceStr = salePriceMatch[1].trim()
          
          const retailPrice = parseFloat(retailPriceStr)
          const salePrice = parseFloat(salePriceStr)
          
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
      
      // Sort by date (oldest first)
      priceHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      
    } catch (error) {
      console.error('❌ Error parsing XML:', error)
    }
    
    return priceHistory
  }

  async storePriceHistory(sku, merchantId, priceHistory) {
    if (priceHistory.length === 0) return 0

    // Deduplicate by date - keep lowest price for each date
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
      
      // Mark as processing
      await this.markAsProcessing(sku, merchantId)
      
      // Fetch price history from AvantLink
      const priceHistory = await this.fetchPriceHistory(sku, merchantId)
      
      if (priceHistory.length > 0) {
        // Store in database
        const recordCount = await this.storePriceHistory(sku, merchantId, priceHistory)
        await this.markAsCompleted(sku, merchantId, recordCount)
        
        this.totalPriceRecords += recordCount
        this.totalSuccessful++
        console.log(`✅ ${sku}: ${recordCount} price records stored`)
      } else {
        await this.markAsNoData(sku, merchantId)
        this.totalSuccessful++
        console.log(`ℹ️  ${sku}: No price history available`)
      }
      
    } catch (error) {
      await this.markAsFailed(sku, merchantId, error.message)
      this.totalFailed++
      console.error(`❌ ${sku}: ${error.message}`)
    }
    
    this.totalProcessed++
  }

  async showProgress() {
    const { data: progress } = await supabase
      .from('price_sync_progress')
      .select('*')
      .single()
    
    if (progress) {
      const elapsed = Math.round((Date.now() - this.startTime) / 1000)
      const rate = this.totalProcessed / (elapsed / 60) // per minute
      
      console.log(`\n📊 Progress Update:`)
      console.log(`   Completion: ${progress.completion_percentage}% (${progress.completed}/${progress.total_skus})`)
      console.log(`   Session: ${this.totalProcessed} processed, ${this.totalSuccessful} successful, ${this.totalFailed} failed`)
      console.log(`   API calls: ${this.totalApiCalls}, Price records: ${this.totalPriceRecords}`)
      console.log(`   Rate: ${rate.toFixed(1)} SKUs/min, Elapsed: ${Math.floor(elapsed/60)}m ${elapsed%60}s`)
      console.log(`   Remaining: ${progress.pending} pending, ${progress.failed} failed\n`)
    }
  }

  async run(batchSize = 20, maxBatches = null) {
    if (!(await this.initialize())) {
      return
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
        
        // Rate limiting - 500ms between requests
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      await this.showProgress()
      
      batchNumber++
      
      // Longer pause between batches
      if (batch.length === batchSize) {
        console.log('⏱️  Pausing 3 seconds between batches...')
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    }
    
    console.log('\n🎯 Local sync session completed!')
    await this.showProgress()
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2)
  const batchSize = parseInt(args[0]) || 20
  const maxBatches = args[1] ? parseInt(args[1]) : null
  
  console.log(`🚀 Starting local price sync (batch size: ${batchSize}${maxBatches ? `, max batches: ${maxBatches}` : ', unlimited batches'})...`)
  
  const sync = new LocalPriceSync()
  await sync.run(batchSize, maxBatches)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { LocalPriceSync }