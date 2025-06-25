import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://owtcaztrzujjuwwuldhl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE'
);

async function checkMerchants() {
  console.log('🔍 Checking merchant distribution...\n');
  
  const today = new Date().toISOString().split('T')[0];
  
  // Get merchant distribution
  const { data, error } = await supabase
    .from('products')
    .select('merchant_name, merchant_id')
    .eq('last_sync_date', today);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Count by merchant
  const merchantCounts = new Map();
  data.forEach(product => {
    const key = `${product.merchant_name} (ID: ${product.merchant_id})`;
    merchantCounts.set(key, (merchantCounts.get(key) || 0) + 1);
  });
  
  console.log(`📊 Total Products: ${data.length}`);
  console.log(`🏪 Unique Merchants: ${merchantCounts.size}\n`);
  
  console.log('📋 Merchant Distribution:');
  Array.from(merchantCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([merchant, count]) => {
      console.log(`   ${merchant}: ${count} products (${Math.round(count/data.length*100)}%)`);
    });
}

checkMerchants();