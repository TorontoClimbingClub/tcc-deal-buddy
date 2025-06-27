
import { supabase } from '@/integrations/supabase/client';
import { AvantLinkProduct } from './avantlink';
import { categoryValidationService } from './categoryValidation';
import { transformAvantLinkProduct as transformProductForUI } from '../utils/productTransform';

export interface ProductData {
  sku: string;
  merchant_id: number;
  merchant_name: string;
  name: string;
  brand_name?: string;
  sale_price?: number;
  retail_price?: number;
  discount_percent?: number;
  discount_amount?: number;
  image_url?: string;
  buy_url?: string;
  description?: string;
  category?: string;
  subcategory?: string;
}

/**
 * Get field value with fallback to legacy field names
 */
function getProductField(product: AvantLinkProduct, newField: string, legacyField: string): string | null {
  return product[newField] || product[legacyField] || null;
}

/**
 * Transform AvantLink product to database format
 */
function transformAvantLinkProduct(product: AvantLinkProduct): ProductData {
  // Use actual API field names with fallbacks to legacy names
  const salePrice = getProductField(product, 'dblProductSalePrice', 'Sale Price');
  const retailPrice = getProductField(product, 'dblProductPrice', 'Retail Price');
  const discountPercent = getProductField(product, 'dblProductOnSalePercent', 'Price Discount Percent');
  const discountAmount = getProductField(product, 'dblProductOnSaleAmount', 'Price Discount Amount');

  const salePriceNum = salePrice ? parseFloat(salePrice) : null;
  const retailPriceNum = retailPrice ? parseFloat(retailPrice) : null;
  const discountPercentNum = discountPercent ? parseInt(discountPercent) : null;
  const discountAmountNum = discountAmount ? parseFloat(discountAmount) : null;

  // Generate a simple merchant_id from merchant name or use a hash
  const generateMerchantId = (merchantName: string, productId: string): number => {
    if (!merchantName && !productId) return 1;
    const source = merchantName || productId;
    let hash = 0;
    for (let i = 0; i < source.length; i++) {
      const char = source.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 10000 + 1; // Keep it reasonable size
  };

  const productId = getProductField(product, 'lngProductId', 'Product Id');
  const productSku = getProductField(product, 'strProductSKU', 'Product SKU');
  const merchantName = getProductField(product, 'strMerchantName', 'Merchant Name');
  const productName = getProductField(product, 'strProductName', 'Product Name');
  const brandName = getProductField(product, 'strBrandName', 'Brand Name');
  const largeImage = getProductField(product, 'strLargeImage', 'Large Image');
  const mediumImage = getProductField(product, 'strMediumImage', 'Medium Image');
  const thumbnailImage = getProductField(product, 'strThumbnailImage', 'Thumbnail Image');
  const buyUrl = getProductField(product, 'strBuyURL', 'Buy URL');
  const longDescription = getProductField(product, 'txtLongDescription', 'Description');
  const shortDescription = getProductField(product, 'txtShortDescription', 'Short Description');
  const abbreviatedDescription = getProductField(product, 'txtAbbreviatedDescription', 'Abbreviated Description');
  const subcategoryName = getProductField(product, 'strSubcategoryName', 'Subcategory Name');
  const categoryName = getProductField(product, 'strCategoryName', 'Category Name');
  const departmentName = getProductField(product, 'strDepartmentName', 'Department Name');

  // Use the hierarchical category generation from productTransform
  const getOptimalCategory = (subcategory: string, category: string, department: string): string => {
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
  };

  return {
    sku: productSku || productId || `unknown-${Date.now()}`,
    merchant_id: generateMerchantId(merchantName, productId),
    merchant_name: merchantName || 'Unknown Merchant',
    name: productName || 'Unknown Product',
    brand_name: brandName,
    sale_price: salePriceNum,
    retail_price: retailPriceNum,
    discount_percent: discountPercentNum,
    discount_amount: discountAmountNum,
    image_url: largeImage || mediumImage || thumbnailImage,
    buy_url: buyUrl,
    description: longDescription || abbreviatedDescription || shortDescription,
    category: getOptimalCategory(subcategoryName, categoryName, departmentName),
    subcategory: subcategoryName // Keep subcategory field for reference
  };
}

/**
 * Transform ProductData to Product UI format
 */
function transformProductDataToProduct(productData: ProductData): any {
  return {
    id: `${productData.sku}-${productData.merchant_id}`,
    sku: productData.sku,
    name: productData.name,
    brand: productData.brand_name,
    brand_name: productData.brand_name,
    category: productData.category || 'General',
    description: productData.description || '',
    price: productData.retail_price || productData.sale_price || 0,
    sale_price: productData.sale_price,
    retail_price: productData.retail_price,
    discount_percent: productData.discount_percent,
    discount: productData.discount_percent,
    imageUrl: productData.image_url,
    image_url: productData.image_url,
    affiliateUrl: productData.buy_url,
    buy_url: productData.buy_url,
    merchant: productData.merchant_name || 'Unknown',
    merchant_name: productData.merchant_name,
    merchant_id: productData.merchant_id
  };
}

/**
 * Validate product data before saving
 */
function validateProduct(product: AvantLinkProduct): boolean {
  // Check if product has minimum required data using correct field names
  const hasName = (product.strProductName && product.strProductName.trim() !== '') || 
                  (product['Product Name'] && product['Product Name'].trim() !== '');
  const hasId = (product.lngProductId && product.lngProductId.trim() !== '') || 
                (product['Product Id'] && product['Product Id'].trim() !== '');
  const hasSku = (product.strProductSKU && product.strProductSKU.trim() !== '') || 
                 (product['Product SKU'] && product['Product SKU'].trim() !== '');
  const hasMerchant = (product.strMerchantName && product.strMerchantName.trim() !== '') || 
                      (product['Merchant Name'] && product['Merchant Name'].trim() !== '');
  
  return hasName && (hasId || hasSku) && hasMerchant;
}

/**
 * Save products to Supabase database
 */
export async function saveProductsToDatabase(products: AvantLinkProduct[]): Promise<{ success: number; errors: any[]; skipped: number }> {
  console.log(`🔍 Validating ${products.length} products from API...`);
  
  // Log sample of raw API data
  if (products.length > 0) {
    console.log('📄 Sample raw product data:', products[0]);
  }
  
  // Filter out invalid products
  const validProducts = products.filter(validateProduct);
  const skippedCount = products.length - validProducts.length;
  
  console.log(`✅ Valid products: ${validProducts.length}`);
  console.log(`⚠️ Skipped invalid products: ${skippedCount}`);
  
  if (skippedCount > 0) {
    console.log('🔍 Sample invalid product:', products.find(p => !validateProduct(p)));
  }
  
  const transformedProducts = validProducts.map(transformAvantLinkProduct);
  let successCount = 0;
  const errors: any[] = [];

  console.log(`💾 Saving ${transformedProducts.length} valid products to database...`);

  for (const product of transformedProducts) {
    try {
      // Additional validation of transformed product
      if (!product.name || product.name === 'Unknown Product') {
        console.warn(`⚠️ Skipping product with unknown name: ${product.sku}`);
        errors.push({ product: product.sku, error: 'Product has no valid name' });
        continue;
      }

      // Use upsert to handle duplicates (updates existing or inserts new)
      const { error } = await supabase
        .from('products')
        .upsert(product, {
          onConflict: 'sku,merchant_id,last_sync_date'
        });

      if (error) {
        console.error(`❌ Error saving product ${product.sku}:`, error);
        errors.push({ product: product.sku, error: error.message });
      } else {
        successCount++;
        console.log(`✅ Saved: ${product.name} - $${product.sale_price} (${product.merchant_name})`);
      }
    } catch (err) {
      console.error(`💥 Exception saving product ${product.sku}:`, err);
      errors.push({ product: product.sku, error: err });
    }
  }

  console.log(`📊 Save results: ${successCount} successful, ${errors.length} errors, ${skippedCount} skipped`);
  return { success: successCount, errors, skipped: skippedCount };
}

/**
 * Comprehensive daily sync of ALL sale products (unlimited)
 */
export async function dailyFullSync(): Promise<{ 
  totalSaved: number; 
  totalErrors: number; 
  syncedCategories: string[];
  errors: any[];
}> {
  const { avantLinkService } = await import('./avantlink');
  
  console.log('🔄 Starting UNLIMITED comprehensive daily sale products sync...');
  
  // Extensive categories and search terms for maximum coverage
  const categories = [
    'electronics', 'clothing', 'home', 'garden', 'sports', 'outdoors',
    'health', 'beauty', 'books', 'toys', 'games', 'automotive', 'tools',
    'furniture', 'jewelry', 'shoes', 'bags', 'watches', 'appliances',
    'fitness', 'camping', 'cycling', 'golf', 'running', 'yoga',
    'kitchen', 'bathroom', 'bedroom', 'living room', 'office',
    'baby', 'kids', 'teen', 'men', 'women', 'unisex',
    'technology', 'computers', 'phones', 'tablets', 'headphones',
    'fashion', 'accessories', 'sunglasses', 'perfume', 'makeup'
  ];
  
  let totalSaved = 0;
  let totalErrors = 0;
  const allErrors: any[] = [];
  const syncedCategories: string[] = [];
  
  try {
    // Mark start of sync job
    await logSyncJob('daily_products', 'running');
    
    // Process each category with UNLIMITED pagination
    for (const category of categories) {
      console.log(`📂 Syncing ALL ${category} sale products...`);
      
      try {
        let page = 1;
        let hasMorePages = true;
        
        // Continue until no more products found
        while (hasMorePages) {
          const apiResponse = await avantLinkService.searchProducts({
            searchTerm: category,
            onSaleOnly: true,
            page,
            resultsPerPage: 50,
            sortBy: 'Match Score',
            sortOrder: 'desc'
          });
          
          if (apiResponse.products.length === 0) {
            console.log(`📭 No more products found for ${category} on page ${page}`);
            hasMorePages = false;
            break;
          }
          
          console.log(`📥 Retrieved ${apiResponse.products.length} ${category} products (page ${page})`);
          
          // Save to database
          const result = await saveProductsToDatabase(apiResponse.products);
          totalSaved += result.success;
          totalErrors += result.errors.length;
          allErrors.push(...result.errors);
          
          // Update category validation after each batch
          if (result.success > 0) {
            try {
              const transformedProducts = apiResponse.products
                .filter(validateProduct)
                .map(transformAvantLinkProduct)
                .map(transformProductDataToProduct);
              categoryValidationService.validateCategories(transformedProducts);
            } catch (categoryError) {
              console.warn('⚠️ Failed to update category validation:', categoryError);
            }
          }
          
          // Move to next page
          page++;
          
          // Safety check - if we get same small number repeatedly, probably reached end
          if (apiResponse.products.length < 10 && page > 5) {
            console.log(`🛑 Likely reached end of ${category} results (small batch on page ${page})`);
            hasMorePages = false;
          }
          
          // Delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        syncedCategories.push(category);
        console.log(`✅ Completed syncing ${category} (${page - 1} pages)`);
        
      } catch (categoryError) {
        console.error(`❌ Failed to sync ${category}:`, categoryError);
        allErrors.push({ category, error: categoryError });
        totalErrors++;
      }
    }
    
    // Additional comprehensive broad searches
    console.log('🎯 Running comprehensive broad sale searches...');
    const broadTerms = [
      'sale', 'discount', 'clearance', 'deal', 'special', 'offer', 'promotion',
      'reduced', 'markdown', 'bargain', 'cheap', 'low price', 'best price',
      'limited time', 'flash sale', 'daily deal', 'weekend sale', 'black friday',
      'cyber monday', 'holiday sale', 'end of season', 'closeout', 'liquidation'
    ];
    
    for (const term of broadTerms) {
      try {
        let page = 1;
        let hasMorePages = true;
        
        while (hasMorePages) {
          const apiResponse = await avantLinkService.searchProducts({
            searchTerm: term,
            onSaleOnly: true,
            page,
            resultsPerPage: 50,
            sortBy: 'Match Score',
            sortOrder: 'desc'
          });
          
          if (apiResponse.products.length === 0) {
            hasMorePages = false;
            break;
          }
          
          console.log(`📥 Retrieved ${apiResponse.products.length} products for "${term}" (page ${page})`);
          
          const result = await saveProductsToDatabase(apiResponse.products);
          totalSaved += result.success;
          totalErrors += result.errors.length;
          allErrors.push(...result.errors);
          
          // Update category validation after each batch
          if (result.success > 0) {
            try {
              const transformedProducts = apiResponse.products
                .filter(validateProduct)
                .map(transformAvantLinkProduct)
                .map(transformProductDataToProduct);
              categoryValidationService.validateCategories(transformedProducts);
            } catch (categoryError) {
              console.warn('⚠️ Failed to update category validation:', categoryError);
            }
          }
          
          page++;
          
          // Safety check for broad terms (they might have many pages)
          if (apiResponse.products.length < 5 && page > 10) {
            console.log(`🛑 Likely reached end of "${term}" results`);
            hasMorePages = false;
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log(`✅ Completed broad search for "${term}" (${page - 1} pages)`);
        
      } catch (termError) {
        console.error(`❌ Failed broad search for "${term}":`, termError);
        allErrors.push({ term, error: termError });
      }
    }
    
    // Mark sync job as completed
    await logSyncJob('daily_products', 'completed', totalSaved);
    
    console.log(`🎉 UNLIMITED Daily sync completed: ${totalSaved} saved, ${totalErrors} errors`);
    
    return {
      totalSaved,
      totalErrors,
      syncedCategories,
      errors: allErrors
    };
    
  } catch (error) {
    console.error('💥 Daily sync failed:', error);
    await logSyncJob('daily_products', 'failed', 0, error.message);
    throw error;
  }
}

/**
 * Remove outdated products (older than today)
 */
export async function cleanupOldProducts(): Promise<number> {
  console.log('🧹 Cleaning up old products...');
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const { count, error } = await supabase
    .from('products')
    .delete({ count: 'exact' })
    .lt('last_sync_date', yesterdayStr);
  
  if (error) {
    console.error('❌ Error cleaning up old products:', error);
    throw error;
  }
  
  console.log(`🗑️ Removed ${count || 0} old products`);
  return count || 0;
}

/**
 * Log sync job status
 */
async function logSyncJob(jobType: string, status: string, recordsProcessed = 0, errorMessage?: string) {
  const { error } = await supabase
    .from('sync_jobs')
    .insert({
      job_type: jobType,
      status,
      records_processed: recordsProcessed,
      error_message: errorMessage,
      completed_at: status === 'completed' || status === 'failed' ? new Date().toISOString() : null
    });
  
  if (error) {
    console.error('❌ Error logging sync job:', error);
  }
}

/**
 * Sync sale products for specific merchants
 */
export async function syncMerchantProducts(merchantIds: string[], merchantName: string): Promise<{
  totalSaved: number;
  totalErrors: number;
  errors: any[];
}> {
  const { avantLinkService } = await import('./avantlink');
  
  console.log(`🏪 Starting sync for ${merchantName} (IDs: ${merchantIds.join(', ')})...`);
  
  let totalSaved = 0;
  let totalErrors = 0;
  const allErrors: any[] = [];
  
  // Search terms optimized for outdoor/climbing gear
  const searchTerms = [
    'sale', 'clearance', 'discount', 'deal',
    'climbing', 'outdoor', 'camping', 'hiking',
    'gear', 'equipment', 'apparel', 'accessories'
  ];
  
  try {
    for (const term of searchTerms) {
      console.log(`🔍 Searching "${term}" for ${merchantName}...`);
      
      let page = 1;
      let hasMorePages = true;
      
      while (hasMorePages) {
        const apiResponse = await avantLinkService.searchProducts({
          searchTerm: term,
          merchantIds: merchantIds,
          onSaleOnly: true,
          page,
          resultsPerPage: 50,
          sortBy: 'Match Score',
          sortOrder: 'desc'
        });
        
        if (apiResponse.products.length === 0) {
          hasMorePages = false;
          break;
        }
        
        console.log(`📥 Retrieved ${apiResponse.products.length} products (page ${page})`);
        
        const result = await saveProductsToDatabase(apiResponse.products);
        totalSaved += result.success;
        totalErrors += result.errors.length;
        allErrors.push(...result.errors);
        
        // Update category validation after each batch
        if (result.success > 0) {
          try {
            const transformedProducts = apiResponse.products
              .filter(validateProduct)
              .map(transformAvantLinkProduct)
              .map(transformProductDataToProduct);
            categoryValidationService.validateCategories(transformedProducts);
          } catch (categoryError) {
            console.warn('⚠️ Failed to update category validation:', categoryError);
          }
        }
        
        page++;
        
        if (apiResponse.products.length < 10 && page > 3) {
          hasMorePages = false;
        }
        
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
    
    console.log(`✅ ${merchantName} sync completed: ${totalSaved} saved, ${totalErrors} errors`);
    
    return {
      totalSaved,
      totalErrors,
      errors: allErrors
    };
    
  } catch (error) {
    console.error(`💥 ${merchantName} sync failed:`, error);
    throw error;
  }
}

/**
 * Daily sync for multiple merchants
 */
export async function dailyMultiMerchantSync(): Promise<{
  totalSaved: number;
  totalErrors: number;
  merchantResults: any[];
}> {
  console.log('🔄 Starting multi-merchant daily sync...');
  
  // Define your merchants here
  const merchants = [
    { name: 'MEC', ids: ['9272'] }  // MEC Mountain Equipment Company
  ];
  
  let totalSaved = 0;
  let totalErrors = 0;
  const merchantResults: any[] = [];
  
  try {
    await logSyncJob('daily_products', 'running');
    
    // Sync each merchant separately
    for (const merchant of merchants) {
      console.log(`\n🏪 Processing ${merchant.name}...`);
      
      try {
        const result = await syncMerchantProducts(merchant.ids, merchant.name);
        
        totalSaved += result.totalSaved;
        totalErrors += result.totalErrors;
        
        merchantResults.push({
          merchant: merchant.name,
          saved: result.totalSaved,
          errors: result.totalErrors
        });
        
        // Delay between merchants
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Failed to sync ${merchant.name}:`, error);
        merchantResults.push({
          merchant: merchant.name,
          error: error.message
        });
      }
    }
    
    await logSyncJob('daily_products', 'completed', totalSaved);
    
    console.log(`\n🎉 Multi-merchant sync completed!`);
    console.log(`📊 Total saved: ${totalSaved}`);
    console.log(`❌ Total errors: ${totalErrors}`);
    merchantResults.forEach(r => {
      console.log(`   ${r.merchant}: ${r.saved || 0} saved${r.error ? ` (Error: ${r.error})` : ''}`);
    });
    
    return {
      totalSaved,
      totalErrors,
      merchantResults
    };
    
  } catch (error) {
    console.error('💥 Multi-merchant sync failed:', error);
    await logSyncJob('daily_products', 'failed', 0, error.message);
    throw error;
  }
}

/**
 * Save sale products from AvantLink API to database (simplified version)
 */
export async function syncSaleProducts(searchTerm = 'sale', merchantIds?: string[]): Promise<void> {
  const { avantLinkService } = await import('./avantlink');
  
  console.log('🔄 Starting sale products sync...');
  
  try {
    // Get sale products from AvantLink API
    const apiResponse = merchantIds 
      ? await avantLinkService.getSaleProductsByMerchants(merchantIds, searchTerm)
      : await avantLinkService.getSaleProducts(searchTerm);

    console.log(`📥 Retrieved ${apiResponse.products.length} products from API`);

    // Save to database
    const result = await saveProductsToDatabase(apiResponse.products);
    
    // Update category validation after sync
    if (result.success > 0) {
      try {
        const transformedProducts = apiResponse.products
          .filter(validateProduct)
          .map(transformAvantLinkProduct)
          .map(transformProductDataToProduct);
        categoryValidationService.validateCategories(transformedProducts);
        console.log('📊 Category validation updated after sync');
      } catch (categoryError) {
        console.warn('⚠️ Failed to update category validation:', categoryError);
      }
    }
    
    console.log(`✅ Sync completed: ${result.success} saved, ${result.errors.length} errors`);
    
    if (result.errors.length > 0) {
      console.warn('⚠️ Some products failed to save:', result.errors);
    }
  } catch (error) {
    console.error('💥 Sale products sync failed:', error);
    throw error;
  }
}

/**
 * Get current products from database
 */
export async function getCurrentProducts(limit = 50) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('last_sync_date', new Date().toISOString().split('T')[0])
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('❌ Error fetching current products:', error);
    throw error;
  }

  return data;
}

/**
 * Get products count by sync date
 */
export async function getProductsCount() {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('last_sync_date', new Date().toISOString().split('T')[0]);

  if (error) {
    console.error('❌ Error getting products count:', error);
    throw error;
  }

  return count || 0;
}
