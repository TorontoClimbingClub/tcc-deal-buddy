# TCC Deal Buddy - Supabase Configuration Guide

## Overview
This guide sets up the enhanced TCC Deal Buddy features with Supabase integration:
- **Daily API Sync**: Automated AvantLink product data synchronization
- **Historical Price Tracking**: Price history database for trend analysis  
- **User Cart & Favorites**: Real-time user interactions with savings calculations

## Prerequisites
- Supabase project created: `owtcaztrzujjuwwuldhl`
- AvantLink API credentials configured
- Supabase CLI installed (optional but recommended)

## Setup Steps

### 1. Database Schema Migration

Run the database migration to create all required tables:

```bash
# Using Supabase CLI (recommended)
cd /path/to/tcc-deal-buddy
supabase migration up

# Or manually execute the SQL file in Supabase dashboard:
# Copy contents of supabase/migrations/20250625000001_create_deal_intelligence_schema.sql
# and run in SQL Editor
```

### 2. Edge Function Deployment

Deploy the daily sync Edge Function:

```bash
# Deploy the daily sync function
supabase functions deploy daily-sync

# Set required environment variables in Supabase dashboard:
# Settings > Edge Functions > Configuration
```

Required Edge Function environment variables:
```
AVANTLINK_AFFILIATE_ID=348445
AVANTLINK_API_KEY=52917e7babaeaba80c5b73e275d42186
AVANTLINK_WEBSITE_ID=406357
```

### 3. Scheduled Daily Sync

Set up automated daily sync at 6:00 AM EST:

```bash
# Option A: Using pg_cron (if available)
# Execute supabase/functions/_shared/cron.sql in SQL Editor

# Option B: Using Supabase Dashboard
# Go to Database > Webhooks > Create a new webhook
# URL: https://owtcaztrzujjuwwuldhl.supabase.co/functions/v1/daily-sync
# Schedule: 0 11 * * * (11:00 AM UTC = 6:00 AM EST)
```

### 4. Authentication Setup (Optional)

If implementing user-specific features (cart, favorites):

```bash
# Enable authentication in Supabase dashboard
# Settings > Authentication > Enable
# Configure authentication providers as needed
```

## Database Schema Overview

### Core Tables

1. **products** - Daily sync of sale items from AvantLink
   - Stores current product catalog with prices and discounts
   - Unique constraint on `(sku, merchant_id, last_sync_date)`

2. **price_history** - Historical price tracking
   - Daily snapshots for trend analysis and sale predictions
   - Tracks price changes over time for favorited items

3. **user_favorites** - User-selected products for monitoring
   - Enables price alerts and personalized tracking
   - Row Level Security (RLS) enforced

4. **cart_items** - User shopping cart with savings calculations
   - Real-time cart management with quantity tracking
   - Automatic savings calculation via views

5. **sync_jobs** - Daily API operation monitoring
   - Tracks sync status, API usage, and error logging
   - Enables monitoring and debugging of automated jobs

### Helpful Views

- **current_deals** - Today's sale items with calculated discount percentages
- **user_cart_summary** - Aggregated cart totals and savings per user

## API Usage Optimization

The daily sync strategy provides:
- **97-99% API usage reduction** vs real-time calls
- **Unlimited user interactions** with cached data  
- **24-hour data freshness** for deal discovery
- **Predictable costs** regardless of user growth

Daily API budget: 15,000 calls/day
Actual usage: ~200-500 calls/day (1-3% utilization)

## Security Configuration

### Row Level Security (RLS)
- `user_favorites`: Users can only access their own favorites
- `cart_items`: Users can only access their own cart items
- `products`: Public read access for all users
- `price_history`: Public read access for analytics

### Environment Variables
Frontend (Vite):
```env
VITE_AVANTLINK_AFFILIATE_ID=348445
VITE_AVANTLINK_API_KEY=52917e7babaeaba80c5b73e275d42186
VITE_AVANTLINK_WEBSITE_ID=406357
```

Edge Functions (Supabase Dashboard):
```env
AVANTLINK_AFFILIATE_ID=348445
AVANTLINK_API_KEY=52917e7babaeaba80c5b73e275d42186
AVANTLINK_WEBSITE_ID=406357
```

## Testing the Setup

### 1. Manual Sync Test
```bash
# Test the daily sync function manually
curl -X POST https://owtcaztrzujjuwwuldhl.supabase.co/functions/v1/daily-sync \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json"
```

### 2. Database Verification
```sql
-- Check if products were synced
SELECT COUNT(*) FROM products WHERE last_sync_date = CURRENT_DATE;

-- Check current deals
SELECT * FROM current_deals LIMIT 10;

-- Check sync job status
SELECT * FROM sync_jobs ORDER BY started_at DESC LIMIT 5;
```

### 3. TypeScript Integration Test
```typescript
import { supabase } from '@/integrations/supabase/client'

// Test fetching current deals
const { data: deals } = await supabase
  .from('current_deals')
  .select('*')
  .limit(10)

console.log('Current deals:', deals)
```

## Performance Considerations

### Indexes
All critical queries are optimized with indexes:
- Product lookups by merchant and SKU
- Price history by date and product
- User-specific data access patterns

### Caching Strategy
- Products cached for 24 hours (daily sync)
- User interactions (cart/favorites) real-time
- Price history pre-aggregated in database views

## Monitoring & Maintenance

### Daily Sync Monitoring
```sql
-- Check sync job health
SELECT 
  job_type,
  status,
  records_processed,
  api_calls_used,
  sync_date
FROM sync_jobs 
WHERE sync_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY sync_date DESC;
```

### API Usage Tracking
```sql
-- Monitor API usage trends
SELECT 
  sync_date,
  SUM(api_calls_used) as daily_api_calls,
  SUM(records_processed) as daily_records
FROM sync_jobs 
GROUP BY sync_date 
ORDER BY sync_date DESC;
```

## Next Steps

1. **Deploy Schema**: Run database migration
2. **Deploy Functions**: Set up Edge Function with environment variables
3. **Schedule Sync**: Configure daily automated sync
4. **Test Integration**: Verify data flow and API responses
5. **Implement UI**: Connect frontend components to new database schema

## Support

For issues with:
- **Database migrations**: Check Supabase dashboard logs
- **Edge Functions**: Monitor function logs in Supabase dashboard
- **API sync failures**: Check `sync_jobs` table for error messages
- **Authentication**: Verify RLS policies and user sessions