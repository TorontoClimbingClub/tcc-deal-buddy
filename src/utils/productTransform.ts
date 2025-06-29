// Utility functions to transform AvantLink API data to our internal Product format

import { AvantLinkProduct } from '../services/avantlink';
import { Product } from '../components/ProductCard';

/**
 * Sanitize and validate product data from third-party API
 */
function sanitizeProductData(data: any): any {
  if (!data || typeof data !== 'object') return {};
  
  const sanitized: any = {};
  
  // Only copy known safe fields with validation
  const safeFields = [
    'Product Id', 'lngProductId',
    'Product Name', 'strProductName', 
    'Retail Price', 'dblProductPrice',
    'Sale Price', 'dblProductSalePrice',
    'Price Discount Percent', 'dblProductOnSalePercent',
    'Short Description', 'txtShortDescription',
    'Abbreviated Description', 'txtAbbreviatedDescription',
    'Description', 'txtLongDescription',
    'Medium Image', 'strMediumImage',
    'Large Image', 'strLargeImage',
    'Thumbnail Image', 'strThumbnailImage',
    'Buy URL', 'strBuyURL',
    'Product URL', 'strProductURL',
    'Merchant Name', 'strMerchantName',
    'Subcategory Name', 'strSubcategoryName',
    'Category Name', 'strCategoryName',
    'Department Name', 'strDepartmentName',
    'Product SKU', 'strProductSKU',
    'Brand Name', 'strBrandName'
  ];
  
  safeFields.forEach(field => {
    if (data[field] !== undefined) {
      const value = data[field];
      if (typeof value === 'string') {
        // Sanitize string values
        sanitized[field] = value.replace(/[<>\"']/g, '').trim().slice(0, 1000);
      } else if (typeof value === 'number' || !isNaN(Number(value))) {
        // Validate numeric values
        const num = Number(value);
        if (num >= 0 && num <= 999999) {
          sanitized[field] = value;
        }
      }
    }
  });
  
  return sanitized;
}

/**
 * Transform AvantLink product data to our internal Product format
 */
export function transformAvantLinkProduct(avantLinkProduct: any): Product {
  // Sanitize input data first
  const sanitized = sanitizeProductData(avantLinkProduct);
  
  // Parse prices safely - handle both old and new field formats
  const retailPrice = parseFloat(sanitized['Retail Price'] || sanitized.dblProductPrice) || 0;
  const salePrice = parseFloat(sanitized['Sale Price'] || sanitized.dblProductSalePrice) || retailPrice;
  const discountPercent = parseFloat(sanitized['Price Discount Percent'] || sanitized.dblProductOnSalePercent) || 0;

  // Determine the current price (use sale price if available and lower than retail)
  const currentPrice = salePrice > 0 && salePrice < retailPrice ? salePrice : retailPrice;
  const originalPrice = salePrice > 0 && salePrice < retailPrice ? retailPrice : undefined;

  // Choose the best description available from sanitized data
  const description = sanitized['Short Description'] || 
                     sanitized.txtShortDescription ||
                     sanitized['Abbreviated Description'] || 
                     sanitized.txtAbbreviatedDescription ||
                     sanitized['Description'] || 
                     sanitized.txtLongDescription ||
                     'No description available';

  // Choose the best image available from sanitized data and validate URL
  // Prioritize Large images first for best quality
  let imageUrl = sanitized['Large Image'] || 
                 sanitized.strLargeImage ||
                 sanitized['Medium Image'] || 
                 sanitized.strMediumImage ||
                 sanitized['Thumbnail Image'] || 
                 sanitized.strThumbnailImage ||
                 '/placeholder-product.svg';

  // Validate image URL for security and quality
  if (imageUrl && imageUrl !== '/placeholder-product.svg') {
    try {
      const url = new URL(imageUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        imageUrl = '/placeholder-product.svg';
      } else {
        // Ensure HTTPS for better security and quality
        if (url.protocol === 'http:') {
          url.protocol = 'https:';
          imageUrl = url.toString();
        }
        
        // Validate image format
        const validImageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const hasValidExtension = validImageExtensions.some(ext => 
          url.pathname.toLowerCase().includes(ext)
        );
        
        // If no valid extension found, still allow (many CDNs don't show extensions)
        // but ensure the URL looks reasonable
        if (url.pathname === '/' || url.pathname === '') {
          imageUrl = '/placeholder-product.svg';
        }
      }
    } catch {
      imageUrl = '/placeholder-product.svg';
    }
  }

  // Generate a clean product ID from sanitized data
  const productId = sanitized['Product Id'] || 
                    sanitized.lngProductId ||
                    `${sanitized['Merchant Name'] || sanitized.strMerchantName}-${sanitized['Product SKU'] || sanitized.strProductSKU}`.replace(/\s+/g, '-');

  // Get SKU and merchant info
  const productSku = sanitized['Product SKU'] || sanitized.strProductSKU || productId.toString();
  const merchantName = sanitized['Merchant Name'] || sanitized.strMerchantName || 'Unknown Merchant';
  
  // For AvantLink products, we'll use a default merchant_id of 0 since we don't have actual merchant IDs
  const merchantId = 0;

  // Validate affiliate URL
  let affiliateUrl = sanitized['Buy URL'] || sanitized.strBuyURL || sanitized['Product URL'] || sanitized.strProductURL || '#';
  if (affiliateUrl !== '#') {
    try {
      const url = new URL(affiliateUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        affiliateUrl = '#';
      }
    } catch {
      affiliateUrl = '#';
    }
  }

  return {
    id: productId.toString(),
    sku: productSku,
    merchant_id: merchantId,
    name: sanitized['Product Name'] || sanitized.strProductName || 'Unnamed Product',
    description: cleanDescription(description),
    price: currentPrice,
    originalPrice,
    imageUrl,
    affiliateUrl,
    merchant: merchantName,
    category: getOptimalCategory(sanitized),
    discount: discountPercent > 0 ? Math.round(discountPercent) : undefined,
    rating: undefined // AvantLink doesn't provide ratings, could be enhanced later
  };
}

/**
 * Transform multiple AvantLink products
 */
export function transformAvantLinkProducts(avantLinkProducts: AvantLinkProduct[]): Product[] {
  return avantLinkProducts
    .map(transformAvantLinkProduct)
    .filter(product => product.price > 0 && product.name.trim() !== ''); // Filter out invalid products
}

/**
 * Get the optimal category using hierarchy: Subcategory > Category > Department
 * Creates hierarchical category names when multiple levels are available
 */
function getOptimalCategory(sanitized: any): string {
  const subcategory = sanitized['Subcategory Name'] || sanitized.strSubcategoryName;
  const category = sanitized['Category Name'] || sanitized.strCategoryName;
  const department = sanitized['Department Name'] || sanitized.strDepartmentName;

  // If we have subcategory, create hierarchical name
  if (subcategory && category && department) {
    // Only create hierarchy if they're meaningfully different
    if (subcategory !== category && category !== department) {
      return `${department} > ${category} > ${subcategory}`;
    }
  }

  // If we have category and department, create two-level hierarchy
  if (category && department && category !== department) {
    return `${department} > ${category}`;
  }

  // Fall back to most specific available
  return subcategory || category || department || 'General';
}

/**
 * Normalize category name for consistent filtering
 * Removes hierarchy notation for filter matching
 */
function getNormalizedCategory(hierarchicalCategory: string): string {
  // Extract the most specific part (after the last >)
  const parts = hierarchicalCategory.split(' > ');
  return parts[parts.length - 1].trim();
}

/**
 * Get all category levels from a hierarchical category
 * Returns array of categories for multi-level filtering
 */
function getCategoryLevels(hierarchicalCategory: string): string[] {
  if (!hierarchicalCategory || hierarchicalCategory === 'General') {
    return ['General'];
  }

  const parts = hierarchicalCategory.split(' > ').map(part => part.trim());
  const levels: string[] = [];
  
  // Add each level and cumulative hierarchy
  for (let i = 0; i < parts.length; i++) {
    levels.push(parts[i]); // Individual level (e.g., "Packs And Bags")
    if (i > 0) {
      levels.push(parts.slice(0, i + 1).join(' > ')); // Cumulative (e.g., "Packs And Bags > Backpacking Packs")
    }
  }
  
  return [...new Set(levels)]; // Remove duplicates
}

/**
 * Clean up product descriptions (remove HTML, truncate, etc.)
 * Enhanced with security measures against XSS and malicious content
 */
function cleanDescription(description: string): string {
  if (!description || typeof description !== 'string') return 'No description available';
  
  // Remove potential script tags and dangerous content
  let cleaned = description
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
  // Remove all HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities safely
  const entityMap: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#x60;': '`',
    '&#x3D;': '='
  };
  
  cleaned = cleaned.replace(/&[#\w]+;/g, (entity) => {
    return entityMap[entity] || '';
  });
  
  // Remove potential XSS patterns
  cleaned = cleaned
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, ''); // Keep only printable characters
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  // Validate length and content
  if (cleaned.length === 0) {
    return 'No description available';
  }
  
  // Truncate to reasonable length for cards
  if (cleaned.length > 150) {
    return cleaned.substring(0, 147) + '...';
  }
  
  return cleaned;
}

