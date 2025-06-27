-- Check actual database counts for TCC Deal Buddy dashboard verification
-- This file contains queries to verify the accuracy of dashboard statistics

-- 1. Check current_deals view (active deals count)
SELECT 
    COUNT(*) as current_deals_count,
    'current_deals view' as source
FROM current_deals;

-- 2. Check products table - total products without date filter
SELECT 
    COUNT(*) as total_products_no_filter,
    'products table (no filter)' as source
FROM products;

-- 3. Check products table - products for today's date (what the dashboard hook is checking)
SELECT 
    COUNT(*) as products_today_count,
    'products table (today only)' as source
FROM products 
WHERE last_sync_date = CURRENT_DATE;

-- 4. Check products table - products for the most recent sync date
SELECT 
    COUNT(*) as products_latest_sync_count,
    'products table (latest sync)' as source,
    MAX(last_sync_date) as latest_sync_date
FROM products
WHERE last_sync_date = (SELECT MAX(last_sync_date) FROM products);

-- 5. Check all unique sync dates to see what dates have data
SELECT 
    last_sync_date,
    COUNT(*) as product_count
FROM products 
GROUP BY last_sync_date 
ORDER BY last_sync_date DESC;

-- 6. Check current_deals view breakdown by discount ranges
SELECT 
    CASE 
        WHEN calculated_discount_percent >= 50 THEN '50%+'
        WHEN calculated_discount_percent >= 30 THEN '30-49%'
        WHEN calculated_discount_percent >= 20 THEN '20-29%'
        WHEN calculated_discount_percent >= 10 THEN '10-19%'
        ELSE '<10%'
    END as discount_range,
    COUNT(*) as deal_count
FROM current_deals
GROUP BY 
    CASE 
        WHEN calculated_discount_percent >= 50 THEN '50%+'
        WHEN calculated_discount_percent >= 30 THEN '30-49%'
        WHEN calculated_discount_percent >= 20 THEN '20-29%'
        WHEN calculated_discount_percent >= 10 THEN '10-19%'
        ELSE '<10%'
    END
ORDER BY 
    CASE 
        WHEN calculated_discount_percent >= 50 THEN 1
        WHEN calculated_discount_percent >= 30 THEN 2
        WHEN calculated_discount_percent >= 20 THEN 3
        WHEN calculated_discount_percent >= 10 THEN 4
        ELSE 5
    END;

-- 7. Check average discount from current_deals
SELECT 
    AVG(calculated_discount_percent) as average_discount,
    COUNT(*) as total_deals
FROM current_deals;

-- 8. Check if there are any products with exactly 1000 count that could be causing the issue
SELECT 
    'Check for 1000 count anomaly' as check_type,
    COUNT(*) as count_result
FROM products
HAVING COUNT(*) = 1000;

-- 9. Check sync_jobs table to see recent sync activity
SELECT 
    job_type,
    status,
    records_processed,
    sync_date,
    started_at,
    completed_at
FROM sync_jobs
ORDER BY started_at DESC
LIMIT 10;

-- 10. Check if there are any constraints or triggers that might affect counting
SELECT 
    table_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name IN ('products', 'current_deals')
ORDER BY table_name, constraint_name;