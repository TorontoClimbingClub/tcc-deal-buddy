import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  'https://owtcaztrzujjuwwuldhl.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE'
);

async function debugStatus() {
  console.log('🔍 Debugging SKU status distribution...\n');
  
  // Check if sku_api_tracking table exists and has data
  const { data: trackingRows, error: trackingError } = await supabase
    .from('sku_api_tracking')
    .select('status, updated_at, last_api_call')
    .limit(10);
  
  console.log('🔍 sku_api_tracking table:');
  if (trackingError) {
    console.log(`   Error: ${trackingError.message}`);
  } else {
    console.log(`   Rows found: ${trackingRows?.length || 0}`);
    if (trackingRows && trackingRows.length > 0) {
      const statusCounts = {};
      trackingRows.forEach(row => {
        statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
      });
      console.log('   Status distribution:', statusCounts);
    }
  }
  console.log();
  
  // Check products table structure
  const { data: productsRows, error: productsError } = await supabase
    .from('products')
    .select('*')
    .limit(3);
  
  console.log('🔍 products table:');
  if (productsError) {
    console.log(`   Error: ${productsError.message}`);
  } else {
    console.log(`   Rows found: ${productsRows?.length || 0}`);
    if (productsRows && productsRows.length > 0) {
      console.log('   Sample columns:', Object.keys(productsRows[0]));
      if (productsRows[0].price_sync_status !== undefined) {
        const statusCounts = {};
        productsRows.forEach(row => {
          statusCounts[row.price_sync_status] = (statusCounts[row.price_sync_status] || 0) + 1;
        });
        console.log('   Price sync status distribution:', statusCounts);
      }
    }
  }
  console.log();
  
  // Check processing SKUs in detail
  const { data: processingRows } = await supabase
    .from('sku_api_tracking')
    .select('sku, status, updated_at, last_api_call')
    .eq('status', 'processing')
    .limit(10);
  
  if (processingRows && processingRows.length > 0) {
    console.log('🔄 Sample processing SKUs:');
    processingRows.forEach(row => {
      console.log(`   ${row.sku}: updated ${row.updated_at}, last_call ${row.last_api_call}`);
    });
    console.log();
  }
  
  // Check progress view
  const { data: progress } = await supabase
    .from('price_sync_progress')
    .select('*')
    .single();
  
  if (progress) {
    console.log('📋 Progress view data:');
    console.log(`   Total: ${progress.total_skus}`);
    console.log(`   Completed: ${progress.completed}`);
    console.log(`   Pending: ${progress.pending}`);
    console.log(`   Failed: ${progress.failed}`);
    console.log(`   Processing: ${progress.processing}`);
    console.log(`   Completion: ${progress.completion_percentage}%\n`);
  }
  
  // Check what getNextBatch would return
  const { data: nextBatch } = await supabase
    .from('sku_api_tracking')
    .select('sku, merchant_id, status')
    .eq('status', 'pending')
    .limit(5);
  
  console.log(`🎯 Next batch would contain: ${nextBatch?.length || 0} SKUs`);
  if (nextBatch && nextBatch.length > 0) {
    nextBatch.forEach(row => {
      console.log(`   ${row.sku} (${row.status})`);
    });
  }
}

debugStatus().catch(console.error);