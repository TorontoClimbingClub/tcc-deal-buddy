-- Price History Duplicate Analysis Script
-- Analyzes potential duplicate price history records despite unique constraints

-- 1. Check for actual duplicate violations of the unique constraint
-- This should return 0 rows if the constraint is working properly
SELECT 
    'CONSTRAINT VIOLATION CHECK' as analysis_type,
    product_sku,
    merchant_id,
    recorded_date,
    COUNT(*) as duplicate_count,
    array_agg(id ORDER BY created_at) as record_ids,
    array_agg(price ORDER BY created_at) as prices,
    array_agg(created_at ORDER BY created_at) as created_timestamps
FROM price_history
GROUP BY product_sku, merchant_id, recorded_date
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, recorded_date DESC
LIMIT 20;

-- 2. Check for "logical duplicates" - same product, similar dates, same prices
-- This might reveal if dates are being recorded incorrectly
SELECT 
    'LOGICAL DUPLICATES - SAME PRODUCT NEARBY DATES' as analysis_type,
    ph1.product_sku,
    ph1.merchant_id,
    ph1.recorded_date as date1,
    ph2.recorded_date as date2,
    ph1.price as price1,
    ph2.price as price2,
    ph1.created_at as created1,
    ph2.created_at as created2,
    ABS(EXTRACT(EPOCH FROM (ph1.created_at - ph2.created_at))/3600) as hours_apart
FROM price_history ph1
JOIN price_history ph2 ON 
    ph1.product_sku = ph2.product_sku 
    AND ph1.merchant_id = ph2.merchant_id
    AND ph1.id != ph2.id
    AND ph1.price = ph2.price
    AND ABS(ph1.recorded_date - ph2.recorded_date) <= 2  -- Within 2 days
WHERE ph1.recorded_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY ph1.product_sku, ph1.recorded_date DESC
LIMIT 50;

-- 3. Check for price records created very close together (potential race conditions)
SELECT 
    'POTENTIAL RACE CONDITIONS' as analysis_type,
    product_sku,
    merchant_id,
    recorded_date,
    price,
    created_at,
    LAG(created_at) OVER (PARTITION BY product_sku, merchant_id ORDER BY created_at) as prev_created_at,
    EXTRACT(EPOCH FROM (created_at - LAG(created_at) OVER (PARTITION BY product_sku, merchant_id ORDER BY created_at)))/60 as minutes_since_last
FROM price_history
WHERE recorded_date >= CURRENT_DATE - INTERVAL '30 days'
HAVING EXTRACT(EPOCH FROM (created_at - LAG(created_at) OVER (PARTITION BY product_sku, merchant_id ORDER BY created_at)))/60 < 60  -- Less than 1 hour apart
ORDER BY product_sku, merchant_id, created_at DESC
LIMIT 30;

-- 4. Check data sources to see if duplicates come from different sync processes
SELECT 
    'DATA SOURCE ANALYSIS' as analysis_type,
    data_source,
    COUNT(*) as total_records,
    COUNT(DISTINCT product_sku || '|' || merchant_id::text || '|' || recorded_date::text) as unique_product_date_combos,
    COUNT(*) - COUNT(DISTINCT product_sku || '|' || merchant_id::text || '|' || recorded_date::text) as potential_duplicates_within_source
FROM price_history
WHERE recorded_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY data_source
ORDER BY potential_duplicates_within_source DESC;

-- 5. Sample problematic records for detailed inspection
SELECT 
    'SAMPLE RECENT RECORDS' as analysis_type,
    product_sku,
    merchant_id,
    recorded_date,
    price,
    is_sale,
    data_source,
    created_at,
    -- Check if there are other records for same product on same date
    (
        SELECT COUNT(*) - 1 
        FROM price_history ph2 
        WHERE ph2.product_sku = price_history.product_sku 
        AND ph2.merchant_id = price_history.merchant_id 
        AND ph2.recorded_date = price_history.recorded_date
    ) as other_records_same_date
FROM price_history
WHERE recorded_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 30;

-- 6. Check for any constraint issues
SELECT 
    'CONSTRAINT STATUS' as analysis_type,
    conname as constraint_name,
    contype as constraint_type,
    confupdtype,
    confdeltype,
    convalidated as is_validated,
    conkey,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'price_history'::regclass
ORDER BY conname;

-- 7. Check for timezone/date parsing issues
SELECT 
    'DATE TIMEZONE ANALYSIS' as analysis_type,
    recorded_date,
    COUNT(*) as records_count,
    COUNT(DISTINCT EXTRACT(HOUR FROM created_at)) as creation_hours_spread,
    MIN(created_at) as earliest_creation,
    MAX(created_at) as latest_creation,
    array_agg(DISTINCT data_source) as data_sources
FROM price_history
WHERE recorded_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY recorded_date
HAVING COUNT(*) > 100  -- Focus on days with lots of activity
ORDER BY recorded_date DESC;

-- 8. Summary statistics
SELECT 
    'SUMMARY STATISTICS' as analysis_type,
    COUNT(*) as total_price_history_records,
    COUNT(DISTINCT product_sku) as unique_products,
    COUNT(DISTINCT product_sku || '|' || merchant_id::text) as unique_product_merchant_combos,
    COUNT(DISTINCT recorded_date) as unique_dates,
    COUNT(DISTINCT product_sku || '|' || merchant_id::text || '|' || recorded_date::text) as unique_product_date_combos,
    COUNT(*) - COUNT(DISTINCT product_sku || '|' || merchant_id::text || '|' || recorded_date::text) as theoretical_duplicate_count,
    MIN(recorded_date) as earliest_date,
    MAX(recorded_date) as latest_date,
    COUNT(DISTINCT data_source) as data_sources_used
FROM price_history;