/**
 * Extract unique categories from AvantLink products with hierarchy support
 */
export function extractCategories(avantLinkProducts: any[]): string[] {
  const categories = new Set<string>();
  
  avantLinkProducts.forEach(product => {
    const hierarchicalCategory = getOptimalCategory(product);
    if (hierarchicalCategory && hierarchicalCategory.trim()) {
      // Add the full hierarchical category
      categories.add(hierarchicalCategory.trim());
      
      // Also add individual levels for flexible filtering
      const levels = getCategoryLevels(hierarchicalCategory);
      levels.forEach(level => {
        if (level && level !== hierarchicalCategory) {
          categories.add(level);
        }
      });
    }
  });
  
  return Array.from(categories).sort();
}

/**
 * Export category helper functions for use in other modules
 */
export { getNormalizedCategory, getCategoryLevels };

/**
 * Extract unique merchants from AvantLink products
 */
export function extractMerchants(avantLinkProducts: any[]): string[] {
  const merchants = new Set<string>();
  
  avantLinkProducts.forEach(product => {
    const merchant = product['Merchant Name'] || product.strMerchantName;
    if (merchant && merchant.trim()) {
      merchants.add(merchant.trim());
    }
  });
  
  return Array.from(merchants).sort();
}

/**
 * Generate price ranges based on available products
 */
