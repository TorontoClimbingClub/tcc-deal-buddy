-- Enhanced Intelligent Sync Scheduling for TCC Deal Buddy
-- Replaces basic daily-sync with smart multi-mode automation

-- Enable the pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Drop old cron job if it exists
SELECT cron.unschedule('daily-product-sync');

-- Schedule intelligent daily sync at 6:00 AM EST (11:00 AM UTC)
-- Mode: daily (sale items only, fast refresh)
SELECT cron.schedule(
  'intelligent-daily-sync',
  '0 11 * * *',  -- 11:00 AM UTC = 6:00 AM EST
  $$
  SELECT net.http_post(
    url := 'https://owtcaztrzujjuwwuldhl.supabase.co/functions/v1/intelligent-sync',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.supabase_service_role_key') || '"}'::jsonb,
    body := '{"mode": "daily"}'::jsonb
  );
  $$
);

-- Schedule comprehensive weekly sync on Sundays at 2:00 AM EST (7:00 AM UTC)
-- Mode: weekly (full catalog including non-sale items)
SELECT cron.schedule(
  'intelligent-weekly-sync',
  '0 7 * * 0',  -- 7:00 AM UTC on Sundays = 2:00 AM EST
  $$
  SELECT net.http_post(
    url := 'https://owtcaztrzujjuwwuldhl.supabase.co/functions/v1/intelligent-sync',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.supabase_service_role_key') || '"}'::jsonb,
    body := '{"mode": "weekly"}'::jsonb
  );
  $$
);

-- Schedule sale-focused sync twice daily during peak hours
-- Mode: sale_only (enhanced sale item discovery)
SELECT cron.schedule(
  'intelligent-sale-sync-morning',
  '0 15 * * *',  -- 3:00 PM UTC = 10:00 AM EST
  $$
  SELECT net.http_post(
    url := 'https://owtcaztrzujjuwwuldhl.supabase.co/functions/v1/intelligent-sync',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.supabase_service_role_key') || '"}'::jsonb,
    body := '{"mode": "sale_only"}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'intelligent-sale-sync-evening',
  '0 21 * * *',  -- 9:00 PM UTC = 4:00 PM EST
  $$
  SELECT net.http_post(
    url := 'https://owtcaztrzujjuwwuldhl.supabase.co/functions/v1/intelligent-sync',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.supabase_service_role_key') || '"}'::jsonb,
    body := '{"mode": "sale_only"}'::jsonb
  );
  $$
);

-- Check if all cron jobs were created successfully
SELECT 
  jobname,
  schedule,
  active,
  jobid
FROM cron.job 
WHERE jobname LIKE 'intelligent-%'
ORDER BY jobname;

-- Create monitoring view for sync job health
CREATE OR REPLACE VIEW sync_job_health AS
SELECT 
  job_type,
  job_subtype,
  COUNT(*) as total_runs,
  COUNT(*) FILTER (WHERE status = 'completed') as successful_runs,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_runs,
  COUNT(*) FILTER (WHERE status = 'running') as currently_running,
  MAX(completed_at) as last_success,
  AVG(records_processed) FILTER (WHERE status = 'completed') as avg_records_processed,
  AVG(api_calls_used) FILTER (WHERE status = 'completed') as avg_api_calls,
  AVG(avg_processing_time_ms) FILTER (WHERE status = 'completed') as avg_processing_time_ms
FROM sync_jobs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY job_type, job_subtype
ORDER BY job_type, job_subtype;

-- Grant permissions for monitoring
GRANT SELECT ON sync_job_health TO authenticated;

-- Add comments for documentation
COMMENT ON VIEW sync_job_health IS 'Health monitoring for intelligent sync jobs over the last 30 days';

-- Log the configuration
INSERT INTO sync_jobs (job_type, job_subtype, status, records_processed, api_calls_used) 
VALUES ('system', 'cron_configuration', 'completed', 4, 0);

SELECT 'Intelligent sync cron jobs configured successfully' as status;