
-- Drop and recreate the current_deals view with broader date range
DROP VIEW IF EXISTS public.current_deals;

CREATE VIEW public.current_deals AS
SELECT 
    p.*,
    ROUND(((p.retail_price - p.sale_price) / p.retail_price * 100)::numeric, 2) as calculated_discount_percent
FROM products p
WHERE p.last_sync_date >= CURRENT_DATE - INTERVAL '7 days'  -- Products synced in last 7 days
    AND p.sale_price IS NOT NULL 
    AND p.retail_price IS NOT NULL
    AND p.sale_price < p.retail_price  -- Only products on sale
    AND p.sale_price > 0  -- Exclude invalid prices
    AND p.retail_price > 0  -- Exclude invalid prices
ORDER BY p.last_sync_date DESC, calculated_discount_percent DESC;

-- Grant proper permissions
GRANT SELECT ON public.current_deals TO authenticated;
GRANT SELECT ON public.current_deals TO anon;
