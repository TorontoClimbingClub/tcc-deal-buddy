/**
 * Category Validation Service
 * Tracks which categories have actual products and manages category availability
 * Ensures dropdown filters only show categories with results
 */

import { Product } from '../components/ProductCard';
import { getCategoryLevels, getNormalizedCategory } from '../utils/productTransform';

export interface CategoryInfo {
  name: string;
  count: number;
  lastSeen: Date;
  isActive: boolean;
  hierarchyLevel: number; // 0 = top level, 1 = sub, 2 = sub-sub
  parentCategory?: string;
  subcategories?: string[];
}

export interface CategoryValidationResult {
  availableCategories: CategoryInfo[];
  hiddenCategories: string[];
  totalProducts: number;
  categoriesWithProducts: number;
}

class CategoryValidationService {
  private readonly STORAGE_KEY = 'tcc-category-validation';
  private readonly MAX_AGE_DAYS = 7; // Hide categories not seen in 7 days
  
  private categoryCache: Map<string, CategoryInfo> = new Map();
  private lastUpdated: Date | null = null;

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Validate categories against current product list
   * Updates category counts and availability
   */
  validateCategories(products: Product[]): CategoryValidationResult {
    const now = new Date();
    const categoryCountMap = new Map<string, number>();
    const seenCategories = new Set<string>();

    // Count products per category (including hierarchy levels)
    products.forEach(product => {
      if (!product.category) return;

      // Get all levels of the category hierarchy
      const levels = getCategoryLevels(product.category);
      
      levels.forEach(level => {
        const normalizedLevel = level.trim();
        if (normalizedLevel) {
          seenCategories.add(normalizedLevel);
          categoryCountMap.set(
            normalizedLevel, 
            (categoryCountMap.get(normalizedLevel) || 0) + 1
          );
        }
      });
    });

    // Update category info
    const availableCategories: CategoryInfo[] = [];
    const hiddenCategories: string[] = [];

    // Process seen categories
    seenCategories.forEach(categoryName => {
      const count = categoryCountMap.get(categoryName) || 0;
      const hierarchyLevel = this.getHierarchyLevel(categoryName);
      
      const categoryInfo: CategoryInfo = {
        name: categoryName,
        count,
        lastSeen: now,
        isActive: count > 0,
        hierarchyLevel,
        parentCategory: this.getParentCategory(categoryName),
        subcategories: this.getSubcategories(categoryName, seenCategories)
      };

      this.categoryCache.set(categoryName, categoryInfo);
      
      if (count > 0) {
        availableCategories.push(categoryInfo);
      }
    });

    // Check for stale categories (not seen recently)
    this.categoryCache.forEach((info, categoryName) => {
      if (!seenCategories.has(categoryName)) {
        const daysSinceLastSeen = (now.getTime() - info.lastSeen.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLastSeen > this.MAX_AGE_DAYS) {
          // Mark as inactive and add to hidden list
          info.isActive = false;
          info.count = 0;
          hiddenCategories.push(categoryName);
        } else {
          // Keep in cache but mark as inactive
          info.isActive = false;
          info.count = 0;
        }
      }
    });

    this.lastUpdated = now;
    this.saveToStorage();

    // Sort available categories by hierarchy and name
    availableCategories.sort((a, b) => {
      if (a.hierarchyLevel !== b.hierarchyLevel) {
        return a.hierarchyLevel - b.hierarchyLevel;
      }
      return a.name.localeCompare(b.name);
    });

    return {
      availableCategories,
      hiddenCategories,
      totalProducts: products.length,
      categoriesWithProducts: availableCategories.length
    };
  }

  /**
   * Get filtered categories for dropdowns (only categories with products)
   */
  getFilterableCategories(products: Product[]): string[] {
    const validation = this.validateCategories(products);
    return validation.availableCategories
      .filter(cat => cat.count > 0)
      .map(cat => cat.name);
  }

  /**
   * Get category with product count for UI display
   */
  getCategoriesWithCounts(products: Product[]): Array<{ name: string; count: number; hierarchyLevel: number }> {
    const validation = this.validateCategories(products);
    return validation.availableCategories
      .filter(cat => cat.count > 0)
      .map(cat => ({
        name: cat.name,
        count: cat.count,
        hierarchyLevel: cat.hierarchyLevel
      }));
  }

  /**
   * Check if a specific category has products
   */
  hasProducts(categoryName: string, products: Product[]): boolean {
    const categoryInfo = this.categoryCache.get(categoryName);
    if (!categoryInfo) {
      // If not in cache, do a real-time check
      return products.some(product => {
        if (!product.category) return false;
        const levels = getCategoryLevels(product.category);
        return levels.includes(categoryName);
      });
    }
    return categoryInfo.isActive && categoryInfo.count > 0;
  }

  /**
   * Get category statistics for debugging
   */
  getCategoryStats(): {
    totalCategories: number;
    activeCategories: number;
    hiddenCategories: number;
    lastUpdated: Date | null;
  } {
    const active = Array.from(this.categoryCache.values()).filter(cat => cat.isActive).length;
    const hidden = Array.from(this.categoryCache.values()).filter(cat => !cat.isActive).length;
    
    return {
      totalCategories: this.categoryCache.size,
      activeCategories: active,
      hiddenCategories: hidden,
      lastUpdated: this.lastUpdated
    };
  }

  /**
   * Clear category cache (useful for testing or reset)
   */
  clearCache(): void {
    this.categoryCache.clear();
    this.lastUpdated = null;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Force refresh categories from product list
   */
  refreshCategories(products: Product[]): void {
    this.clearCache();
    this.validateCategories(products);
  }

  // Private helper methods

  private getHierarchyLevel(categoryName: string): number {
    const parts = categoryName.split(' > ');
    return parts.length - 1;
  }

  private getParentCategory(categoryName: string): string | undefined {
    const parts = categoryName.split(' > ');
    if (parts.length > 1) {
      return parts.slice(0, -1).join(' > ');
    }
    return undefined;
  }

  private getSubcategories(categoryName: string, allCategories: Set<string>): string[] {
    const subcategories: string[] = [];
    const prefix = categoryName + ' > ';
    
    allCategories.forEach(cat => {
      if (cat.startsWith(prefix) && cat !== categoryName) {
        // Only direct children, not grandchildren
        const remaining = cat.substring(prefix.length);
        if (!remaining.includes(' > ')) {
          subcategories.push(cat);
        }
      }
    });
    
    return subcategories.sort();
  }

  private saveToStorage(): void {
    try {
      const data = {
        categories: Array.from(this.categoryCache.entries()),
        lastUpdated: this.lastUpdated?.toISOString()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save category validation data:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        
        // Restore category cache
        if (data.categories && Array.isArray(data.categories)) {
          this.categoryCache = new Map(
            data.categories.map(([name, info]: [string, any]) => [
              name,
              {
                ...info,
                lastSeen: new Date(info.lastSeen)
              }
            ])
          );
        }
        
        // Restore last updated
        if (data.lastUpdated) {
          this.lastUpdated = new Date(data.lastUpdated);
        }
      }
    } catch (error) {
      console.warn('Failed to load category validation data:', error);
      this.categoryCache.clear();
      this.lastUpdated = null;
    }
  }
}

// Export singleton instance
export const categoryValidationService = new CategoryValidationService();

// Export types and service class for testing
export { CategoryValidationService };