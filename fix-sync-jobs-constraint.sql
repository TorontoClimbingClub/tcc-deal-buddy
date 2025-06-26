-- Fix sync_jobs table to allow comprehensive_catalog job type

-- First, let's see what constraint exists
-- ALTER TABLE sync_jobs DROP CONSTRAINT IF EXISTS sync_jobs_job_type_check;

-- Add the new job type to the constraint
ALTER TABLE sync_jobs 
DROP CONSTRAINT IF EXISTS sync_jobs_job_type_check;

ALTER TABLE sync_jobs 
ADD CONSTRAINT sync_jobs_job_type_check 
CHECK (job_type IN (
  'daily_products',
  'weekly_catalog', 
  'full_catalog',
  'comprehensive_catalog',
  'sale_items',
  'favorites_sync',
  'price_history_update'
));