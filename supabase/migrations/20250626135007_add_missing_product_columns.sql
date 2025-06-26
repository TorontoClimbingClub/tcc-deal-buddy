-- Add missing columns to products table for intelligent sync functionality

-- Add sync_priority column for prioritizing product sync operations
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sync_priority INTEGER DEFAULT 3 CHECK (sync_priority >= 1 AND sync_priority <= 5);

-- Add availability_score column for tracking product availability
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS availability_score FLOAT DEFAULT 1.0 CHECK (availability_score >= 0 AND availability_score <= 1);

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_products_sync_priority ON products(sync_priority, last_sync_date);
CREATE INDEX IF NOT EXISTS idx_products_availability ON products(availability_score) WHERE availability_score < 1.0;

-- Add comments for documentation
COMMENT ON COLUMN products.sync_priority IS 'Priority for sync operations (1=highest, 5=lowest)';
COMMENT ON COLUMN products.availability_score IS 'Product availability score (0.0=unavailable, 1.0=fully available)';