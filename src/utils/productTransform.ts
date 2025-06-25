// Utility functions to transform AvantLink API data to our internal Product format

import { AvantLinkProduct } from '../services/avantlink';
import { Product } from '../components/ProductCard';

/**
 * Transform AvantLink product data to our internal Product format
 */
export function transformAvantLinkProduct(avantLinkProduct: any): Product {
  // Parse prices safely - handle both old and new field formats
  const retailPrice = parseFloat(avantLinkProduct['Retail Price'] || avantLinkProduct.dblProductPrice) || 0;
  const salePrice = parseFloat(avantLinkProduct['Sale Price'] || avantLinkProduct.dblProductSalePrice) || retailPrice;
  const discountPercent = parseFloat(avantLinkProduct['Price Discount Percent'] || avantLinkProduct.dblProductOnSalePercent) || 0;

  // Determine the current price (use sale price if available and lower than retail)
  const currentPrice = salePrice > 0 && salePrice < retailPrice ? salePrice : retailPrice;
  const originalPrice = salePrice > 0 && salePrice < retailPrice ? retailPrice : undefined;

  // Choose the best description available
  const description = avantLinkProduct['Short Description'] || 
                     avantLinkProduct.txtShortDescription ||
                     avantLinkProduct['Abbreviated Description'] || 
                     avantLinkProduct.txtAbbreviatedDescription ||
                     avantLinkProduct['Description'] || 
                     avantLinkProduct.txtLongDescription ||
                     'No description available';

  // Choose the best image available
  const imageUrl = avantLinkProduct['Medium Image'] || 
                   avantLinkProduct.strMediumImage ||
                   avantLinkProduct['Large Image'] || 
                   avantLinkProduct.strLargeImage ||
                   avantLinkProduct['Thumbnail Image'] || 
                   avantLinkProduct.strThumbnailImage ||
                   '/placeholder-product.svg';

  // Generate a clean product ID
  const productId = avantLinkProduct['Product Id'] || 
                    avantLinkProduct.lngProductId ||
                    `${avantLinkProduct['Merchant Name'] || avantLinkProduct.strMerchantName}-${avantLinkProduct['Product SKU'] || avantLinkProduct.strProductSKU}`.replace(/\s+/g, '-');

  return {
    id: productId.toString(),
    name: avantLinkProduct['Product Name'] || avantLinkProduct.strProductName || 'Unnamed Product',
    description: cleanDescription(description),
    price: currentPrice,
    originalPrice,
    imageUrl,
    affiliateUrl: avantLinkProduct['Buy URL'] || avantLinkProduct.strBuyURL || avantLinkProduct['Product URL'] || avantLinkProduct.strProductURL || '#',
    merchant: avantLinkProduct['Merchant Name'] || avantLinkProduct.strMerchantName || 'Unknown Merchant',
    category: avantLinkProduct['Category Name'] || avantLinkProduct.strCategoryName || avantLinkProduct['Department Name'] || avantLinkProduct.strDepartmentName || 'General',
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
 * Clean up product descriptions (remove HTML, truncate, etc.)
 */
function cleanDescription(description: string): string {
  if (!description) return 'No description available';
  
  // Remove HTML tags
  const withoutHtml = description.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  const withoutEntities = withoutHtml
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  
  // Trim and limit length
  const cleaned = withoutEntities.trim();
  
  // Truncate to reasonable length for cards
  if (cleaned.length > 150) {
    return cleaned.substring(0, 147) + '...';
  }
  
  return cleaned;
}

/**
 * Extract unique categories from AvantLink products
 */
export function extractCategories(avantLinkProducts: any[]): string[] {
  const categories = new Set<string>();
  
  avantLinkProducts.forEach(product => {
    const category = product['Category Name'] || product.strCategoryName || product['Department Name'] || product.strDepartmentName;
    if (category && category.trim()) {
      categories.add(category.trim());
    }
  });
  
  return Array.from(categories).sort();
}

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