
// Shared filtering logic for consistent deal queries across components
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { Database } from '../integrations/supabase/types';

type CurrentDealsView = Database['public']['Views']['current_deals'];
type ProductsTable = Database['public']['Tables']['products'];

/**
 * Common filters applied to deal queries to ensure consistency
 * between dashboard stats and All Deals page
 */
export function applyDealFilters<T extends Record<string, unknown>>(
  query: PostgrestFilterBuilder<Database['public'], T, T[]>
): PostgrestFilterBuilder<Database['public'], T, T[]> {
  return query
    .eq('merchant_id', DEAL_FILTERS.MERCHANT_ID)
    .gte('last_sync_date', getDealDateFilter())
    .not('sale_price', 'is', null)
    .not('retail_price', 'is', null)
    .gt('sale_price', 0)
    .gt('retail_price', 0);
}

/**
 * Get the date filter string used for deal queries
 */
export function getDealDateFilter(): string {
  return new Date(Date.now() - DEAL_FILTERS.DATE_RANGE_DAYS * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
}

/**
 * Standard deal filter criteria
 */
export const DEAL_FILTERS = {
  MERCHANT_ID: 18557,
  DATE_RANGE_DAYS: 7,
} as const;
