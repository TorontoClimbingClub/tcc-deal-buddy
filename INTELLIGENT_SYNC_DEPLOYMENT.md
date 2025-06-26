# Intelligent Sync System Deployment Guide

## 🚀 Overview

The TCC Deal Buddy sync system has been consolidated from multiple separate functions into a single, intelligent, parameter-driven sync function that handles all synchronization needs.

## 📊 Consolidation Summary

**Before:**
- `daily-sync` - Sale items only, single merchant
- `full-catalog-sync` - All items, multiple merchants  
- `price-history-sync` - Historical data backfill
- Basic cron job calling one function

**After:**
- `intelligent-sync` - Unified function with 5 configurable modes
- Smart cron scheduling with 4 automated jobs
- Enhanced monitoring and health tracking

## 🎯 Sync Modes

### 1. Daily Mode (`daily`)
- **Trigger**: Every day at 6:00 AM EST (11:00 AM UTC)
- **Scope**: Sale items only (`search_on_sale_only=1`)
- **Search**: Single wildcard search (`*`)
- **Volume**: 200 products per merchant max
- **Purpose**: Fast daily refresh of current deals

### 2. Weekly Mode (`weekly`) 
- **Trigger**: Sundays at 2:00 AM EST (7:00 AM UTC)
- **Scope**: All products (sale + regular)
- **Search**: Multi-term (`*`, `climbing`, `hiking`, `camping`, `outdoor`)
- **Volume**: 1,000 products per merchant max
- **Purpose**: Comprehensive catalog refresh

### 3. Full Mode (`full`)
- **Trigger**: Manual/on-demand
- **Scope**: All products with extensive search
- **Search**: 7 search terms including `gear`, `equipment`
- **Volume**: 2,000 products per merchant max  
- **Purpose**: Complete inventory sync

### 4. Sale Only Mode (`sale_only`)
- **Trigger**: Twice daily at 10:00 AM and 4:00 PM EST
- **Scope**: Enhanced sale item discovery
- **Search**: Sale-focused terms (`*`, `clearance`, `sale`)
- **Volume**: 500 products per merchant max
- **Purpose**: Maximize deal discovery during peak hours

### 5. Favorites Mode (`favorites`)
- **Trigger**: Manual/on-demand
- **Scope**: High-priority categories only
- **Search**: Targeted (`climbing`, `mountaineering`)
- **Volume**: 300 products per merchant max
- **Purpose**: Priority items for climbing community

## 🏗️ Deployment Status

✅ **Function Deployed**: `intelligent-sync` is live on Supabase  
⏳ **Cron Setup**: Ready to apply `intelligent-cron.sql`  
⏳ **Legacy Cleanup**: Old functions can be removed  

## 📋 Next Steps

### 1. Apply Cron Configuration
```sql
-- Run this in Supabase SQL Editor:
-- File: supabase/functions/_shared/intelligent-cron.sql
```

### 2. Test the Function
```bash
# Test daily mode
curl -X POST https://owtcaztrzujjuwwuldhl.supabase.co/functions/v1/intelligent-sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"mode": "daily"}'

# Test with custom options
curl -X POST https://owtcaztrzujjuwwuldhl.supabase.co/functions/v1/intelligent-sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"mode": "sale_only", "merchants": [9272], "maxProductsPerMerchant": 100}'
```

### 3. Monitor Health
```sql
-- Check sync job health
SELECT * FROM sync_job_health;

-- View recent sync jobs
SELECT * FROM sync_jobs 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY created_at DESC;
```

## 🔧 Configuration Options

The function accepts these parameters:

```typescript
interface SyncOptions {
  mode?: 'daily' | 'weekly' | 'full' | 'sale_only' | 'favorites'
  merchants?: number[]           // Default: [9272, 18557, 31349]
  categories?: string[]          // Optional category filter
  maxProductsPerMerchant?: number // Override strategy default
  forceFullSync?: boolean        // Ignore existing data
}
```

## 📈 Performance Improvements

- **Single codebase**: Easier maintenance and consistency
- **Smart deduplication**: Prevents duplicate products within merchants
- **Rate limiting**: Built-in delays to respect API limits
- **Error isolation**: Merchant failures don't affect others
- **Priority-based processing**: High-value merchants sync first
- **Comprehensive logging**: Detailed metrics and monitoring

## 🔄 Migration Benefits

1. **Reduced complexity**: 3 functions → 1 function
2. **Better scheduling**: 1 cron job → 4 targeted schedules  
3. **Enhanced monitoring**: Basic logging → comprehensive health tracking
4. **Flexible operation**: Fixed behavior → parameter-driven modes
5. **Improved reliability**: Basic error handling → robust fault tolerance

## 📊 Expected API Usage

- **Daily sync**: ~50-100 API calls/day
- **Sale sync**: ~100-200 API calls/day (2x daily)
- **Weekly sync**: ~500-1000 API calls/week
- **Total estimated**: ~1,500-2,500 API calls/week vs 15,000 limit (10-17% utilization)

This leaves plenty of headroom for manual syncs and additional features.