// Enhanced Price History Sync Functions - Duplicate Prevention
// This file contains improved versions of the sync logic with better duplicate prevention

interface PriceHistoryEntry {
  product_sku: string
  merchant_id: number
  price: number
  is_sale: boolean
  discount_percent?: number
  recorded_date: string
  price_change_reason?: string
  data_source: string
}

// Enhanced date normalization function
function normalizeDate(dateStr: string): string {
  // Handle various date formats and ensure UTC consistency
  let date: Date;
  
  // Try parsing the date string
  if (dateStr.includes('T') || dateStr.includes('Z')) {
    // ISO format or with time
    date = new Date(dateStr);
  } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // YYYY-MM-DD format - force UTC to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    date = new Date(Date.UTC(year, month - 1, day));
  } else if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    // MM/DD/YYYY format
    const [month, day, year] = dateStr.split('/').map(Number);
    date = new Date(Date.UTC(year, month - 1, day));
  } else {
    // Fallback to Date constructor
    date = new Date(dateStr);
  }
  
  // Validate the date
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }
  
  // Return normalized UTC date string (YYYY-MM-DD)
  return date.toISOString().split('T')[0];
}

// Enhanced deduplication function
function deduplicatePriceEntries(entries: PriceHistoryEntry[]): PriceHistoryEntry[] {
  const entryMap = new Map<string, PriceHistoryEntry>();
  
  for (const entry of entries) {
    const key = `${entry.product_sku}|${entry.merchant_id}|${entry.recorded_date}`;
    
    const existing = entryMap.get(key);
    if (!existing) {
      entryMap.set(key, entry);
    } else {
      // Keep the entry with better data quality
      const shouldReplace = (
        // Prefer entries with valid prices
        (entry.price > 0 && existing.price <= 0) ||
        // Prefer entries with discount information
        (entry.discount_percent > 0 && !existing.discount_percent) ||
        // Prefer ProductPriceCheck over other sources
        (entry.data_source === 'ProductPriceCheck' && existing.data_source !== 'ProductPriceCheck') ||
        // Prefer entries with price change reasons
        (entry.price_change_reason && !existing.price_change_reason)
      );
      
      if (shouldReplace) {
        entryMap.set(key, entry);
      }
    }
  }
  
  return Array.from(entryMap.values());
}

// Enhanced XML parsing with duplicate prevention
function parseAvantLinkXMLEnhanced(xmlText: string): Array<{date: string, retail_price: string, sale_price: string}> {
  try {
    const priceHistory: Array<{date: string, retail_price: string, sale_price: string}> = []
    const seenDates = new Set<string>()
    
    // Basic XML parsing - look for Table1 entries
    const table1Regex = /<Table1>(.*?)<\/Table1>/gs
    let match
    
    while ((match = table1Regex.exec(xmlText)) !== null) {
      const tableContent = match[1]
      
      // Extract date, retail_price, and sale_price
      const dateMatch = tableContent.match(/<Date>(.*?)<\/Date>/)
      const retailPriceMatch = tableContent.match(/<Retail_Price>(.*?)<\/Retail_Price>/)
      const salePriceMatch = tableContent.match(/<Sale_Price>(.*?)<\/Sale_Price>/)
      
      if (dateMatch && (retailPriceMatch || salePriceMatch)) {
        try {
          // Normalize the date to prevent timezone/format issues
          const normalizedDate = normalizeDate(dateMatch[1].trim())
          
          // Skip if we've already seen this date
          if (seenDates.has(normalizedDate)) {
            console.log(`Skipping duplicate date in XML: ${normalizedDate}`)
            continue
          }
          
          seenDates.add(normalizedDate)
          
          priceHistory.push({
            date: normalizedDate,
            retail_price: retailPriceMatch ? retailPriceMatch[1].trim() : (salePriceMatch ? salePriceMatch[1].trim() : '0'),
            sale_price: salePriceMatch ? salePriceMatch[1].trim() : (retailPriceMatch ? retailPriceMatch[1].trim() : '0')
          })
        } catch (dateError) {
          console.warn(`Invalid date in XML, skipping: ${dateMatch[1].trim()}`, dateError)
          continue
        }
      }
    }
    
    console.log(`Parsed ${priceHistory.length} unique price history entries from XML (deduplicated)`)
    return priceHistory
  } catch (error) {
    console.error('Error parsing XML:', error)
    return []
  }
}

