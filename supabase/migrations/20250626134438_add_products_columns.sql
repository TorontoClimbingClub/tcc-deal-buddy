-- Add missing columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sync_priority INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS availability_score FLOAT DEFAULT 1.0;