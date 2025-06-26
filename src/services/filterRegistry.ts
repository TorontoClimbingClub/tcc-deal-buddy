/**
 * Automatic Filter Registry
 * Automatically saves ALL filter combinations so any hash ID can be imported later
 * No manual saving required - every filter state is automatically preserved
 */

import { GlobalFilterState } from '../contexts/FilterContext';
import { generateFilterId, isFilterStateMeaningful, describeFilterState } from '../utils/filterHash';

export interface FilterRegistryEntry {
  id: string; // Hash-based alphanumeric ID
  filters: Partial<GlobalFilterState>;
  firstSeen: Date;
  lastUsed: Date;
  usageCount: number;
  description: string;
  productCount?: number; // Last known product count
}

class FilterRegistryService {
  private readonly STORAGE_KEY = 'tcc-filter-registry';
  private readonly MAX_ENTRIES = 10000; // Reasonable limit for localStorage
  private readonly CLEANUP_THRESHOLD = 12000; // Start cleanup when we exceed this
  
  private registry: Map<string, FilterRegistryEntry> = new Map();
  private lastSaved: Date | null = null;

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Auto-register a filter state (called whenever filters change)
   * This ensures ALL filter combinations are automatically saved
   */
  autoRegister(filters: Partial<GlobalFilterState>, productCount?: number): string {
    // Don't register empty/meaningless filters
    if (!isFilterStateMeaningful(filters)) {
      return 'default0';
    }

    const filterId = generateFilterId(filters);
    const description = describeFilterState(filters);
    const now = new Date();

    const existingEntry = this.registry.get(filterId);
    
    if (existingEntry) {
      // Update existing entry
      this.registry.set(filterId, {
        ...existingEntry,
        lastUsed: now,
        usageCount: existingEntry.usageCount + 1,
        productCount: productCount ?? existingEntry.productCount,
        // Update description in case filter format improved
        description
      });
    } else {
      // Create new entry
      this.registry.set(filterId, {
        id: filterId,
        filters: { ...filters },
        firstSeen: now,
        lastUsed: now,
        usageCount: 1,
        description,
        productCount
      });
    }

    // Cleanup old entries if we're getting too large
    this.cleanupIfNeeded();
    
    // Save to localStorage (debounced)
    this.saveToStorage();
    
    return filterId;
  }

  /**
   * Get a registered filter by ID
   */
  getFilter(filterId: string): FilterRegistryEntry | null {
    if (filterId === 'default0' || filterId === 'default') {
      return {
        id: 'default0',
        filters: {},
        firstSeen: new Date(),
        lastUsed: new Date(),
        usageCount: 1,
        description: 'All products',
        productCount: 0
      };
    }

    return this.registry.get(filterId) || null;
  }

  /**
   * Check if a filter ID exists in registry
   */
  hasFilter(filterId: string): boolean {
    if (filterId === 'default0' || filterId === 'default') {
      return true;
    }
    return this.registry.has(filterId);
  }

  /**
   * Get all registered filters (for debugging/analytics)
   */
  getAllFilters(): FilterRegistryEntry[] {
    return Array.from(this.registry.values()).sort((a, b) => 
      b.lastUsed.getTime() - a.lastUsed.getTime()
    );
  }

