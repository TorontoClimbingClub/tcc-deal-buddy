-- Create sync_queue table for price history backfill
-- This is extracted from the price_intelligence_enhancements migration

-- Create product sync queue for intelligent scheduling
CREATE TABLE IF NOT EXISTS sync_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_sku VARCHAR NOT NULL,
    merchant_id INTEGER NOT NULL,
    sync_type TEXT NOT NULL CHECK (sync_type IN ('full_history', 'price_check', 'availability_check')),
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5), -- 1=highest, 5=lowest
    requested_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    api_calls_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate queue entries
    UNIQUE(product_sku, merchant_id, sync_type, status) DEFERRABLE INITIALLY DEFERRED
);

-- Create indexes for the sync_queue table
CREATE INDEX IF NOT EXISTS idx_sync_queue_priority_scheduled ON sync_queue(priority, scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_sync_queue_product ON sync_queue(product_sku, merchant_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_user ON sync_queue(requested_by_user_id);

-- Set up RLS and permissions
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT ON sync_queue TO authenticated;
GRANT ALL ON sync_queue TO service_role;

-- Add comment
COMMENT ON TABLE sync_queue IS 'Intelligent product sync scheduling and priority queue';

-- Also add missing columns to sync_jobs table if needed
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sync_jobs' AND column_name = 'job_subtype') THEN
        ALTER TABLE sync_jobs 
        ADD COLUMN job_subtype TEXT, -- 'full_catalog', 'favorites_only', 'price_history_backfill'
        ADD COLUMN merchant_ids INTEGER[],
        ADD COLUMN categories_synced TEXT[],
        ADD COLUMN products_added INTEGER DEFAULT 0,
        ADD COLUMN products_updated INTEGER DEFAULT 0,
        ADD COLUMN price_history_entries INTEGER DEFAULT 0,
        ADD COLUMN avg_processing_time_ms INTEGER;
    END IF;
END $$;