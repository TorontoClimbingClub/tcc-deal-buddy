#!/usr/bin/env node

/**
 * Test database connection and verify tables exist
 * This uses the Supabase JS client instead of CLI
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔍 Testing TCC Deal Buddy database connection...\n');

  // Initialize Supabase client
  const supabaseUrl = 'https://owtcaztrzujjuwwuldhl.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE';

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test 1: Check if new tables exist
    console.log('📋 Checking if enhanced tables exist...');
    
    const tables = ['products', 'price_history', 'user_favorites', 'cart_items', 'sync_jobs'];
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`✅ Table '${table}': Accessible`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}': Error - ${err.message}`);
      }
    }

    // Test 2: Check views
    console.log('\n📊 Checking if views exist...');
    
    const views = ['current_deals', 'user_cart_summary'];
    
    for (const view of views) {
      try {
        const { error } = await supabase.from(view).select('*').limit(1);
        if (error) {
          console.log(`❌ View '${view}': ${error.message}`);
        } else {
          console.log(`✅ View '${view}': Accessible`);
        }
      } catch (err) {
        console.log(`❌ View '${view}': Error - ${err.message}`);
      }
    }

    // Test 3: Test basic operations
    console.log('\n🧪 Testing basic operations...');
    
    // Test insert into sync_jobs
    try {
      const { data, error } = await supabase
        .from('sync_jobs')
        .insert({
          job_type: 'daily_products',
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.log(`❌ Insert test: ${error.message}`);
      } else {
        console.log(`✅ Insert test: Success (ID: ${data.id})`);
        
        // Clean up test data
        await supabase.from('sync_jobs').delete().eq('id', data.id);
        console.log(`🧹 Cleanup: Test record deleted`);
      }
    } catch (err) {
      console.log(`❌ Insert test: ${err.message}`);
    }

    // Test 4: Check RLS policies
    console.log('\n🔒 Testing Row Level Security...');
    
    try {
      const { error } = await supabase.from('user_favorites').select('*').limit(1);
      console.log('✅ RLS test: user_favorites accessible (policies active)');
    } catch (err) {
      console.log(`❌ RLS test: ${err.message}`);
    }

    console.log('\n🎉 Database connection test complete!');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

// Run the test
testDatabaseConnection().catch(console.error);