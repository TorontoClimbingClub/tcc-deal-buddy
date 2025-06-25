import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://owtcaztrzujjuwwuldhl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE'
);

async function analyzeDuplicates() {
  console.log('🔍 Analyzing duplicates in Supabase...\n');
  
  // Get today's date
  const today = new Date().toISOString().split('T')[0];
  
  // Get all products
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('last_sync_date', today);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`📊 Total records: ${products.length}`);
  
  // Analyze duplicates
  const skuMap = new Map();
  const nameMap = new Map();
  const nameMerchantMap = new Map();
  
  products.forEach(product => {
    // By SKU
    const sku = product.sku;
    if (!skuMap.has(sku)) skuMap.set(sku, []);
    skuMap.get(sku).push(product);
    
    // By Name
    const name = product.name?.toLowerCase();
    if (!nameMap.has(name)) nameMap.set(name, []);
    nameMap.get(name).push(product);
    
    // By Name + Merchant
    const key = `${name}|${product.merchant_name}`;
    if (!nameMerchantMap.has(key)) nameMerchantMap.set(key, []);
    nameMerchantMap.get(key).push(product);
  });
  
  // Find duplicates
  const skuDuplicates = Array.from(skuMap.entries()).filter(([_, items]) => items.length > 1);
  const exactDuplicates = Array.from(nameMerchantMap.entries()).filter(([_, items]) => items.length > 1);
  
  console.log(`\n🔍 Unique Analysis:`);
  console.log(`   Unique SKUs: ${skuMap.size}`);
  console.log(`   Unique Product Names: ${nameMap.size}`);
  console.log(`   Unique Name+Merchant: ${nameMerchantMap.size}`);
  
  console.log(`\n⚠️  Duplicate Analysis:`);
  console.log(`   SKU duplicates: ${skuDuplicates.length} SKUs have duplicates`);
  console.log(`   Exact duplicates: ${exactDuplicates.length} name+merchant combos have duplicates`);
  
  // Calculate total duplicate records
  const totalSkuDuplicateRecords = skuDuplicates.reduce((sum, [_, items]) => sum + items.length - 1, 0);
  const totalExactDuplicateRecords = exactDuplicates.reduce((sum, [_, items]) => sum + items.length - 1, 0);
  
  console.log(`\n📊 Duplicate Records:`);
  console.log(`   ${totalSkuDuplicateRecords} records are SKU duplicates (${Math.round(totalSkuDuplicateRecords/products.length*100)}%)`);
  console.log(`   ${totalExactDuplicateRecords} records are exact duplicates (${Math.round(totalExactDuplicateRecords/products.length*100)}%)`);
  
  // Show sample duplicates
  if (exactDuplicates.length > 0) {
    console.log(`\n📋 Sample Exact Duplicates:`);
    exactDuplicates.slice(0, 5).forEach(([key, items]) => {
      const [name, merchant] = key.split('|');
      console.log(`   "${items[0].name}" - ${merchant} (${items.length} copies)`);
      console.log(`     SKUs: ${items.map(i => i.sku).join(', ')}`);
    });
  }
  
  console.log(`\n✅ Summary: ${products.length} total records, ${nameMerchantMap.size} unique products`);
  console.log(`   ${products.length - nameMerchantMap.size} duplicate records could be removed`);
}

analyzeDuplicates();