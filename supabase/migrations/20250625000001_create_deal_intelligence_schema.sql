-- Create tables for TCC Deal Buddy enhanced features
-- Daily API sync + historical price tracking + cart functionality

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table (daily sync from AvantLink API)
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sku VARCHAR NOT NULL,
    merchant_id INTEGER NOT NULL,
    merchant_name VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    brand_name VARCHAR,
    sale_price DECIMAL(10,2),
    retail_price DECIMAL(10,2),
    discount_percent INTEGER,
    discount_amount DECIMAL(10,2),
    image_url TEXT,
    buy_url TEXT,
    description TEXT,
    category VARCHAR,
    subcategory VARCHAR,
    last_sync_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique products per sync date
    UNIQUE(sku, merchant_id, last_sync_date)
);

-- Price history table (daily snapshots for trend analysis)
CREATE TABLE price_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_sku VARCHAR NOT NULL,
    merchant_id INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_sale BOOLEAN NOT NULL DEFAULT FALSE,
    discount_percent INTEGER DEFAULT 0,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one price record per product per day
    UNIQUE(product_sku, merchant_id, recorded_date)
);

-- User favorites table (real-time user interactions)
CREATE TABLE user_favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_sku VARCHAR NOT NULL,
    merchant_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate favorites
    UNIQUE(user_id, product_sku, merchant_id)
);

-- User shopping cart table (real-time user interactions)
CREATE TABLE cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_sku VARCHAR NOT NULL,
    merchant_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate cart items (update quantity instead)
    UNIQUE(user_id, product_sku, merchant_id)
);

-- Sync jobs tracking table (monitor daily API operations)
CREATE TABLE sync_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_type VARCHAR NOT NULL CHECK (job_type IN ('daily_products', 'price_history', 'historical_sync')),
    status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    records_processed INTEGER DEFAULT 0,
    api_calls_used INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    sync_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Create indexes for performance optimization
CREATE INDEX idx_products_merchant_sync ON products(merchant_id, last_sync_date);
CREATE INDEX idx_products_sku_merchant ON products(sku, merchant_id);
CREATE INDEX idx_products_sale_price ON products(sale_price) WHERE sale_price IS NOT NULL;
CREATE INDEX idx_products_discount ON products(discount_percent) WHERE discount_percent > 0;

CREATE INDEX idx_price_history_product ON price_history(product_sku, merchant_id);
CREATE INDEX idx_price_history_date ON price_history(recorded_date DESC);
CREATE INDEX idx_price_history_sales ON price_history(is_sale) WHERE is_sale = TRUE;

CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_product ON user_favorites(product_sku, merchant_id);

CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_sku, merchant_id);

CREATE INDEX idx_sync_jobs_type_date ON sync_jobs(job_type, sync_date);
CREATE INDEX idx_sync_jobs_status ON sync_jobs(status);

-- Enable Row Level Security (RLS)
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_favorites
CREATE POLICY "Users can view their own favorites" ON user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON user_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for cart_items
CREATE POLICY "Users can view their own cart items" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" ON cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" ON cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" ON cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create helpful views for common queries
CREATE VIEW current_deals AS
SELECT 
    p.*,
    ROUND(((retail_price - sale_price) / retail_price * 100)::numeric, 2) as calculated_discount_percent
FROM products p
WHERE p.last_sync_date = CURRENT_DATE 
    AND p.sale_price IS NOT NULL 
    AND p.retail_price IS NOT NULL
    AND p.sale_price < p.retail_price
ORDER BY calculated_discount_percent DESC;

CREATE VIEW user_cart_summary AS
SELECT 
    c.user_id,
    COUNT(*) as item_count,
    SUM(c.quantity) as total_quantity,
    SUM(p.sale_price * c.quantity) as cart_total,
    SUM((p.retail_price - p.sale_price) * c.quantity) as total_savings
FROM cart_items c
JOIN products p ON c.product_sku = p.sku 
    AND c.merchant_id = p.merchant_id 
    AND p.last_sync_date = CURRENT_DATE
GROUP BY c.user_id;

-- Grant permissions for authenticated users
GRANT SELECT ON products TO authenticated;
GRANT SELECT ON price_history TO authenticated;
GRANT SELECT ON current_deals TO authenticated;
GRANT SELECT ON user_cart_summary TO authenticated;

-- Grant permissions for service role (for Edge Functions)
GRANT ALL ON products TO service_role;
GRANT ALL ON price_history TO service_role;
GRANT ALL ON sync_jobs TO service_role;

-- Add comments for documentation
COMMENT ON TABLE products IS 'Daily sync of sale items from AvantLink API';
COMMENT ON TABLE price_history IS 'Historical price tracking for trend analysis';
COMMENT ON TABLE user_favorites IS 'User-selected products for price monitoring';
COMMENT ON TABLE cart_items IS 'User shopping cart with savings calculations';
COMMENT ON TABLE sync_jobs IS 'Daily API sync job monitoring and logging';

COMMENT ON VIEW current_deals IS 'Current sale items with calculated discount percentages';
COMMENT ON VIEW user_cart_summary IS 'Aggregated cart totals and savings per user';