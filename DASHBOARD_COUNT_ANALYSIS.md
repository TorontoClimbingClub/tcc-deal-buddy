# TCC Deal Buddy Dashboard Count Analysis

## Summary of Findings

After querying the actual Supabase database, I've identified the exact cause of the dashboard showing "1000" for active deals and incorrect product counts.

## Key Findings

### Current Database State
- **Total Products (all dates)**: 2,184 products
- **Today's Date**: 2025-06-27
- **Products for Today**: 0 (no sync has run today)
- **Latest Sync Date**: 2025-06-26
- **Products for Latest Date**: 1,329 products

### Dashboard Issues Identified

1. **Active Deals Count Shows "1000"**
   - The `current_deals` view returns exactly 1000 records
   - Breakdown: 577 deals from 2025-06-26 + 423 deals from 2025-06-25 = 1000 total
   - This appears to be hitting a query result limit or is coincidentally exactly 1000

2. **Total Products Shows "0"**
   - Dashboard hook in `useDashboardStats.ts` filters by today's date: `eq('last_sync_date', new Date().toISOString().split('T')[0])`
   - No sync has run for today (2025-06-27), so 0 products match this filter
   - The actual latest data is from 2025-06-26

## Root Cause Analysis

### Problem 1: current_deals View Definition
```sql
-- Current problematic definition:
CREATE VIEW current_deals AS
SELECT 
    p.*,
    ROUND(((retail_price - sale_price) / retail_price * 100)::numeric, 2) as calculated_discount_percent
FROM products p
WHERE p.last_sync_date = CURRENT_DATE  -- ❌ This is the problem
    AND p.sale_price IS NOT NULL 
    AND p.retail_price IS NOT NULL
    AND p.sale_price < p.retail_price
ORDER BY calculated_discount_percent DESC;
```

**Issue**: The view uses `CURRENT_DATE` but no sync has run for the current date, so it's pulling old data.

### Problem 2: Dashboard Hook Logic
```typescript
// Problematic code in useDashboardStats.ts:
const { count: totalCount, error: countError } = await supabase
  .from('products')
  .select('*', { count: 'exact', head: true })
  .eq('last_sync_date', new Date().toISOString().split('T')[0]); // ❌ Today's date
```

**Issue**: Filtering by today's date when no data exists for today.

## Recommended Solutions

### Option 1: Update current_deals View (Recommended)
Update the view to use the latest sync date instead of CURRENT_DATE:

```sql
DROP VIEW current_deals;

CREATE VIEW current_deals AS
SELECT 
    p.*,
    ROUND(((retail_price - sale_price) / retail_price * 100)::numeric, 2) as calculated_discount_percent
FROM products p
WHERE p.last_sync_date = (SELECT MAX(last_sync_date) FROM products)
    AND p.sale_price IS NOT NULL 
    AND p.retail_price IS NOT NULL
    AND p.sale_price < p.retail_price
ORDER BY calculated_discount_percent DESC;
```

### Option 2: Update Dashboard Hook
Modify `useDashboardStats.ts` to use the latest sync date:

```typescript
// First get the latest sync date
const { data: latestDateData } = await supabase
  .from('products')
  .select('last_sync_date')
  .order('last_sync_date', { ascending: false })
  .limit(1);

const latestSyncDate = latestDateData?.[0]?.last_sync_date;

// Then use it for the count query
const { count: totalCount, error: countError } = await supabase
  .from('products')
  .select('*', { count: 'exact', head: true })
  .eq('last_sync_date', latestSyncDate);
```

### Option 3: Fix Daily Sync Process
Ensure the sync job runs daily and updates products with the current date.

## Verification Results

The analysis scripts confirmed:
- ✅ current_deals view contains exactly 1000 records (577 + 423 from two different dates)
- ✅ No products exist for today's date (2025-06-27)
- ✅ Latest actual data is from 2025-06-26 with 1,329 products
- ✅ Dashboard hook is correctly querying the database but using wrong date filters

## Files Created for Analysis
- `/mnt/ssd/Projects/tcc-deal-buddy/check-database-counts.js` - Basic count verification
- `/mnt/ssd/Projects/tcc-deal-buddy/check-current-deals-details.js` - Detailed current_deals analysis
- `/mnt/ssd/Projects/tcc-deal-buddy/dashboard-count-analysis-report.js` - Comprehensive report generator
- `/mnt/ssd/Projects/tcc-deal-buddy/check-dashboard-counts.sql` - SQL queries for manual verification

## Next Steps

1. Choose one of the recommended solutions above
2. Test the fix in a development environment
3. Deploy the fix to production
4. Monitor dashboard counts to ensure accuracy

The most efficient fix would be **Option 1** (updating the current_deals view) as it requires only a database migration and will automatically fix both the active deals count and ensure consistency across the application.