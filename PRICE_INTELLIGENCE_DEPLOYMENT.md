# TCC Deal Buddy: Price Intelligence System Deployment Guide

## Overview

This guide covers deploying the enhanced TCC Deal Buddy with comprehensive price intelligence features that transform it from a simple deal aggregator into a sophisticated price tracking platform.

## 🚀 New Features Implemented

### 1. Enhanced Database Schema
- **Price Intelligence Tables**: `price_alerts`, `market_trends`, `sync_queue`
- **Enhanced Price History**: Rich context with price change reasons, seasonal data
- **Product Lifecycle Tracking**: First seen dates, availability scores, sync priorities
- **Smart Views**: `price_trends`, `best_deals`, `category_insights`

### 2. Full Catalog Sync System
- **Complete Product Coverage**: Sync ALL products, not just sale items
- **Multi-Category Support**: Climbing, hiking, camping, outdoor gear
- **Intelligent Prioritization**: High-value items get priority sync scheduling
- **Rate Limiting**: Smart delays and batch processing to respect API limits

### 3. Historical Price Intelligence
- **ProductPriceCheck Integration**: Full historical price data from AvantLink
- **Price Trend Analysis**: 7-day, 30-day moving averages and yearly ranges
- **Deal Quality Scoring**: 0-100% scores based on historical price position
- **Buy/Wait Recommendations**: Smart suggestions based on price history

### 4. Price Alerts System
- **Multi-Type Alerts**: Price drops, target prices, sale starts/ends
- **User Preferences**: Email, push notifications, SMS (planned)
- **Smart Triggering**: Automatic alert processing with price history context
- **Alert Management**: Full CRUD operations with real-time updates

### 5. Enhanced UI/UX
- **Price Intelligence Dashboard**: Market insights, category analysis, trending data
- **Smart Product Cards**: Deal quality indicators, price trend badges, quick alerts
- **Tabbed Interface**: Deals, Intelligence, Alerts in organized tabs
- **Real-time Stats**: Active alerts, recent triggers, intelligence status

## 🗄️ Database Deployment

### Step 1: Apply New Migration

```bash
# Navigate to project directory
cd /mnt/ssd/Projects/tcc-deal-buddy

# Apply the price intelligence schema enhancement
npx supabase db push
```

### Step 2: Verify Database Schema

```sql
-- Check new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('price_alerts', 'market_trends', 'sync_queue');

-- Verify enhanced views
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN ('price_trends', 'best_deals', 'category_insights');

-- Check price_history enhancements
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'price_history' 
AND column_name IN ('price_change_reason', 'data_source', 'seasonal_context');
```

## ⚡ Edge Functions Deployment

### Step 3: Deploy New Sync Functions

```bash
# Deploy full catalog sync function
npx supabase functions deploy full-catalog-sync

# Deploy price history sync function  
npx supabase functions deploy price-history-sync

# Verify deployments
npx supabase functions list
```

### Step 4: Configure Function Permissions

```sql
-- Grant necessary permissions for new functions
GRANT ALL ON price_alerts TO service_role;
GRANT ALL ON market_trends TO service_role;
GRANT ALL ON sync_queue TO service_role;
GRANT SELECT ON price_trends TO authenticated;
GRANT SELECT ON best_deals TO authenticated;
GRANT SELECT ON category_insights TO authenticated;
```

## 🔧 Configuration Updates

### Step 5: Environment Variables

Ensure these environment variables are set in your Supabase project:

```bash
# AvantLink API credentials (existing)
AVANTLINK_AFFILIATE_ID=348445
AVANTLINK_API_KEY=your_api_key
AVANTLINK_WEBSITE_ID=406357

# Add to your .env.local file for local development
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Step 6: Update Frontend Dependencies

```bash
# Install any missing dependencies (run in Windows terminal)
npm install
```

## 🔄 Sync System Configuration

### Step 7: Set Up Sync Schedules

Configure cron jobs for automated syncing:

```sql
-- Daily full catalog sync (runs at 2 AM UTC)
SELECT cron.schedule(
    'daily-full-catalog-sync',
    '0 2 * * *',
    $$SELECT net.http_post(
        url := 'https://your-project.supabase.co/functions/v1/full-catalog-sync',
        headers := '{"Authorization": "Bearer your-service-role-key"}'::jsonb,
        body := '{"includeNonSaleItems": true, "maxProductsPerMerchant": 2000}'::jsonb
    );$$
);

