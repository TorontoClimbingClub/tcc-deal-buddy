import { supabase } from '@/integrations/supabase/client';

export async function debugDatabaseContents() {
  console.log('🔍 Debugging database contents...');
  
  try {
    // Check total products count
    const { count: totalCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error getting total count:', countError);
      return { error: countError.message };
    }
    
    console.log(`📊 Total products in database: ${totalCount}`);
    
    // Check products by sync date
    const today = new Date().toISOString().split('T')[0];
    const { count: todayCount, error: todayError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('last_sync_date', today);
    
    if (todayError) {
      console.error('❌ Error getting today count:', todayError);
      return { error: todayError.message };
    }
    
    console.log(`📅 Products synced today (${today}): ${todayCount}`);
    
    // Get sample products to see what's actually saved
    const { data: sampleProducts, error: sampleError } = await supabase
      .from('products')
      .select('*')
      .eq('last_sync_date', today)
      .limit(10);
    
    if (sampleError) {
      console.error('❌ Error getting sample products:', sampleError);
      return { error: sampleError.message };
    }
    
    console.log('📋 Sample products:');
    sampleProducts?.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.sku})`);
      console.log(`   Merchant: ${product.merchant_name} (ID: ${product.merchant_id})`);
      console.log(`   Prices: Sale $${product.sale_price}, Retail $${product.retail_price}`);
      console.log(`   Sync Date: ${product.last_sync_date}`);
      console.log('');
    });
    
    // Check sync jobs
    const { data: syncJobs, error: jobsError } = await supabase
      .from('sync_jobs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(5);
    
    if (jobsError) {
      console.error('❌ Error getting sync jobs:', jobsError);
    } else {
      console.log('📝 Recent sync jobs:');
      syncJobs?.forEach((job, index) => {
        console.log(`${index + 1}. ${job.job_type}: ${job.status} (${job.records_processed} records)`);
        console.log(`   Started: ${job.started_at}`);
        if (job.error_message) console.log(`   Error: ${job.error_message}`);
        console.log('');
      });
    }
    
    // Check for products in different date ranges
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const { count: yesterdayCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('last_sync_date', yesterdayStr);
    
    console.log(`📅 Products from yesterday (${yesterdayStr}): ${yesterdayCount || 0}`);
    
    return {
      totalCount,
      todayCount,
      yesterdayCount: yesterdayCount || 0,
      sampleProducts,
      syncJobs,
      debug: {
        todayDate: today,
        yesterdayDate: yesterdayStr
      }
    };
    
  } catch (error) {
    console.error('💥 Debug failed:', error);
    return { error: error.message };
  }
}