  /**
   * Get most popular filters (by usage count)
   */
  getPopularFilters(limit = 10): FilterRegistryEntry[] {
    return Array.from(this.registry.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  /**
   * Get recently used filters
   */
  getRecentFilters(limit = 10): FilterRegistryEntry[] {
    return Array.from(this.registry.values())
      .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
      .slice(0, limit);
  }

  /**
   * Update product count for a filter
   */
  updateProductCount(filterId: string, count: number): void {
    const entry = this.registry.get(filterId);
    if (entry) {
      entry.productCount = count;
      entry.lastUsed = new Date();
      this.saveToStorage();
    }
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    totalFilters: number;
    oldestFilter: Date | null;
    newestFilter: Date | null;
    mostUsedCount: number;
    totalUsage: number;
  } {
    const entries = Array.from(this.registry.values());
    
    if (entries.length === 0) {
      return {
        totalFilters: 0,
        oldestFilter: null,
        newestFilter: null,
        mostUsedCount: 0,
        totalUsage: 0
      };
    }

    const oldestFilter = new Date(Math.min(...entries.map(e => e.firstSeen.getTime())));
    const newestFilter = new Date(Math.max(...entries.map(e => e.firstSeen.getTime())));
    const mostUsedCount = Math.max(...entries.map(e => e.usageCount));
    const totalUsage = entries.reduce((sum, e) => sum + e.usageCount, 0);

    return {
      totalFilters: entries.length,
      oldestFilter,
      newestFilter,
      mostUsedCount,
      totalUsage
    };
  }

  /**
   * Clear the entire registry (useful for testing/reset)
   */
  clearRegistry(): void {
    this.registry.clear();
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Private helper methods

  private cleanupIfNeeded(): void {
    if (this.registry.size <= this.CLEANUP_THRESHOLD) return;

    console.log(`🧹 Filter registry cleanup: ${this.registry.size} entries, cleaning oldest...`);

    // Sort by last used (oldest first) and remove least used old entries
    const entries = Array.from(this.registry.entries())
      .sort(([,a], [,b]) => {
        // Primary: last used date (older = more likely to remove)
        const dateDiff = a.lastUsed.getTime() - b.lastUsed.getTime();
        if (Math.abs(dateDiff) > 7 * 24 * 60 * 60 * 1000) { // 7 days difference
          return dateDiff;
        }
        // Secondary: usage count (less used = more likely to remove)
        return a.usageCount - b.usageCount;
      });

    // Remove oldest/least used entries until we're back to reasonable size
    const entriesToRemove = this.registry.size - this.MAX_ENTRIES;
    for (let i = 0; i < entriesToRemove && i < entries.length; i++) {
      this.registry.delete(entries[i][0]);
    }

    console.log(`✅ Filter registry cleanup complete: ${this.registry.size} entries remaining`);
  }

  private saveToStorage(): void {
    try {
      // Debounce saves to avoid excessive localStorage writes
      const now = new Date();
      if (this.lastSaved && (now.getTime() - this.lastSaved.getTime()) < 1000) {
        return;
      }

      const data = {
        entries: Array.from(this.registry.entries()).map(([id, entry]) => [
          id,
          {
            ...entry,
            firstSeen: entry.firstSeen.toISOString(),
            lastUsed: entry.lastUsed.toISOString()
          }
        ]),
        lastUpdated: now.toISOString()
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      this.lastSaved = now;
    } catch (error) {
      console.warn('Failed to save filter registry to localStorage:', error);
      // If localStorage is full, try cleanup and save again
      if (error.name === 'QuotaExceededError') {
        this.cleanupIfNeeded();
        try {
          const data = {
            entries: Array.from(this.registry.entries()),
            lastUpdated: new Date().toISOString()
          };
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (retryError) {
          console.error('Failed to save filter registry after cleanup:', retryError);
        }
      }
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        
        if (data.entries && Array.isArray(data.entries)) {
          this.registry = new Map(
            data.entries.map(([id, entry]: [string, any]) => [
              id,
              {
                ...entry,
                firstSeen: new Date(entry.firstSeen),
                lastUsed: new Date(entry.lastUsed)
              }
            ])
          );
        }
        
        console.log(`📂 Loaded ${this.registry.size} filter combinations from localStorage`);
      }
    } catch (error) {
      console.warn('Failed to load filter registry from localStorage:', error);
      this.registry.clear();
    }
  }
}

// Export singleton instance
export const filterRegistryService = new FilterRegistryService();

// Export class for testing
export { FilterRegistryService };