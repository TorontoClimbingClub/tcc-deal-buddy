-- Price History Duplicate Cleanup Script
-- IMPORTANT: Run analyze-price-history-duplicates.sql first to understand the data
-- This script will remove duplicate records while preserving the most recent/accurate data

-- Step 1: Backup approach - Create a temporary table with duplicates for review
CREATE TEMP TABLE duplicate_price_records AS
SELECT 
    product_sku,
    merchant_id,
    recorded_date,
    COUNT(*) as duplicate_count,
    array_agg(id ORDER BY created_at DESC) as all_ids,
    array_agg(price ORDER BY created_at DESC) as all_prices,
    array_agg(is_sale ORDER BY created_at DESC) as all_sale_flags,
    array_agg(data_source ORDER BY created_at DESC) as all_sources,
    array_agg(created_at ORDER BY created_at DESC) as all_created_times
FROM price_history
GROUP BY product_sku, merchant_id, recorded_date
HAVING COUNT(*) > 1;

-- Step 2: Show what we found (for review before deletion)
SELECT 
    'DUPLICATES FOUND' as action,
    COUNT(*) as groups_with_duplicates,
    SUM(duplicate_count) as total_duplicate_records,
    SUM(duplicate_count - 1) as records_to_delete
FROM duplicate_price_records;

-- Step 3: Show sample of what will be deleted
SELECT 
    'SAMPLE DELETION PREVIEW' as action,
    product_sku,
    merchant_id,
    recorded_date,
    duplicate_count,
    all_prices[1] as keep_price,      -- Most recent price (will keep)
    all_prices[2:] as delete_prices,  -- Older prices (will delete)
    all_sources[1] as keep_source,
    all_sources[2:] as delete_sources,
    all_ids[1] as keep_id,            -- Most recent ID (will keep)
    all_ids[2:] as delete_ids         -- Older IDs (will delete)
FROM duplicate_price_records
ORDER BY duplicate_count DESC
LIMIT 10;

-- Step 4: SAFE DELETION - Only run after reviewing the preview above
-- This keeps the most recent record (by created_at) for each duplicate group

-- First, create a table of IDs to delete (all but the most recent for each group)
CREATE TEMP TABLE ids_to_delete AS
SELECT 
    unnest(all_ids[2:array_length(all_ids,1)]) as id_to_delete
FROM duplicate_price_records
WHERE duplicate_count > 1;

-- Show count of records that will be deleted
SELECT 
    'DELETION SUMMARY' as action,
    COUNT(*) as records_to_delete
FROM ids_to_delete;

-- UNCOMMENT THE FOLLOWING LINE ONLY AFTER REVIEWING THE ANALYSIS
-- DELETE FROM price_history WHERE id IN (SELECT id_to_delete FROM ids_to_delete);

-- Step 5: Alternative approach - UPDATE duplicates instead of DELETE
-- This consolidates duplicate records by updating the most recent one with best data

-- Find the "best" record for each duplicate group (most recent with most complete data)
CREATE TEMP TABLE consolidated_records AS
SELECT DISTINCT ON (product_sku, merchant_id, recorded_date)
    product_sku,
    merchant_id,
    recorded_date,
    -- Choose the most recent record
    FIRST_VALUE(id) OVER (
        PARTITION BY product_sku, merchant_id, recorded_date 
        ORDER BY created_at DESC, 
                CASE WHEN data_source = 'ProductPriceCheck' THEN 1 ELSE 2 END,  -- Prefer ProductPriceCheck
                CASE WHEN price > 0 THEN 1 ELSE 2 END  -- Prefer valid prices
    ) as keep_id,
    -- Use the best available data
    FIRST_VALUE(price) OVER (
        PARTITION BY product_sku, merchant_id, recorded_date 
        ORDER BY created_at DESC,
                CASE WHEN price > 0 THEN 1 ELSE 2 END
    ) as best_price,
    FIRST_VALUE(is_sale) OVER (
        PARTITION BY product_sku, merchant_id, recorded_date 
        ORDER BY created_at DESC
    ) as best_is_sale,
    FIRST_VALUE(discount_percent) OVER (
        PARTITION BY product_sku, merchant_id, recorded_date 
        ORDER BY created_at DESC,
                CASE WHEN discount_percent IS NOT NULL THEN 1 ELSE 2 END
    ) as best_discount_percent,
    FIRST_VALUE(data_source) OVER (
        PARTITION BY product_sku, merchant_id, recorded_date 
        ORDER BY created_at DESC,
                CASE WHEN data_source = 'ProductPriceCheck' THEN 1 ELSE 2 END
    ) as best_data_source
FROM price_history
WHERE (product_sku, merchant_id, recorded_date) IN (
    SELECT product_sku, merchant_id, recorded_date 
    FROM duplicate_price_records
);

-- Preview the consolidation
SELECT 
    'CONSOLIDATION PREVIEW' as action,
    COUNT(*) as duplicate_groups_to_consolidate
FROM consolidated_records;

-- Step 6: Create prevention mechanisms

-- Add a function to prevent future duplicates during INSERT/UPDATE
CREATE OR REPLACE FUNCTION prevent_price_history_duplicates()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if a record already exists for this product/merchant/date
    IF EXISTS (
        SELECT 1 FROM price_history 
        WHERE product_sku = NEW.product_sku 
        AND merchant_id = NEW.merchant_id 
        AND recorded_date = NEW.recorded_date
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    ) THEN
        -- Log the attempt and update existing record instead
        RAISE NOTICE 'Duplicate price history prevented for SKU: %, Merchant: %, Date: %', 
            NEW.product_sku, NEW.merchant_id, NEW.recorded_date;
        
        -- Update the existing record with the new data if it's more recent
        UPDATE price_history 
        SET 
            price = NEW.price,
            is_sale = NEW.is_sale,
            discount_percent = NEW.discount_percent,
            data_source = NEW.data_source,
            price_change_percent = NEW.price_change_percent,
            price_change_reason = NEW.price_change_reason,
            seasonal_context = NEW.seasonal_context,
            created_at = NOW()
        WHERE product_sku = NEW.product_sku 
        AND merchant_id = NEW.merchant_id 
        AND recorded_date = NEW.recorded_date;
        
        -- Return NULL to prevent the INSERT
        RETURN NULL;
    END IF;
    
    -- Allow the insert if no duplicate exists
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add the trigger (commented out - enable after testing)
-- CREATE TRIGGER prevent_price_history_duplicates_trigger
-- BEFORE INSERT ON price_history
-- FOR EACH ROW EXECUTE FUNCTION prevent_price_history_duplicates();

-- Step 7: Verification queries to run after cleanup
SELECT 
    'POST CLEANUP VERIFICATION' as verification,
    COUNT(*) as total_records,
    COUNT(DISTINCT product_sku || '|' || merchant_id::text || '|' || recorded_date::text) as unique_combinations,
    COUNT(*) - COUNT(DISTINCT product_sku || '|' || merchant_id::text || '|' || recorded_date::text) as remaining_duplicates,
    CASE 
        WHEN COUNT(*) = COUNT(DISTINCT product_sku || '|' || merchant_id::text || '|' || recorded_date::text) 
        THEN 'SUCCESS - No duplicates remain'
        ELSE 'WARNING - Duplicates still exist'
    END as cleanup_status
FROM price_history;

-- Final recommendation
SELECT 
    'RECOMMENDATION' as final_note,
    'Review the analysis results above. If satisfied, uncomment the DELETE statement and the trigger creation to complete the cleanup and prevention.' as next_steps;