-- Price history sync (runs every 4 hours)
SELECT cron.schedule(
    'price-history-sync',
    '0 */4 * * *',
    $$SELECT net.http_post(
        url := 'https://your-project.supabase.co/functions/v1/price-history-sync',
        headers := '{"Authorization": "Bearer your-service-role-key"}'::jsonb,
        body := '{"batch_size": 20, "max_api_calls": 150}'::jsonb
    );$$
);
```

## 📊 API Usage Optimization

### Expected Usage Patterns

**Conservative Estimate (Safe Operation)**:
- Full Catalog Sync: 2,000 calls/day
- Price History Sync: 3,000 calls/day  
- **Total**: 5,000 calls/day (33% of 15,000 limit)

**Aggressive Estimate (Maximum Utilization)**:
- Full Catalog Sync: 4,000 calls/day
- Price History Sync: 8,000 calls/day
- **Total**: 12,000 calls/day (80% of 15,000 limit)

### Rate Limiting Strategy

1. **Intelligent Scheduling**: Priority items synced more frequently
2. **Batch Processing**: Group operations to minimize API calls
3. **Graceful Degradation**: Fall back to essential syncs if limits approached
4. **User-Driven Priority**: Favorited items get highest sync priority

## 🧪 Testing Deployment

### Step 8: Test Core Functions

```bash
# Test full catalog sync (run in browser or API client)
POST https://your-project.supabase.co/functions/v1/full-catalog-sync
Authorization: Bearer your-service-role-key
Content-Type: application/json

{
  "merchants": [9272],
  "includeNonSaleItems": true,
  "maxProductsPerMerchant": 100
}

# Test price history sync
POST https://your-project.supabase.co/functions/v1/price-history-sync
Authorization: Bearer your-service-role-key

# Check sync results
SELECT * FROM sync_jobs ORDER BY started_at DESC LIMIT 5;
```

### Step 9: Verify UI Components

```bash
# Start development server (Windows terminal)
npm run dev

# Test features:
# 1. Navigate to http://localhost:3000
# 2. Check "Price Intelligence" tab loads
# 3. Verify product cards show intelligence badges  
# 4. Test price alert creation (requires auth)
# 5. Confirm deal quality scores display
```

## 🚨 Monitoring & Alerts

### Step 10: Set Up Monitoring

```sql
-- Monitor API usage
CREATE OR REPLACE VIEW api_usage_summary AS
SELECT 
    DATE(started_at) as sync_date,
    job_type,
    job_subtype,
    SUM(api_calls_used) as total_api_calls,
    AVG(avg_processing_time_ms) as avg_time_ms,
    COUNT(*) as job_count
FROM sync_jobs 
WHERE started_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(started_at), job_type, job_subtype
ORDER BY sync_date DESC;

-- Monitor sync job health
CREATE OR REPLACE VIEW sync_health_check AS
SELECT 
    job_type,
    status,
    COUNT(*) as job_count,
    MAX(started_at) as last_run,
    AVG(api_calls_used) as avg_api_calls
FROM sync_jobs 
WHERE started_at >= CURRENT_DATE - INTERVAL '1 day'
GROUP BY job_type, status;
```

## 🎯 Success Metrics

### Key Performance Indicators

1. **Data Coverage**: 10,000+ products tracked (vs 855 previously)
2. **Price Intelligence**: 80%+ products with quality scores
3. **User Engagement**: 5+ price alerts per active user
4. **API Efficiency**: <50% of daily API limit usage
5. **Data Freshness**: 95%+ products updated within 24 hours

### Performance Targets

- **Full Catalog Sync**: Complete in <30 minutes
- **Price History Sync**: Process 50+ products/hour
- **Price Alert Response**: Trigger within 1 hour of price changes
- **UI Response Time**: <2 seconds for intelligence dashboard

## 🔧 Troubleshooting

### Common Issues

1. **API Rate Limiting**: Check `sync_jobs` table for failed jobs
2. **Missing Price Data**: Verify ProductPriceCheck API responses
3. **UI Loading Issues**: Check browser console for TypeScript errors
4. **Database Performance**: Monitor query execution times on complex views

### Debug Commands

```sql
-- Check recent sync performance
SELECT * FROM sync_jobs WHERE started_at >= NOW() - INTERVAL '24 hours' ORDER BY started_at DESC;

-- Verify price intelligence data
SELECT COUNT(*) FROM price_trends WHERE recorded_date = CURRENT_DATE;

-- Check alert system health
SELECT alert_type, COUNT(*) FROM price_alerts WHERE is_active = true GROUP BY alert_type;
```

## 🎉 Deployment Complete

Your TCC Deal Buddy now features:

✅ **Full Catalog Intelligence**: Track all products, not just sales  
✅ **Historical Price Analysis**: Smart buy/wait recommendations  
✅ **Price Alert System**: Multi-type notifications for price changes  
✅ **Market Intelligence**: Category insights and trending analysis  
✅ **Enhanced User Experience**: Beautiful dashboards and smart product cards

The system is now a comprehensive price intelligence platform that provides users with the data they need to make informed purchasing decisions in the outdoor gear market.

## 📞 Support

For deployment issues or questions:
1. Check the `sync_jobs` table for error messages
2. Verify environment variables are set correctly
3. Monitor API usage via the Supabase dashboard
4. Review browser console for frontend errors

The enhanced TCC Deal Buddy is ready to help users track prices, discover deals, and make smart purchasing decisions! 🏔️⛺🧗‍♂️