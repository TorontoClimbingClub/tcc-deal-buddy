
-- Drop existing policies on sku_api_tracking table
DROP POLICY IF EXISTS "Service role can manage sku_api_tracking" ON sku_api_tracking;
DROP POLICY IF EXISTS "Authenticated users can view sku_api_tracking" ON sku_api_tracking;

-- Create comprehensive service role policy (used by Edge Functions)
CREATE POLICY "Service role full access to sku_api_tracking" ON sku_api_tracking
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Create read-only policy for authenticated users (for monitoring)
CREATE POLICY "Authenticated users can read sku_api_tracking" ON sku_api_tracking
FOR SELECT TO authenticated
USING (true);

-- Ensure the populate_sku_tracking function runs with proper permissions
-- Update the function to be SECURITY DEFINER so it runs with owner privileges
CREATE OR REPLACE FUNCTION populate_sku_tracking()
RETURNS TABLE(inserted_count INTEGER) AS $$
BEGIN
  INSERT INTO sku_api_tracking (sku, merchant_id, status)
  SELECT DISTINCT p.sku, p.merchant_id, 'pending'
  FROM products p
  WHERE NOT EXISTS (
    SELECT 1 FROM sku_api_tracking sat 
    WHERE sat.sku = p.sku 
    AND sat.merchant_id = p.merchant_id
  );
  
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN QUERY SELECT inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function to service_role
GRANT EXECUTE ON FUNCTION populate_sku_tracking() TO service_role;

-- Also update the other helper functions to be SECURITY DEFINER
CREATE OR REPLACE FUNCTION cleanup_stuck_processing()
RETURNS TABLE(cleaned_count INTEGER) AS $$
BEGIN
  UPDATE sku_api_tracking 
  SET status = 'pending', 
      error_message = 'Reset from stuck processing state'
  WHERE status = 'processing' 
    AND last_api_call < NOW() - INTERVAL '30 minutes';
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  RETURN QUERY SELECT cleaned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reset_failed_skus()
RETURNS TABLE(reset_count INTEGER) AS $$
BEGIN
  UPDATE sku_api_tracking 
  SET status = 'pending', 
      error_message = NULL
  WHERE status = 'failed' 
    AND last_api_call < NOW() - INTERVAL '1 hour';
  
  GET DIAGNOSTICS reset_count = ROW_COUNT;
  RETURN QUERY SELECT reset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to service_role
GRANT EXECUTE ON FUNCTION cleanup_stuck_processing() TO service_role;
GRANT EXECUTE ON FUNCTION reset_failed_skus() TO service_role;
