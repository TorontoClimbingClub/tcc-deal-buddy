# Price History Duplicate Analysis & Solutions

## Executive Summary

After analyzing the TCC Deal Buddy price history system, I've identified potential causes for duplicate price records and created comprehensive solutions to clean up existing duplicates and prevent future occurrences.

## Key Findings

### 1. Database Constraints Are Properly Configured ✅
- `price_history` table has UNIQUE constraint on `(product_sku, merchant_id, recorded_date)`
- Both sync functions use `upsert` with proper conflict resolution
- **This means true constraint violations shouldn't exist**

### 2. Potential Duplicate Causes Identified

#### A. Date/Timezone Issues 🎯 **Most Likely Cause**
- **Issue**: Different sync processes might record same logical date differently
- **Root Cause**: `new Date(historyItem.date).toISOString().split('T')[0]` parsing
- **Impact**: Same product could get multiple records if date parsing is inconsistent

#### B. Current Price Auto-Addition
```typescript
// In usePriceHistory.ts:71-86
const hasToday = historicalPrices.some(p => p.date === today);
if (!hasToday && product) {
  historicalPrices.push({...}) // Adds current price
}
```
- **Issue**: Frontend adds "current price" record that may conflict with actual sync data
- **Impact**: User sees duplicates for "today" even if database is clean

#### C. Multiple Data Sources
- `data_source: 'ProductPriceCheck'` (both price history syncs)
- `data_source: 'ProductSearch'` (from daily/weekly syncs)
- **Issue**: Same product synced from different sources on same day
- **Impact**: Last write wins, but users may see visual duplicates

#### D. API Response Inconsistencies
- AvantLink API might return duplicate date entries in XML
- **Issue**: XML parsing doesn't deduplicate within single response
- **Impact**: Multiple records for same date from single API call

## Solution Implementation

### 1. Analysis Scripts Created ✅

**`analyze-price-history-duplicates.sql`**
- 8 comprehensive analysis queries
- Identifies constraint violations, race conditions, data source conflicts
- Provides summary statistics and diagnostic information

**`clean-price-history-duplicates.sql`**
- Safe backup and preview before deletion
- Keeps most recent record for each duplicate group
- Includes prevention trigger function
- Post-cleanup verification queries

### 2. Root Cause Analysis

**The duplicate issue you're experiencing is likely NOT actual database duplicates**, but rather:

1. **Visual duplicates in the frontend** - price history chart shows current price + synced historical data
2. **Date parsing inconsistencies** - different date formats creating near-duplicate dates
3. **Multiple API calls** - same product synced multiple times with slight timing differences

### 3. Prevention Mechanisms

#### Database Level (Implemented)
```sql
-- Trigger function to prevent duplicates during INSERT
CREATE OR REPLACE FUNCTION prevent_price_history_duplicates()
-- Updates existing record instead of creating duplicate
-- Logs attempts for monitoring
```

#### Application Level (Recommended)
```typescript
// Enhanced date normalization
const normalizeDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`);
  }
  // Force UTC and format consistently
  return date.toISOString().split('T')[0];
};

// Deduplication within API response
const deduplicateByDate = (entries: PriceHistoryEntry[]): PriceHistoryEntry[] => {
  const seen = new Set<string>();
  return entries.filter(entry => {
    const key = `${entry.product_sku}|${entry.merchant_id}|${entry.recorded_date}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
```

## Recommended Action Plan

### Phase 1: Immediate Analysis
```bash
# Run analysis to understand current state
cd /mnt/ssd/Projects/tcc-deal-buddy
npx supabase db reset --linked
psql -f analyze-price-history-duplicates.sql
```

### Phase 2: Clean Existing Data (If Needed)
```bash
# Only if analysis shows actual duplicates
psql -f clean-price-history-duplicates.sql
# Review output, then uncomment deletion lines
```

### Phase 3: Enhanced Prevention
1. Update sync functions with better date normalization
2. Add deduplication logic within API responses
3. Fix frontend price history display logic
4. Add monitoring for duplicate attempts

### Phase 4: Monitoring
- Check sync job health views for duplicate creation patterns
- Monitor price history insertion logs
- Set up alerts for constraint violation attempts

## Technical Details

### Sync Function Analysis
- ✅ `price-history-sync/index.ts` - Uses proper upsert with conflict resolution
- ✅ `weekly-price-history-sync/index.ts` - Filters old dates, uses upsert
- ✅ Both functions use `onConflict: 'product_sku,merchant_id,recorded_date'`

### Date Handling Review
```typescript
// Current implementation (both sync functions)
const recordDate = new Date(historyItem.date).toISOString().split('T')[0]

// Potential issue: Different timezone interpretations
// Solution: Explicit UTC handling and validation
```

### Frontend Display Issue
The `usePriceHistory.ts` hook adds current price to historical data, which might create visual duplicates even when database is clean.

## Conclusion

The price history duplicate issue is likely a combination of:
1. **Frontend display logic** creating visual duplicates
2. **Date parsing inconsistencies** causing near-duplicate records
3. **API response variations** not being properly deduplicated

The database constraints are working correctly, but the application logic needs enhancement to handle edge cases and provide cleaner data presentation.

**Next Steps**: Run the analysis scripts to confirm the root cause, then implement the appropriate fixes based on the findings.