
-- Fix Security Definer views by recreating them without SECURITY DEFINER
DROP VIEW IF EXISTS public.user_cart_summary;
DROP VIEW IF EXISTS public.current_deals;

-- Recreate current_deals view without SECURITY DEFINER
CREATE VIEW public.current_deals AS
SELECT 
    p.*,
    ROUND(((retail_price - sale_price) / retail_price * 100)::numeric, 2) as calculated_discount_percent
FROM products p
WHERE p.last_sync_date = CURRENT_DATE 
    AND p.sale_price IS NOT NULL 
    AND p.retail_price IS NOT NULL
    AND p.sale_price < p.retail_price
ORDER BY calculated_discount_percent DESC;

-- Recreate user_cart_summary view without SECURITY DEFINER
CREATE VIEW public.user_cart_summary AS
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

-- Grant proper permissions
GRANT SELECT ON public.products TO authenticated;
GRANT SELECT ON public.price_history TO authenticated;
GRANT SELECT ON public.current_deals TO authenticated;
GRANT SELECT ON public.user_cart_summary TO authenticated;
