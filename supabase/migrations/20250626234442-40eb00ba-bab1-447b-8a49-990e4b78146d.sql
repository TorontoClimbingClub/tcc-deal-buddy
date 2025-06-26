
-- Create SKU API Tracking System for Stateful Price History Sync
-- This system enables resumable price history collection by tracking API call status per SKU

-- Table to track API call status for each SKU
CREATE TABLE sku_api_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR NOT NULL,
  merchant_id INTEGER NOT NULL,
  last_api_call TIMESTAMPTZ,
  last_successful_call TIMESTAMPTZ,
  api_call_count INTEGER DEFAULT 0,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'no_data')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sku, merchant_id)
);

-- Create indexes for efficient querying
CREATE INDEX idx_sku_api_tracking_status ON sku_api_tracking(status);
CREATE INDEX idx_sku_api_tracking_last_api_call ON sku_api_tracking(last_api_call);
CREATE INDEX idx_sku_api_tracking_merchant_status ON sku_api_tracking(merchant_id, status);

-- View to monitor overall sync progress
CREATE VIEW price_sync_progress AS
SELECT 
  COUNT(*) as total_skus,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'no_data' THEN 1 END) as no_data,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing,
  ROUND(
    (COUNT(CASE WHEN status IN ('completed', 'no_data') THEN 1 END) * 100.0) / 
    NULLIF(COUNT(*), 0), 2
  ) as completion_percentage,
  MAX(last_api_call) as last_activity,
  SUM(api_call_count) as total_api_calls_made
FROM sku_api_tracking;

-- View to show recent activity and next items to process
CREATE VIEW sync_activity_status AS
SELECT 
  status,
  COUNT(*) as count,
  MIN(last_api_call) as oldest_attempt,
  MAX(last_api_call) as newest_attempt,
  AVG(api_call_count) as avg_api_calls
FROM sku_api_tracking 
GROUP BY status
ORDER BY 
  CASE status 
    WHEN 'processing' THEN 1 
    WHEN 'failed' THEN 2 
    WHEN 'pending' THEN 3 
    WHEN 'completed' THEN 4 
    WHEN 'no_data' THEN 5 
  END;

-- Function to populate initial SKU data from existing products
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
$$ LANGUAGE plpgsql;

-- Function to cleanup stuck processing records (older than 30 minutes)
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
$$ LANGUAGE plpgsql;

-- Function to reset failed SKUs for retry (older than 1 hour)
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
$$ LANGUAGE plpgsql;

-- Enable RLS for security (service role can access everything)
ALTER TABLE sku_api_tracking ENABLE ROW LEVEL SECURITY;

-- Service role policy (used by Edge Functions)
CREATE POLICY "Service role can manage sku_api_tracking" ON sku_api_tracking
FOR ALL TO service_role
USING (true);

-- Read-only access for authenticated users (for monitoring)
CREATE POLICY "Authenticated users can view sku_api_tracking" ON sku_api_tracking
FOR SELECT TO authenticated
USING (true);

-- Comment for documentation
COMMENT ON TABLE sku_api_tracking IS 'Tracks API call status for price history sync, enabling resumable operations within Supabase timeout constraints';
COMMENT ON VIEW price_sync_progress IS 'Real-time progress monitoring for price history sync operations';
COMMENT ON VIEW sync_activity_status IS 'Activity breakdown by status with timing information';
