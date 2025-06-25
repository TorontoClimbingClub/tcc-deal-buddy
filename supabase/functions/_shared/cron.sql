-- Enable the pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily sync job at 6:00 AM EST (11:00 AM UTC)
SELECT cron.schedule(
  'daily-product-sync',
  '0 11 * * *',  -- 11:00 AM UTC = 6:00 AM EST
  $$
  SELECT net.http_post(
    url := 'https://owtcaztrzujjuwwuldhl.supabase.co/functions/v1/daily-sync',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.supabase_service_role_key') || '"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Check if the cron job was created successfully
SELECT * FROM cron.job WHERE jobname = 'daily-product-sync';