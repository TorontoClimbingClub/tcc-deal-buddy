/**
 * Filter Hash Utility
 * Generates deterministic 8-digit IDs from filter combinations for sharing and tracking
 */

import { GlobalFilterState } from '../contexts/FilterContext';

/**
 * Simple CRC32 implementation for consistent hashing
 */
function crc32(str: string): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0; // Convert to unsigned 32-bit
}

/**
 * Normalize filter state to deterministic string for hashing
 */
export function normalizeFilterState(filters: Partial<GlobalFilterState>): string {
  const parts: string[] = [];

  // Search term (lowercase, trimmed)
  if (filters.search && filters.search.trim()) {
    parts.push(`search:${filters.search.toLowerCase().trim()}`);
  }

  // Categories (sorted alphabetically)
  if (filters.categories && filters.categories.length > 0) {
    const sortedCategories = [...filters.categories].sort();
    parts.push(`categories:${sortedCategories.join(',')}`);
  }

  // Brands (sorted alphabetically)
  if (filters.brands && filters.brands.length > 0) {
    const sortedBrands = [...filters.brands].sort();
    parts.push(`brands:${sortedBrands.join(',')}`);
  }

  // Price range (only if different from default 0-10000)
  if (filters.priceRange && 
      (filters.priceRange.min > 0 || filters.priceRange.max < 10000)) {
    parts.push(`price:${filters.priceRange.min}-${filters.priceRange.max}`);
  }

  // On sale flag
  if (filters.onSale) {
    parts.push('sale:true');
  }

  // Minimum discount (only if > 0)
  if (filters.discountMin && filters.discountMin > 0) {
    parts.push(`discount:${filters.discountMin}`);
  }

  // Sort by (only if not default)
  if (filters.sortBy && filters.sortBy !== 'discount') {
    parts.push(`sort:${filters.sortBy}`);
  }

  // View mode (only if not default grid)
  if (filters.viewMode && filters.viewMode !== 'grid') {
    parts.push(`view:${filters.viewMode}`);
  }

  return parts.join('|');
}

/**
 * Generate 8-character alphanumeric deterministic ID from filter state
 * Uses base 36 (0-9, a-z) for maximum combinations: 36^8 = 2.8 trillion possibilities
 */
export function generateFilterId(filters: Partial<GlobalFilterState>): string {
  const normalized = normalizeFilterState(filters);
  
  // Return 'default0' for empty filters (8 chars)
  if (!normalized) {
    return 'default0';
  }

  const hash = crc32(normalized);
  
  // Convert to base 36 (0-9, a-z) and ensure 8 characters
  let filterId = hash.toString(36).toLowerCase();
  
  // Pad or truncate to exactly 8 characters
  if (filterId.length < 8) {
    filterId = filterId.padStart(8, '0');
  } else if (filterId.length > 8) {
    filterId = filterId.substring(0, 8);
  }
  
  return filterId;
}

/**
 * Check if a filter state is meaningful (not empty/default)
 */
export function isFilterStateMeaningful(filters: Partial<GlobalFilterState>): boolean {
  return normalizeFilterState(filters).length > 0;
}

/**
 * Parse filter ID from various sources (URL, user input, etc.)
 */
export function parseFilterId(input: string): string | null {
  if (!input) return null;
  
  // Handle 'default0' case (new 8-char format)
  if (input.toLowerCase() === 'default0' || input.toLowerCase() === 'default') {
    return 'default0';
  }
  
  // Extract 8-character alphanumeric ID from input
  const match = input.match(/[a-z0-9]{8}/i);
  return match ? match[0].toLowerCase() : null;
}


/**
 * Create a human-readable description of filter state for UI display
 */
export function describeFilterState(filters: Partial<GlobalFilterState>): string {
  const parts: string[] = [];

  if (filters.search) {
    parts.push(`"${filters.search}"`);
  }

  if (filters.categories && filters.categories.length > 0) {
    if (filters.categories.length === 1) {
      parts.push(filters.categories[0]);
    } else {
      parts.push(`${filters.categories.length} categories`);
    }
  }

  if (filters.brands && filters.brands.length > 0) {
    if (filters.brands.length === 1) {
      parts.push(filters.brands[0]);
    } else {
      parts.push(`${filters.brands.length} brands`);
    }
  }

  if (filters.priceRange && 
      (filters.priceRange.min > 0 || filters.priceRange.max < 10000)) {
    parts.push(`$${filters.priceRange.min}-${filters.priceRange.max}`);
  }

  if (filters.onSale) {
    parts.push('On Sale');
  }

  if (filters.discountMin && filters.discountMin > 0) {
    parts.push(`${filters.discountMin}%+ discount`);
  }

  if (parts.length === 0) {
    return 'All products';
  }

  return parts.join(' • ');
}

/**
 * Validate that a filter ID matches the expected format
 */
export function isValidFilterId(filterId: string): boolean {
  return filterId === 'default0' || filterId === 'default' || /^[a-z0-9]{8}$/i.test(filterId);
}

export default {
  generateFilterId,
  normalizeFilterState,
  isFilterStateMeaningful,
  parseFilterId,
  describeFilterState,
  isValidFilterId
};