export function generatePriceRanges(products: Product[]): Array<{label: string, value: string}> {
  if (products.length === 0) {
    return [
      { label: 'All Prices', value: 'all' },
      { label: 'Under $25', value: '0-25' },
      { label: '$25 - $50', value: '25-50' },
      { label: '$50 - $100', value: '50-100' },
      { label: '$100 - $200', value: '100-200' },
      { label: 'Over $200', value: '200+' }
    ];
  }
  
  const prices = products.map(p => p.price).sort((a, b) => a - b);
  const minPrice = Math.floor(prices[0]);
  const maxPrice = Math.ceil(prices[prices.length - 1]);
  
  // Generate dynamic ranges based on actual price distribution
  const ranges = [
    { label: 'All Prices', value: 'all' }
  ];
  
  if (minPrice < 25) {
    ranges.push({ label: 'Under $25', value: '0-25' });
  }
  if (maxPrice > 25) {
    ranges.push({ label: '$25 - $50', value: '25-50' });
  }
  if (maxPrice > 50) {
    ranges.push({ label: '$50 - $100', value: '50-100' });
  }
  if (maxPrice > 100) {
    ranges.push({ label: '$100 - $200', value: '100-200' });
  }
  if (maxPrice > 200) {
    ranges.push({ label: 'Over $200', value: '200+' });
  }
  
  return ranges;
}
