-- Fix current_deals view to use latest sync date instead of CURRENT_DATE
-- This ensures dashboard shows accurate counts from most recent data

-- Drop the existing view
DROP VIEW IF EXISTS current_deals;

-- Create updated view that uses latest sync date
CREATE VIEW current_deals AS
SELECT 
    p.*,
    ROUND(((retail_price - sale_price) / retail_price * 100)::numeric, 2) as calculated_discount_percent
FROM products p
WHERE p.last_sync_date = (SELECT MAX(last_sync_date) FROM products)
    AND p.sale_price IS NOT NULL 
    AND p.retail_price IS NOT NULL
    AND p.sale_price < p.retail_price
    AND p.merchant_id = 18557  -- Only valid MEC merchant
ORDER BY calculated_discount_percent DESC;

-- Update RLS policy for the new view
ALTER VIEW current_deals OWNER TO postgres;

-- Grant permissions
GRANT SELECT ON current_deals TO anon;
GRANT SELECT ON current_deals TO authenticated;