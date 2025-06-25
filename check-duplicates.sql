-- Check total products for today
SELECT COUNT(*) as total_products 
FROM products 
WHERE last_sync_date = CURRENT_DATE;

-- Check for SKU duplicates
SELECT 
    sku,
    COUNT(*) as duplicate_count,
    array_agg(DISTINCT merchant_name) as merchants,
    array_agg(DISTINCT name) as product_names
FROM products 
WHERE last_sync_date = CURRENT_DATE
GROUP BY sku 
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC
LIMIT 10;

-- Check for exact duplicates (same name + merchant)
SELECT 
    name,
    merchant_name,
    COUNT(*) as duplicate_count,
    array_agg(DISTINCT sku) as skus
FROM products 
WHERE last_sync_date = CURRENT_DATE
GROUP BY name, merchant_name 
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC
LIMIT 10;

-- Summary statistics
SELECT 
    COUNT(DISTINCT sku) as unique_skus,
    COUNT(DISTINCT name) as unique_product_names,
    COUNT(DISTINCT merchant_name) as unique_merchants,
    COUNT(DISTINCT CONCAT(name, '|', merchant_name)) as unique_name_merchant_combos,
    COUNT(*) as total_records,
    COUNT(*) - COUNT(DISTINCT CONCAT(name, '|', merchant_name)) as exact_duplicate_count
FROM products 
WHERE last_sync_date = CURRENT_DATE;