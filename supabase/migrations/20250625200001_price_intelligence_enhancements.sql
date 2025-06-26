-- Enhanced Price Intelligence Schema for TCC Deal Buddy
-- Adds comprehensive price tracking, alerts, and market intelligence

-- Enhance products table with product lifecycle tracking
ALTER TABLE products 
ADD COLUMN first_seen_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN last_available_date DATE,
ADD COLUMN availability_score FLOAT DEFAULT 1.0 CHECK (availability_score >= 0 AND availability_score <= 1),
ADD COLUMN sync_priority INTEGER DEFAULT 1 CHECK (sync_priority >= 1 AND sync_priority <= 5);

-- Enhance price_history with richer context
ALTER TABLE price_history 
ADD COLUMN price_change_percent FLOAT,
ADD COLUMN price_change_reason TEXT CHECK (price_change_reason IN ('sale_start', 'sale_end', 'regular_price_change', 'initial_tracking', 'inventory_clearance')),
ADD COLUMN seasonal_context TEXT,
ADD COLUMN data_source TEXT DEFAULT 'ProductSearch' CHECK (data_source IN ('ProductSearch', 'ProductPriceCheck', 'Manual'));

-- Create price alerts table
CREATE TABLE price_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_sku VARCHAR NOT NULL,
    merchant_id INTEGER NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('price_drop', 'back_in_stock', 'sale_starts', 'sale_ends', 'target_price')),
    target_price DECIMAL(10,2),
    target_discount_percent INTEGER CHECK (target_discount_percent >= 0 AND target_discount_percent <= 100),
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0,
    notification_methods TEXT[] DEFAULT ARRAY['email'], -- ['email', 'push', 'sms']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate alerts
    UNIQUE(user_id, product_sku, merchant_id, alert_type)
);

-- Create market intelligence tracking
CREATE TABLE market_trends (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category VARCHAR NOT NULL,
    subcategory VARCHAR,
    brand_name VARCHAR,
    merchant_id INTEGER,
    trend_period TEXT NOT NULL CHECK (trend_period IN ('daily', 'weekly', 'monthly', 'seasonal')),
    average_price DECIMAL(10,2),
    median_price DECIMAL(10,2),
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    total_products INTEGER DEFAULT 0,
    products_on_sale INTEGER DEFAULT 0,
    average_discount_percent FLOAT,
    calculated_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint for trend tracking
    UNIQUE(category, subcategory, brand_name, merchant_id, trend_period, calculated_date)
);

