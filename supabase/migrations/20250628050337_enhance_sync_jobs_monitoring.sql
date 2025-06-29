-- Enhanced Sync Jobs Monitoring Schema
-- Separates and improves tracking for three distinct sync job types:
-- 1. Daily Sales Sync (sale items only)
-- 2. Weekly All Items Sync (comprehensive catalog)
-- 3. Weekly Price History Update (historical data)

-- First, update the sync_jobs table with enhanced columns
ALTER TABLE sync_jobs 
ADD COLUMN IF NOT EXISTS job_subtype VARCHAR(50),
ADD COLUMN IF NOT EXISTS scheduled_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_run_duration_ms INTEGER,
ADD COLUMN IF NOT EXISTS merchant_ids INTEGER[],
ADD COLUMN IF NOT EXISTS categories_synced TEXT[],
ADD COLUMN IF NOT EXISTS products_added INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS products_updated INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_history_entries INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_processing_time_ms INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5,2) DEFAULT 100.0;

-- Update the job_type constraint to include our three specific job types
ALTER TABLE sync_jobs 
DROP CONSTRAINT IF EXISTS sync_jobs_job_type_check;

ALTER TABLE sync_jobs 
ADD CONSTRAINT sync_jobs_job_type_check 
CHECK (job_type IN (
  'daily_sales',        -- Daily sale items sync (fast, lightweight)
  'weekly_catalog',     -- Weekly comprehensive catalog sync  
  'price_history',      -- Weekly price history update
  'manual_sync',        -- Manual user-triggered syncs
  'system'              -- System maintenance tasks
));

-- Create individual monitoring views for each job type

-- 1. Daily Sales Sync Health View
CREATE OR REPLACE VIEW daily_sales_health AS
SELECT 
  'daily_sales' as job_type,
  COUNT(*) as total_runs_last_30_days,
  COUNT(*) FILTER (WHERE status = 'completed') as successful_runs,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_runs,
  COUNT(*) FILTER (WHERE status = 'running') as currently_running,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as success_rate_percent,
  MAX(completed_at) as last_successful_run,
  MAX(started_at) FILTER (WHERE status = 'failed') as last_failed_run,
  AVG(records_processed) FILTER (WHERE status = 'completed') as avg_products_processed,
  AVG(api_calls_used) FILTER (WHERE status = 'completed') as avg_api_calls,
  AVG(last_run_duration_ms) FILTER (WHERE status = 'completed') as avg_duration_ms,
  -- Health status based on recent performance
  CASE 
    WHEN MAX(completed_at) < NOW() - INTERVAL '2 days' THEN 'stale'
    WHEN COUNT(*) FILTER (WHERE status = 'failed' AND started_at > NOW() - INTERVAL '24 hours') > 2 THEN 'unhealthy'
    WHEN COUNT(*) FILTER (WHERE status = 'completed' AND started_at > NOW() - INTERVAL '24 hours') >= 1 THEN 'healthy'
    ELSE 'unknown'
  END as health_status
FROM sync_jobs 
WHERE job_type = 'daily_sales' 
  AND started_at >= CURRENT_DATE - INTERVAL '30 days';

-- 2. Weekly Catalog Sync Health View
CREATE OR REPLACE VIEW weekly_catalog_health AS
SELECT 
  'weekly_catalog' as job_type,
  COUNT(*) as total_runs_last_30_days,
  COUNT(*) FILTER (WHERE status = 'completed') as successful_runs,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_runs,
  COUNT(*) FILTER (WHERE status = 'running') as currently_running,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as success_rate_percent,
  MAX(completed_at) as last_successful_run,
  MAX(started_at) FILTER (WHERE status = 'failed') as last_failed_run,
  AVG(records_processed) FILTER (WHERE status = 'completed') as avg_products_processed,
  AVG(api_calls_used) FILTER (WHERE status = 'completed') as avg_api_calls,
  AVG(last_run_duration_ms) FILTER (WHERE status = 'completed') as avg_duration_ms,
  -- Health status for weekly jobs (longer intervals)
  CASE 
    WHEN MAX(completed_at) < NOW() - INTERVAL '10 days' THEN 'stale'
    WHEN COUNT(*) FILTER (WHERE status = 'failed' AND started_at > NOW() - INTERVAL '7 days') > 1 THEN 'unhealthy'
    WHEN COUNT(*) FILTER (WHERE status = 'completed' AND started_at > NOW() - INTERVAL '7 days') >= 1 THEN 'healthy'
    ELSE 'unknown'
  END as health_status
