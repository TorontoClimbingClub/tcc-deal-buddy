// Shared filtering logic for consistent deal queries across components
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { Database } from '../integrations/supabase/types';

type CurrentDealsView = Database['public']['Views']['current_deals'];

/**
 * Common filters applied to deal queries to ensure consistency
 * between dashboard stats and All Deals page
 */
export function applyDealFilters<T>(
  query: PostgrestFilterBuilder<Database['public'], T, T[]>
): PostgrestFilterBuilder<Database['public'], T, T[]> {
  return query
    .eq('merchant_id', 18557) // Only valid MEC merchant
    .gte('last_sync_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Last 7 days
    .not('sale_price', 'is', null)
    .not('retail_price', 'is', null)
    .gt('sale_price', 0)
    .gt('retail_price', 0);
}

/**
 * Get the date filter string used for deal queries
 */
export function getDealDateFilter(): string {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
}

/**
 * Standard deal filter criteria
 */
export const DEAL_FILTERS = {
  MERCHANT_ID: 18557,
  DATE_RANGE_DAYS: 7,
} as const;