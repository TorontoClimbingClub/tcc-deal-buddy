// Initialize sku_api_tracking table with all products
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  'https://owtcaztrzujjuwwuldhl.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE'
);

async function initializeTracking() {
  console.log('🚀 Initializing sku_api_tracking table...\n');
  
  // First, check current state
  const { data: trackingRows } = await supabase
    .from('sku_api_tracking')
    .select('sku')
    .limit(5);
  
  console.log(`📊 Current sku_api_tracking rows: ${trackingRows?.length || 0}`);
  
  // Get all products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('sku, merchant_id');
  
  if (productsError) {
    console.error('❌ Error fetching products:', productsError.message);
    return;
  }
  
  console.log(`📦 Found ${products.length} products to track`);
  
  // Create tracking records for all products that don't exist yet
  const trackingRecords = products.map(product => ({
    sku: product.sku,
    merchant_id: product.merchant_id,
    status: 'pending',
    api_call_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
  
  // Insert in batches of 100 to avoid timeout
  const batchSize = 100;
  let inserted = 0;
  
  for (let i = 0; i < trackingRecords.length; i += batchSize) {
    const batch = trackingRecords.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('sku_api_tracking')
      .upsert(batch, {
        onConflict: 'sku,merchant_id',
        ignoreDuplicates: true
      });
    
    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error.message);
    } else {
      inserted += batch.length;
      console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}: ${batch.length} records`);
    }
  }
  
  console.log(`\n🎉 Initialization complete! ${inserted} tracking records processed.`);
  
  // Verify the result
  const { data: finalCount } = await supabase
    .from('sku_api_tracking')
    .select('status')
    .limit(3000);
  
  if (finalCount) {
    const statusCounts = {};
    finalCount.forEach(row => {
      statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
    });
    
    console.log('\n📊 Final status distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
  }
}

initializeTracking().catch(console.error);