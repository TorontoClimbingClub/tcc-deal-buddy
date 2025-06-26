
-- Create sync_queue table for price history backfill
CREATE TABLE IF NOT EXISTS sync_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_sku VARCHAR NOT NULL,
    merchant_id INTEGER NOT NULL,
    sync_type TEXT NOT NULL CHECK (sync_type IN ('full_history', 'price_check', 'availability_check')),
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    requested_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    api_calls_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_sku, merchant_id, sync_type, status) DEFERRABLE INITIALLY DEFERRED
);

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_sync_queue_priority_scheduled ON sync_queue(priority, scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_sync_queue_product ON sync_queue(product_sku, merchant_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_user ON sync_queue(requested_by_user_id);

-- Set up RLS and permissions
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON sync_queue TO authenticated;
GRANT ALL ON sync_queue TO service_role;

-- Create RLS policies for sync_queue
CREATE POLICY "Service role can manage sync_queue" ON sync_queue
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view sync_queue" ON sync_queue
FOR SELECT USING (true);

-- Fix RLS policies for price_history table to allow service_role access
DROP POLICY IF EXISTS "Service role can manage price_history" ON price_history;
CREATE POLICY "Service role can manage price_history" ON price_history
FOR ALL USING (auth.role() = 'service_role');

-- Ensure users can read price_history
DROP POLICY IF EXISTS "Users can read price_history" ON price_history;
CREATE POLICY "Users can read price_history" ON price_history
FOR SELECT USING (true);

-- Add comment for documentation
COMMENT ON TABLE sync_queue IS 'Intelligent product sync scheduling and priority queue for price history backfill';