// Enhanced price history processing function
function processHistoricalPricing(
  xmlData: Array<{date: string, retail_price: string, sale_price: string}>,
  productSku: string,
  merchantId: number,
  dataSource: string = 'ProductPriceCheck'
): PriceHistoryEntry[] {
  const historyEntries: PriceHistoryEntry[] = []
  
  // Filter out old dates (older than 1 year) early
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
  
  for (const historyItem of xmlData) {
    if (historyItem.sale_price && historyItem.date) {
      try {
        const salePrice = parseFloat(historyItem.sale_price)
        const retailPrice = parseFloat(historyItem.retail_price || historyItem.sale_price)
        
        // Validate prices
        if (salePrice <= 0 || retailPrice <= 0) {
          console.warn(`Invalid price data for ${productSku}: sale=${salePrice}, retail=${retailPrice}`)
          continue
        }
        
        const recordDate = historyItem.date // Already normalized by parseAvantLinkXMLEnhanced
        const recordDateTime = new Date(recordDate)
        
        // Skip if date is too old
        if (recordDateTime < oneYearAgo) {
          continue
        }
        
        // Determine if it was a sale based on retail vs sale price comparison
        const isSale = salePrice < retailPrice
        const discountPercent = isSale 
          ? Math.round(((retailPrice - salePrice) / retailPrice) * 100)
          : 0

        historyEntries.push({
          product_sku: productSku,
          merchant_id: merchantId,
          price: salePrice,
          is_sale: isSale,
          discount_percent: discountPercent,
          recorded_date: recordDate,
          price_change_reason: 'historical_sync',
          data_source: dataSource
        })
      } catch (error) {
        console.warn(`Error processing price history item for ${productSku}:`, error)
        continue
      }
    }
  }
  
  // Deduplicate within this product's entries
  return deduplicatePriceEntries(historyEntries)
}

// Enhanced upsert function with better conflict handling
async function upsertPriceHistoryEnhanced(
  supabaseClient: any,
  entries: PriceHistoryEntry[]
): Promise<{ success: number, conflicts: number, errors: number }> {
  let success = 0, conflicts = 0, errors = 0
  
  // Deduplicate entries before insertion
  const deduplicatedEntries = deduplicatePriceEntries(entries)
  
  if (deduplicatedEntries.length !== entries.length) {
    console.log(`Deduplicated ${entries.length} entries to ${deduplicatedEntries.length}`)
  }
  
  // Batch insert with proper error handling
  const batchSize = 100
  for (let i = 0; i < deduplicatedEntries.length; i += batchSize) {
    const batch = deduplicatedEntries.slice(i, i + batchSize)
    
    try {
      const { error: historyError } = await supabaseClient
        .from('price_history')
        .upsert(batch, {
          onConflict: 'product_sku,merchant_id,recorded_date'
        })

      if (historyError) {
        console.error(`Batch upsert error:`, historyError.message)
        errors += batch.length
      } else {
        success += batch.length
        console.log(`Successfully upserted batch of ${batch.length} price history entries`)
      }
    } catch (error) {
      console.error(`Batch processing error:`, error)
      errors += batch.length
    }
  }
  
  return { success, conflicts, errors }
}

// Enhanced monitoring and logging
function logDuplicateAttempt(
  productSku: string,
  merchantId: number,
  recordedDate: string,
  reason: string
) {
  console.warn(`DUPLICATE_ATTEMPT: SKU=${productSku}, Merchant=${merchantId}, Date=${recordedDate}, Reason=${reason}`)
  
  // TODO: Send to monitoring system
  // Could integrate with Supabase functions logging or external monitoring
}

// Example usage in sync function
async function exampleEnhancedSyncFunction(supabaseClient: any, xmlResponse: string, product: any) {
  try {
    // Parse XML with enhanced deduplication
    const priceHistoryData = parseAvantLinkXMLEnhanced(xmlResponse)
    
    // Process historical pricing with validation
    const historyEntries = processHistoricalPricing(
      priceHistoryData,
      product.sku,
      product.merchant_id,
      'ProductPriceCheck'
    )
    
    if (historyEntries.length > 0) {
      // Enhanced upsert with conflict tracking
      const result = await upsertPriceHistoryEnhanced(supabaseClient, historyEntries)
      
      console.log(`Price history sync result for ${product.sku}:`, result)
      
      return {
        processed: true,
        entries_added: result.success,
        conflicts_resolved: result.conflicts,
        errors: result.errors
      }
    }
    
    return { processed: false, reason: 'No valid price history data' }
    
  } catch (error) {
    console.error(`Enhanced sync function error for ${product.sku}:`, error)
    return { processed: false, reason: error.message }
  }
}

export {
  normalizeDate,
  deduplicatePriceEntries,
  parseAvantLinkXMLEnhanced,
  processHistoricalPricing,
  upsertPriceHistoryEnhanced,
  logDuplicateAttempt
};