import { supabase } from '@/integrations/supabase/client';

export async function analyzeDuplicates() {
  console.log('🔍 Analyzing duplicates in database...');
  
  try {
    // Get all products from today
    const today = new Date().toISOString().split('T')[0];
    const { data: allProducts, error } = await supabase
      .from('products')
      .select('*')
      .eq('last_sync_date', today);
    
    if (error) {
      console.error('❌ Error fetching products:', error);
      return { error: error.message };
    }
    
    const totalProducts = allProducts?.length || 0;
    console.log(`📊 Total products: ${totalProducts}`);
    
    if (!allProducts || allProducts.length === 0) {
      return { totalProducts: 0, duplicates: [] };
    }
    
    // Group by different duplicate criteria
    const duplicateAnalysis = {
      bySku: new Map<string, any[]>(),
      byName: new Map<string, any[]>(),
      byNameAndMerchant: new Map<string, any[]>(),
      byBuyUrl: new Map<string, any[]>()
    };
    
    // Group products by various criteria
    allProducts.forEach(product => {
      // By SKU
      const sku = product.sku;
      if (!duplicateAnalysis.bySku.has(sku)) {
        duplicateAnalysis.bySku.set(sku, []);
      }
      duplicateAnalysis.bySku.get(sku)!.push(product);
      
      // By Product Name
      const name = product.name?.toLowerCase() || '';
      if (!duplicateAnalysis.byName.has(name)) {
        duplicateAnalysis.byName.set(name, []);
      }
      duplicateAnalysis.byName.get(name)!.push(product);
      
      // By Name + Merchant (exact duplicates)
      const nameAndMerchant = `${name}|${product.merchant_name}`;
      if (!duplicateAnalysis.byNameAndMerchant.has(nameAndMerchant)) {
        duplicateAnalysis.byNameAndMerchant.set(nameAndMerchant, []);
      }
      duplicateAnalysis.byNameAndMerchant.get(nameAndMerchant)!.push(product);
      
      // By Buy URL
      if (product.buy_url) {
        if (!duplicateAnalysis.byBuyUrl.has(product.buy_url)) {
          duplicateAnalysis.byBuyUrl.set(product.buy_url, []);
        }
        duplicateAnalysis.byBuyUrl.get(product.buy_url)!.push(product);
      }
    });
    
    // Find actual duplicates
    const duplicates = {
      skuDuplicates: Array.from(duplicateAnalysis.bySku.entries())
        .filter(([_, products]) => products.length > 1),
      nameDuplicates: Array.from(duplicateAnalysis.byName.entries())
        .filter(([_, products]) => products.length > 1),
      exactDuplicates: Array.from(duplicateAnalysis.byNameAndMerchant.entries())
        .filter(([_, products]) => products.length > 1),
      urlDuplicates: Array.from(duplicateAnalysis.byBuyUrl.entries())
        .filter(([_, products]) => products.length > 1)
    };
    
    // Count unique products
    const uniqueSkus = duplicateAnalysis.bySku.size;
    const uniqueNames = duplicateAnalysis.byName.size;
    const uniqueNameAndMerchant = duplicateAnalysis.byNameAndMerchant.size;
    const uniqueUrls = duplicateAnalysis.byBuyUrl.size;
    
    // Calculate duplicate counts
    const skuDuplicateCount = duplicates.skuDuplicates.reduce((sum, [_, products]) => sum + (products.length - 1), 0);
    const nameDuplicateCount = duplicates.nameDuplicates.reduce((sum, [_, products]) => sum + (products.length - 1), 0);
    const exactDuplicateCount = duplicates.exactDuplicates.reduce((sum, [_, products]) => sum + (products.length - 1), 0);
    
    console.log(`📊 Duplicate Analysis:`);
    console.log(`   Total Products: ${totalProducts}`);
    console.log(`   Unique SKUs: ${uniqueSkus} (${skuDuplicateCount} duplicates)`);
    console.log(`   Unique Names: ${uniqueNames} (${nameDuplicateCount} duplicates)`);
    console.log(`   Unique Name+Merchant: ${uniqueNameAndMerchant} (${exactDuplicateCount} exact duplicates)`);
    console.log(`   Unique URLs: ${uniqueUrls}`);
    
    // Sample duplicates
    const sampleDuplicates = duplicates.exactDuplicates.slice(0, 5).map(([key, products]) => ({
      key,
      count: products.length,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        merchant: p.merchant_name,
        price: p.sale_price
      }))
    }));
    
    return {
      totalProducts,
      uniqueSkus,
      uniqueNames,
      uniqueNameAndMerchant,
      uniqueUrls,
      duplicateCounts: {
        skuDuplicates: skuDuplicateCount,
        nameDuplicates: nameDuplicateCount,
        exactDuplicates: exactDuplicateCount
      },
      sampleDuplicates,
      duplicatePercentage: {
        bySku: Math.round((skuDuplicateCount / totalProducts) * 100),
        byName: Math.round((nameDuplicateCount / totalProducts) * 100),
        exact: Math.round((exactDuplicateCount / totalProducts) * 100)
      }
    };
    
  } catch (error) {
    console.error('💥 Duplicate analysis failed:', error);
    return { error: error.message };
  }
}