-- Create product sync queue for intelligent scheduling
CREATE TABLE sync_queue (
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

-- Enhanced sync jobs with more detailed tracking
ALTER TABLE sync_jobs 
ADD COLUMN job_subtype TEXT, -- 'full_catalog', 'favorites_only', 'price_history_backfill'
ADD COLUMN merchant_ids INTEGER[],
ADD COLUMN categories_synced TEXT[],
ADD COLUMN products_added INTEGER DEFAULT 0,
ADD COLUMN products_updated INTEGER DEFAULT 0,
ADD COLUMN price_history_entries INTEGER DEFAULT 0,
ADD COLUMN avg_processing_time_ms INTEGER;

-- Create indexes for new tables and enhanced queries
CREATE INDEX idx_products_first_seen ON products(first_seen_date);
CREATE INDEX idx_products_availability ON products(availability_score) WHERE availability_score < 1.0;
CREATE INDEX idx_products_sync_priority ON products(sync_priority, last_sync_date);

CREATE INDEX idx_price_history_change_reason ON price_history(price_change_reason);
CREATE INDEX idx_price_history_data_source ON price_history(data_source);
CREATE INDEX idx_price_history_product_date ON price_history(product_sku, merchant_id, recorded_date DESC);

CREATE INDEX idx_price_alerts_user_active ON price_alerts(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_price_alerts_product ON price_alerts(product_sku, merchant_id);
CREATE INDEX idx_price_alerts_type ON price_alerts(alert_type, is_active);

CREATE INDEX idx_market_trends_category_date ON market_trends(category, calculated_date DESC);
CREATE INDEX idx_market_trends_brand_date ON market_trends(brand_name, calculated_date DESC);

CREATE INDEX idx_sync_queue_priority_scheduled ON sync_queue(priority, scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_sync_queue_product ON sync_queue(product_sku, merchant_id);
CREATE INDEX idx_sync_queue_user ON sync_queue(requested_by_user_id);

-- Enable Row Level Security for new user tables
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for price_alerts
CREATE POLICY "Users can view their own price alerts" ON price_alerts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own price alerts" ON price_alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own price alerts" ON price_alerts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own price alerts" ON price_alerts
    FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at triggers for new tables
CREATE TRIGGER update_price_alerts_updated_at BEFORE UPDATE ON price_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create enhanced views for price intelligence

-- Price trends view with moving averages
CREATE OR REPLACE VIEW price_trends AS
SELECT 
    ph.product_sku,
    ph.merchant_id,
    ph.recorded_date,
    ph.price,
    ph.is_sale,
    ph.discount_percent,
    -- 7-day moving average
    AVG(ph.price) OVER (
        PARTITION BY ph.product_sku, ph.merchant_id 
        ORDER BY ph.recorded_date 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as avg_7_day_price,
    -- 30-day moving average
    AVG(ph.price) OVER (
        PARTITION BY ph.product_sku, ph.merchant_id 
        ORDER BY ph.recorded_date 
        ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
    ) as avg_30_day_price,
    -- 1-year price range
    MIN(ph.price) OVER (
        PARTITION BY ph.product_sku, ph.merchant_id 
        ORDER BY ph.recorded_date 
        ROWS BETWEEN 364 PRECEDING AND CURRENT ROW
    ) as yearly_low,
    MAX(ph.price) OVER (
        PARTITION BY ph.product_sku, ph.merchant_id 
        ORDER BY ph.recorded_date 
        ROWS BETWEEN 364 PRECEDING AND CURRENT ROW
    ) as yearly_high,
    -- Price volatility (standard deviation)
    STDDEV(ph.price) OVER (
        PARTITION BY ph.product_sku, ph.merchant_id 
        ORDER BY ph.recorded_date 
        ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
    ) as price_volatility_30d
FROM price_history ph
ORDER BY ph.product_sku, ph.merchant_id, ph.recorded_date DESC;

-- Best deals view with intelligence scoring
CREATE OR REPLACE VIEW best_deals AS
SELECT 
    p.*,
    pt.yearly_low,
    pt.yearly_high,
    pt.avg_30_day_price,
    -- Deal quality score (0-100)
    CASE 
        WHEN pt.yearly_low IS NOT NULL AND pt.yearly_high IS NOT NULL THEN
            ROUND((((pt.yearly_high - p.sale_price) / (pt.yearly_high - pt.yearly_low)) * 100)::numeric, 1)
        ELSE NULL
    END as deal_quality_score,
    -- Price position (how current price compares to historical range)
    CASE 
        WHEN pt.yearly_low IS NOT NULL AND pt.yearly_high IS NOT NULL THEN
            ROUND((((p.sale_price - pt.yearly_low) / (pt.yearly_high - pt.yearly_low)) * 100)::numeric, 1)
        ELSE NULL
    END as price_position_percent,
    -- Trend indicator
    CASE 
        WHEN pt.avg_30_day_price IS NOT NULL THEN
            CASE 
                WHEN p.sale_price < pt.avg_30_day_price * 0.95 THEN 'great_price'
                WHEN p.sale_price < pt.avg_30_day_price * 1.05 THEN 'good_price'
                ELSE 'regular_price'
            END
        ELSE 'new_item'
    END as price_trend_status
FROM products p
LEFT JOIN price_trends pt ON p.sku = pt.product_sku 
    AND p.merchant_id = pt.merchant_id 
    AND pt.recorded_date = CURRENT_DATE
WHERE p.last_sync_date = CURRENT_DATE 
    AND p.sale_price IS NOT NULL
ORDER BY deal_quality_score DESC NULLS LAST, p.discount_percent DESC;

-- User alerts summary view
CREATE VIEW user_alerts_summary AS
SELECT 
    pa.user_id,
    COUNT(*) as total_alerts,
    COUNT(*) FILTER (WHERE pa.is_active = true) as active_alerts,
    COUNT(*) FILTER (WHERE pa.alert_type = 'price_drop') as price_drop_alerts,
    COUNT(*) FILTER (WHERE pa.alert_type = 'target_price') as target_price_alerts,
    COUNT(*) FILTER (WHERE pa.last_triggered_at >= CURRENT_DATE - INTERVAL '7 days') as recent_triggers,
    MAX(pa.last_triggered_at) as last_alert_triggered
FROM price_alerts pa
GROUP BY pa.user_id;

-- Market intelligence view
CREATE VIEW category_insights AS
SELECT 
    p.category,
    p.subcategory,
    COUNT(*) as total_products,
    COUNT(*) FILTER (WHERE p.sale_price < p.retail_price) as products_on_sale,
    ROUND(AVG(p.discount_percent) FILTER (WHERE p.discount_percent > 0), 1) as avg_discount_percent,
    ROUND(AVG(p.sale_price), 2) as avg_sale_price,
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.sale_price), 2) as median_price,
    MIN(p.sale_price) as min_price,
    MAX(p.sale_price) as max_price,
    COUNT(DISTINCT p.brand_name) as unique_brands,
    COUNT(DISTINCT p.merchant_id) as merchants_count
FROM products p
WHERE p.last_sync_date = CURRENT_DATE
    AND p.sale_price IS NOT NULL
GROUP BY p.category, p.subcategory
ORDER BY total_products DESC;

-- Grant permissions for new tables and views
GRANT SELECT ON price_alerts TO authenticated;
GRANT SELECT ON market_trends TO authenticated;
GRANT SELECT ON sync_queue TO authenticated;
GRANT SELECT ON price_trends TO authenticated;
GRANT SELECT ON best_deals TO authenticated;
GRANT SELECT ON user_alerts_summary TO authenticated;
GRANT SELECT ON category_insights TO authenticated;

-- Service role permissions for background processing
GRANT ALL ON price_alerts TO service_role;
GRANT ALL ON market_trends TO service_role;
GRANT ALL ON sync_queue TO service_role;

-- Add helpful comments
COMMENT ON TABLE price_alerts IS 'User-configured price monitoring and notification alerts';
COMMENT ON TABLE market_trends IS 'Aggregated market intelligence and category trend analysis';
COMMENT ON TABLE sync_queue IS 'Intelligent product sync scheduling and priority queue';
COMMENT ON VIEW price_trends IS 'Historical price analysis with moving averages and volatility';
COMMENT ON VIEW best_deals IS 'Current deals ranked by historical price intelligence';
COMMENT ON VIEW user_alerts_summary IS 'Per-user alert statistics and recent activity';
COMMENT ON VIEW category_insights IS 'Category-level market analysis and pricing insights';

-- Create functions for price intelligence

-- Function to calculate deal quality score
CREATE OR REPLACE FUNCTION calculate_deal_quality(
    current_price DECIMAL(10,2),
    yearly_low DECIMAL(10,2),
    yearly_high DECIMAL(10,2)
) RETURNS INTEGER AS $$
BEGIN
    IF yearly_low IS NULL OR yearly_high IS NULL OR yearly_high = yearly_low THEN
        RETURN NULL;
    END IF;
    
    RETURN ROUND(((yearly_high - current_price) / (yearly_high - yearly_low)) * 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to trigger price alerts
CREATE OR REPLACE FUNCTION check_price_alerts()
RETURNS TRIGGER AS $$
DECLARE
    alert_record RECORD;
    should_trigger BOOLEAN;
BEGIN
    -- Check for relevant price alerts when price history is updated
    FOR alert_record IN 
        SELECT * FROM price_alerts 
        WHERE product_sku = NEW.product_sku 
        AND merchant_id = NEW.merchant_id 
        AND is_active = true
    LOOP
        should_trigger := false;
        
        -- Check different alert types
        CASE alert_record.alert_type
            WHEN 'price_drop' THEN
                -- Trigger if price dropped and it's been at least 1 day since last trigger
                should_trigger := NEW.price < LAG(price) OVER (ORDER BY recorded_date) 
                    AND (alert_record.last_triggered_at IS NULL 
                         OR alert_record.last_triggered_at < CURRENT_DATE - INTERVAL '1 day');
            
            WHEN 'target_price' THEN
                -- Trigger if price is at or below target
                should_trigger := alert_record.target_price IS NOT NULL 
                    AND NEW.price <= alert_record.target_price;
            
            WHEN 'sale_starts' THEN
                -- Trigger if item goes on sale
                should_trigger := NEW.is_sale = true 
                    AND OLD.is_sale = false;
        END CASE;
        
        -- Update alert if triggered
        IF should_trigger THEN
            UPDATE price_alerts 
            SET last_triggered_at = NOW(),
                trigger_count = trigger_count + 1,
                updated_at = NOW()
            WHERE id = alert_record.id;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for price alert checking
CREATE TRIGGER check_price_alerts_trigger
    AFTER INSERT OR UPDATE ON price_history
    FOR EACH ROW
    EXECUTE FUNCTION check_price_alerts();