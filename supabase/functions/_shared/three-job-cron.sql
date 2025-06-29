-- Three Separate Sync Jobs Cron Configuration for TCC Deal Buddy
-- Implements distinct scheduling for:
-- 1. Daily Sales Sync (fast, sale items only)
-- 2. Weekly Catalog Sync (comprehensive, all products)  
-- 3. Weekly Price History Sync (historical data collection)

-- Enable the pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Drop any existing intelligent sync jobs to avoid conflicts
SELECT cron.unschedule('intelligent-daily-sync');
SELECT cron.unschedule('intelligent-weekly-sync');
SELECT cron.unschedule('intelligent-sale-sync-morning');
SELECT cron.unschedule('intelligent-sale-sync-evening');

-- Drop old basic sync jobs
SELECT cron.unschedule('daily-product-sync');

-- 1. DAILY SALES SYNC
-- Purpose: Fast sync of sale items only (lightweight, frequent)
-- Schedule: Every day at 6:00 AM EST (11:00 AM UTC)
-- Focus: Current deals and promotions
SELECT cron.schedule(
  'daily-sales-sync',
  '0 11 * * *',  -- 11:00 AM UTC = 6:00 AM EST
  $$
  SELECT net.http_post(
    url := 'https://owtcaztrzujjuwwuldhl.supabase.co/functions/v1/daily-sales-sync',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.supabase_service_role_key') || '"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- 2. WEEKLY COMPREHENSIVE CATALOG SYNC  
-- Purpose: Complete product catalog refresh (heavy, comprehensive)
-- Schedule: Sundays at 2:00 AM EST (7:00 AM UTC)
-- Focus: All products including non-sale items
SELECT cron.schedule(
  'weekly-catalog-sync',
  '0 7 * * 0',  -- 7:00 AM UTC on Sundays = 2:00 AM EST
  $$
  SELECT net.http_post(
    url := 'https://owtcaztrzujjuwwuldhl.supabase.co/functions/v1/weekly-catalog-sync',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.supabase_service_role_key') || '"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- 3. WEEKLY PRICE HISTORY SYNC
-- Purpose: Historical price data collection for trending analysis
-- Schedule: Sundays at 4:00 AM EST (9:00 AM UTC) - 2 hours after catalog sync
-- Focus: Priority products with detailed price history
SELECT cron.schedule(
  'weekly-price-history-sync',
  '0 9 * * 0',  -- 9:00 AM UTC on Sundays = 4:00 AM EST
  $$
  SELECT net.http_post(
    url := 'https://owtcaztrzujjuwwuldhl.supabase.co/functions/v1/weekly-price-history-sync',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.supabase_service_role_key') || '"}'::jsonb,
    body := '{"batch_size": 50, "max_api_calls": 200}'::jsonb
  );
  $$
);

-- Verify all three cron jobs were created successfully
SELECT 
  jobname,
  schedule,
  active,
  jobid,
  CASE 
    WHEN jobname = 'daily-sales-sync' THEN 'Fast sync - sale items only (daily)'
    WHEN jobname = 'weekly-catalog-sync' THEN 'Comprehensive sync - all products (weekly)'
    WHEN jobname = 'weekly-price-history-sync' THEN 'Historical data collection (weekly)'
    ELSE 'Unknown'
  END as description
FROM cron.job 
WHERE jobname IN ('daily-sales-sync', 'weekly-catalog-sync', 'weekly-price-history-sync')
ORDER BY jobname;

-- Create comprehensive monitoring view for all three sync jobs
CREATE OR REPLACE VIEW three_sync_jobs_status AS
WITH job_metrics AS (
  SELECT 
    job_type,
    COUNT(*) as total_runs_7_days,
    COUNT(*) FILTER (WHERE status = 'completed') as successful_runs,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_runs,
    COUNT(*) FILTER (WHERE status = 'running') as currently_running,
    MAX(completed_at) as last_successful_run,
    MAX(started_at) FILTER (WHERE status = 'failed') as last_failed_run,
    AVG(records_processed) FILTER (WHERE status = 'completed') as avg_records_processed,
    AVG(api_calls_used) FILTER (WHERE status = 'completed') as avg_api_calls,
    AVG(last_run_duration_ms) FILTER (WHERE status = 'completed') as avg_duration_ms
  FROM sync_jobs 
  WHERE job_type IN ('daily_sales', 'weekly_catalog', 'price_history')
    AND started_at >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY job_type
)
SELECT 
  jm.job_type,
  CASE 
    WHEN jm.job_type = 'daily_sales' THEN 'Daily Sales Sync'
    WHEN jm.job_type = 'weekly_catalog' THEN 'Weekly Catalog Sync'
    WHEN jm.job_type = 'price_history' THEN 'Weekly Price History Sync'
  END as job_display_name,
  CASE 
    WHEN jm.job_type = 'daily_sales' THEN '6:00 AM EST daily'
    WHEN jm.job_type = 'weekly_catalog' THEN '2:00 AM EST Sundays'
    WHEN jm.job_type = 'price_history' THEN '4:00 AM EST Sundays'
  END as schedule_display,
  jm.total_runs_7_days,
  jm.successful_runs,
  jm.failed_runs,
  jm.currently_running,
  ROUND(
    (jm.successful_runs::DECIMAL / NULLIF(jm.total_runs_7_days, 0)) * 100, 
    2
  ) as success_rate_percent,
  jm.last_successful_run,
  jm.last_failed_run,
  ROUND(jm.avg_records_processed::NUMERIC, 0) as avg_records_processed,
  ROUND(jm.avg_api_calls::NUMERIC, 0) as avg_api_calls,
  ROUND(jm.avg_duration_ms::NUMERIC / 1000, 1) as avg_duration_seconds,
  -- Health status based on job type expectations
  CASE 
    WHEN jm.job_type = 'daily_sales' AND jm.last_successful_run < NOW() - INTERVAL '2 days' THEN 'stale'
    WHEN jm.job_type IN ('weekly_catalog', 'price_history') AND jm.last_successful_run < NOW() - INTERVAL '10 days' THEN 'stale'
    WHEN jm.failed_runs > 0 AND jm.successful_runs = 0 THEN 'unhealthy'
    WHEN jm.successful_runs > 0 THEN 'healthy'
    ELSE 'unknown'
  END as health_status,
  -- Expected frequency info
  CASE 
    WHEN jm.job_type = 'daily_sales' THEN 'Should run daily'
    WHEN jm.job_type IN ('weekly_catalog', 'price_history') THEN 'Should run weekly on Sundays'
  END as expected_frequency
FROM job_metrics jm
ORDER BY 
  CASE 
    WHEN jm.job_type = 'daily_sales' THEN 1
    WHEN jm.job_type = 'weekly_catalog' THEN 2  
    WHEN jm.job_type = 'price_history' THEN 3
  END;

-- Grant permissions for monitoring
GRANT SELECT ON three_sync_jobs_status TO authenticated;

-- Add helpful comments
COMMENT ON VIEW three_sync_jobs_status IS 'Comprehensive monitoring for the three separate sync jobs: daily sales, weekly catalog, and weekly price history';

-- Insert configuration marker
INSERT INTO sync_jobs (job_type, job_subtype, status, records_processed, api_calls_used) 
VALUES ('system', 'three_job_cron_configuration', 'completed', 3, 0);

-- Show configuration summary
SELECT 'Three separate sync jobs configured successfully:' as status
UNION ALL
SELECT '1. Daily Sales Sync - 6:00 AM EST daily (sale items only)'
UNION ALL  
SELECT '2. Weekly Catalog Sync - 2:00 AM EST Sundays (comprehensive)'
UNION ALL
SELECT '3. Weekly Price History Sync - 4:00 AM EST Sundays (historical data)'
UNION ALL
SELECT ''
UNION ALL
SELECT 'Use SELECT * FROM three_sync_jobs_status; to monitor all jobs';