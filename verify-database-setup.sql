-- Verification Script for TCC Deal Buddy Enhanced Features Database Schema
-- Run this in Supabase SQL Editor to verify the setup was successful

-- Check if all tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('products', 'price_history', 'user_favorites', 'cart_items', 'sync_jobs')
ORDER BY table_name;

-- Check if all views exist
SELECT 
  table_name,
  table_type
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name IN ('current_deals', 'user_cart_summary')
ORDER BY table_name;

-- Verify RLS is enabled on user tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('user_favorites', 'cart_items')
ORDER BY tablename;

-- Check indexes were created
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('products', 'price_history', 'user_favorites', 'cart_items')
ORDER BY tablename, indexname;

-- Verify column structure for key tables
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'products'
ORDER BY ordinal_position;

-- Test basic operations (should run without errors)
INSERT INTO sync_jobs (job_type, status) VALUES ('daily_products', 'pending');

-- Check the test insert worked
SELECT * FROM sync_jobs WHERE job_type = 'daily_products' ORDER BY started_at DESC LIMIT 1;

-- Clean up test data
DELETE FROM sync_jobs WHERE job_type = 'daily_products' AND status = 'pending';

-- Test views work
SELECT 'current_deals view' as test_name, 
       CASE WHEN EXISTS(SELECT 1 FROM current_deals LIMIT 1) OR NOT EXISTS(SELECT 1 FROM current_deals LIMIT 1) 
            THEN 'OK' ELSE 'FAIL' END as result
UNION ALL
SELECT 'user_cart_summary view' as test_name,
       CASE WHEN EXISTS(SELECT 1 FROM user_cart_summary LIMIT 1) OR NOT EXISTS(SELECT 1 FROM user_cart_summary LIMIT 1) 
            THEN 'OK' ELSE 'FAIL' END as result;

-- Final summary
SELECT 
  'Database Setup Verification Complete' as status,
  NOW() as verified_at;