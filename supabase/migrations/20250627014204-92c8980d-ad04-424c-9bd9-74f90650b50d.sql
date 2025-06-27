
-- 1. Reset stuck processing SKUs to pending status
UPDATE sku_api_tracking
SET status = 'pending', 
    updated_at = NOW(),
    error_message = 'Reset from stuck processing state'
WHERE status = 'processing';

-- 2. Drop existing restrictive RLS policies on sku_api_tracking
DROP POLICY IF EXISTS "Service role full access to sku_api_tracking" ON sku_api_tracking;
DROP POLICY IF EXISTS "Authenticated users can read sku_api_tracking" ON sku_api_tracking;

-- 3. Create new RLS policies that allow anon role to manage tracking records
CREATE POLICY "Allow anon full access to sku_api_tracking" ON sku_api_tracking
FOR ALL TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated read access to sku_api_tracking" ON sku_api_tracking
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Allow service role full access to sku_api_tracking" ON sku_api_tracking
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- 4. Initialize tracking table with all products from the products table
INSERT INTO sku_api_tracking (sku, merchant_id, status, api_call_count, created_at, updated_at)
SELECT DISTINCT p.sku, p.merchant_id, 'pending', 0, NOW(), NOW()
FROM products p
ON CONFLICT (sku, merchant_id) DO NOTHING;

-- 5. Verify the initialization worked - show status breakdown
SELECT 
    status, 
    COUNT(*) as count,
    MIN(created_at) as oldest_record,
    MAX(updated_at) as newest_update
FROM sku_api_tracking
GROUP BY status
ORDER BY 
    CASE status 
        WHEN 'pending' THEN 1 
        WHEN 'processing' THEN 2 
        WHEN 'completed' THEN 3 
        WHEN 'failed' THEN 4 
        WHEN 'no_data' THEN 5 
    END;