FROM sync_jobs 
WHERE job_type = 'weekly_catalog' 
  AND started_at >= CURRENT_DATE - INTERVAL '30 days';

-- 3. Price History Sync Health View
CREATE OR REPLACE VIEW price_history_health AS
SELECT 
  'price_history' as job_type,
  COUNT(*) as total_runs_last_30_days,
  COUNT(*) FILTER (WHERE status = 'completed') as successful_runs,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_runs,
  COUNT(*) FILTER (WHERE status = 'running') as currently_running,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as success_rate_percent,
  MAX(completed_at) as last_successful_run,
  MAX(started_at) FILTER (WHERE status = 'failed') as last_failed_run,
  AVG(price_history_entries) FILTER (WHERE status = 'completed') as avg_history_entries,
  AVG(api_calls_used) FILTER (WHERE status = 'completed') as avg_api_calls,
  AVG(last_run_duration_ms) FILTER (WHERE status = 'completed') as avg_duration_ms,
  -- Health status for weekly price history jobs
  CASE 
    WHEN MAX(completed_at) < NOW() - INTERVAL '10 days' THEN 'stale'
    WHEN COUNT(*) FILTER (WHERE status = 'failed' AND started_at > NOW() - INTERVAL '7 days') > 1 THEN 'unhealthy'
    WHEN COUNT(*) FILTER (WHERE status = 'completed' AND started_at > NOW() - INTERVAL '7 days') >= 1 THEN 'healthy'
    ELSE 'unknown'
  END as health_status
FROM sync_jobs 
WHERE job_type = 'price_history' 
  AND started_at >= CURRENT_DATE - INTERVAL '30 days';

-- 4. Combined Sync Health Overview
CREATE OR REPLACE VIEW sync_jobs_overview AS
SELECT * FROM daily_sales_health
UNION ALL
SELECT * FROM weekly_catalog_health  
UNION ALL
SELECT * FROM price_history_health
ORDER BY job_type;

-- Create indexes for better performance on monitoring queries
CREATE INDEX IF NOT EXISTS idx_sync_jobs_type_status ON sync_jobs(job_type, status);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_started_at ON sync_jobs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_completed_at ON sync_jobs(completed_at DESC);

-- Grant permissions for monitoring views
GRANT SELECT ON daily_sales_health TO authenticated;
GRANT SELECT ON weekly_catalog_health TO authenticated;
GRANT SELECT ON price_history_health TO authenticated;
GRANT SELECT ON sync_jobs_overview TO authenticated;

-- Add helpful comments
COMMENT ON VIEW daily_sales_health IS 'Health monitoring for daily sales sync jobs (sale items only)';
COMMENT ON VIEW weekly_catalog_health IS 'Health monitoring for weekly catalog sync jobs (comprehensive)';
COMMENT ON VIEW price_history_health IS 'Health monitoring for weekly price history update jobs';
COMMENT ON VIEW sync_jobs_overview IS 'Combined overview of all three sync job types health status';

-- Insert a migration marker
INSERT INTO sync_jobs (job_type, job_subtype, status, records_processed, api_calls_used) 
VALUES ('system', 'schema_enhancement', 'completed', 0, 0);

-- Show the enhanced schema structure
SELECT 'Enhanced sync_jobs schema deployed successfully' as status;