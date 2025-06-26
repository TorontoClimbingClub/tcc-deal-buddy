#!/usr/bin/env node

/**
 * Execute SQL migration to add columns to products table
 * This script attempts to run the DDL using Supabase client
 */

const { createClient } = require('@supabase/supabase-js');

async function executeMigration() {
  console.log('🔧 Executing SQL migration to add columns to products table...\n');

  // Initialize Supabase client
  const supabaseUrl = 'https://owtcaztrzujjuwwuldhl.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE';

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('📋 Checking current products table structure...');
    
    // First, let's see if we can access the products table
    const { data: existingData, error: selectError } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (selectError) {
      console.log(`❌ Cannot access products table: ${selectError.message}`);
      return;
    }

    console.log('✅ Products table is accessible');

    // Check if columns already exist by trying to select them
    console.log('\n🔍 Checking if new columns already exist...');
    
    const { data: columnCheck, error: columnError } = await supabase
      .from('products')
      .select('sync_priority, availability_score')
      .limit(1);

    if (!columnError && columnCheck !== null) {
      console.log('✅ Columns sync_priority and availability_score already exist!');
      console.log('🎉 Migration not needed - columns are already present.');
      return;
    }

    console.log('📝 Columns do not exist yet, attempting to add them...');

    // Attempt to execute the DDL - this will likely fail with anon key
    const sql = `
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS sync_priority INTEGER DEFAULT 3,
      ADD COLUMN IF NOT EXISTS availability_score FLOAT DEFAULT 1.0;
    `;

    console.log('\n🔧 Executing DDL commands...');
    console.log('SQL:', sql);

    // Note: This will likely fail because DDL operations require elevated permissions
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.log(`❌ DDL execution failed: ${error.message}`);
      console.log('\n💡 This is expected - DDL operations require elevated permissions.');
      console.log('💡 The migration file has been created at:');
      console.log('   /mnt/ssd/Projects/tcc-deal-buddy/supabase/migrations/20250626134438_add_products_columns.sql');
      console.log('\n🔑 To execute this migration, you need to:');
      console.log('   1. Use the Supabase CLI with database password: npx supabase db push');
      console.log('   2. Or execute the SQL directly in Supabase Dashboard SQL Editor');
      console.log('   3. Dashboard URL: https://supabase.com/dashboard/project/owtcaztrzujjuwwuldhl/sql');
    } else {
      console.log('✅ DDL execution successful!');
      console.log('🎉 Columns added successfully to products table.');
    }

  } catch (error) {
    console.error('❌ Migration execution failed:', error.message);
  }
}

// Run the migration
executeMigration().catch(console.error);