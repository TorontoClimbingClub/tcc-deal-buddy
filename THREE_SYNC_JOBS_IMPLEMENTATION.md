# Three Separate Sync Jobs Implementation

## Overview

Successfully implemented separate monitoring and management for three distinct sync job types in TCC Deal Buddy:

1. **Daily Sales Sync** - Fast, sale items only
2. **Weekly Catalog Sync** - Comprehensive, all products  
3. **Weekly Price History Sync** - Historical data collection

## Implementation Summary

### ✅ Completed Tasks

#### 1. Database Schema Enhancement
- **File**: `supabase/migrations/20250628050337_enhance_sync_jobs_monitoring.sql`
- **Added Columns**: `job_subtype`, `scheduled_time`, `last_run_duration_ms`, `merchant_ids`, `categories_synced`, `products_added`, `products_updated`, `price_history_entries`, `avg_processing_time_ms`, `success_rate`
- **Updated Constraints**: New job types (`daily_sales`, `weekly_catalog`, `price_history`)
- **Monitoring Views**: Individual health views for each job type + combined overview

#### 2. Dedicated Edge Functions
Created three optimized edge functions:

**Daily Sales Sync** (`supabase/functions/daily-sales-sync/index.ts`):
- Focus: Sale items only (`search_on_sale_only=1`)
- Target: Fast daily refresh of current deals
- Merchants: MEC (9272), Mountain Equipment Coop (18557)
- Features: Enhanced image prioritization, automatic price history for sales

**Weekly Catalog Sync** (`supabase/functions/weekly-catalog-sync/index.ts`):
- Focus: Comprehensive catalog coverage (all products)
- Target: Complete product inventory refresh
- Search Terms: 8 different terms for maximum coverage
- Features: Pagination, deduplication, batch processing, comprehensive categories

**Weekly Price History Sync** (`supabase/functions/weekly-price-history-sync/index.ts`):
- Focus: Historical price data for priority products
- Target: Products with high priority, recent syncs, or significant discounts
- Features: XML parsing, batch processing, 1-year history limit

#### 3. Cron Job Scheduling
- **File**: `supabase/functions/_shared/three-job-cron.sql`
- **Daily Sales**: 6:00 AM EST daily (11:00 UTC)
- **Weekly Catalog**: 2:00 AM EST Sundays (7:00 UTC)
- **Price History**: 4:00 AM EST Sundays (9:00 UTC)
- **Features**: Individual job scheduling, comprehensive monitoring view

#### 4. Enhanced Debug Page Monitoring
- **File**: `src/pages/Debug.tsx`
- **New Tab**: "Sync Health" - Individual health status for each job type
- **Enhanced Tab**: "Sync Jobs" - Detailed metrics display
- **Test Functions**: Individual test buttons for each sync job type
- **Features**: Real-time health monitoring, success rates, performance metrics

#### 5. Health Monitoring Views
**Individual Views**:
- `daily_sales_health`
- `weekly_catalog_health` 
- `price_history_health`

**Combined View**: `three_sync_jobs_status`

**Metrics Tracked**:
- Total runs, success/failure counts, success rates
- Average processing time, records processed, API calls
- Health status (healthy/unhealthy/stale/unknown)
- Last successful/failed run timestamps

## Architecture Benefits

### 1. Clear Separation of Concerns
- **Daily Sales**: Optimized for speed and current deals
- **Weekly Catalog**: Optimized for comprehensive coverage
- **Price History**: Optimized for detailed historical analysis

### 2. Independent Monitoring
- Each job type has dedicated health tracking
- Individual success rates and performance metrics
- Separate failure handling and alerting

### 3. Scalable Scheduling
- Non-conflicting schedules (daily vs weekly)
- Staggered Sunday execution (2 AM catalog, 4 AM history)
- Individual job control and management

### 4. Enhanced Frontend Monitoring
- Visual health status dashboard
- Individual job testing capabilities
- Comprehensive metrics display
- Real-time status updates

## API Usage Optimization

### Expected Weekly Usage:
- **Daily Sales**: ~50-100 calls/day × 7 = 350-700 calls/week
- **Weekly Catalog**: ~500-1000 calls/week
- **Price History**: ~200 calls/week
- **Total**: ~1,050-1,900 calls/week (vs 15,000 limit = 7-13% utilization)

## Testing & Validation

### Individual Test Functions:
1. `testDailySalesSync()` - Tests sale-only sync
2. `testWeeklyCatalogSync()` - Tests comprehensive catalog sync  
3. `testPriceHistorySync()` - Tests historical data sync (limited to 10 products)

### Monitoring Dashboard:
- Real-time health status for all three jobs
- Success rates, performance metrics
- Last run information and scheduling details

## Pending Tasks

### ⏳ Database Migration Application
- **Status**: Migration created but not yet applied to remote database
- **Requires**: Database access credentials or Supabase CLI login
- **File**: `supabase/migrations/20250628050337_enhance_sync_jobs_monitoring.sql`

### ⏳ Individual Job Testing
- **Status**: Test functions created in Debug page
- **Requires**: Remote database access and edge function deployment
- **Plan**: Use Debug page test buttons to validate each sync job

## Deployment Checklist

### Prerequisites:
1. ✅ Database schema migration ready
2. ✅ Edge functions implemented
3. ✅ Cron scheduling configuration ready
4. ✅ Frontend monitoring enhanced

### Deployment Steps:
1. **Apply Migration**: `npx supabase db push`
2. **Deploy Edge Functions**: Deploy the three new sync functions
3. **Apply Cron Jobs**: Execute `three-job-cron.sql`
4. **Test Individual Jobs**: Use Debug page test functions
5. **Validate Monitoring**: Confirm health views are working

## Technical Stack

- **Database**: Enhanced PostgreSQL schema with monitoring views
- **Backend**: Deno Edge Functions with TypeScript
- **Frontend**: React + TypeScript + ShadCN UI + TailwindCSS
- **Scheduling**: PostgreSQL pg_cron extension
- **Monitoring**: Custom health views + React dashboard
- **API Integration**: AvantLink ProductSearch + ProductPriceCheck APIs

## Success Metrics

### Operational:
- ✅ Three distinct job types with separate monitoring
- ✅ Individual health tracking and alerting
- ✅ Non-conflicting automated scheduling
- ✅ Comprehensive frontend monitoring

### Technical:
- ✅ Optimized API usage (7-13% of daily limit)
- ✅ Enhanced error handling and recovery
- ✅ Scalable architecture for future job types
- ✅ Professional monitoring dashboard

This implementation provides robust, scalable, and individually monitored sync job management for TCC Deal Buddy with clear separation between daily sales tracking, weekly catalog updates, and historical price analysis.