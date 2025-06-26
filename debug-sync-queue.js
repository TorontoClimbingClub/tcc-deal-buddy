// Debug sync queue insertion
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://owtcaztrzujjuwwuldhl.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('SUPABASE_ANON_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugSyncQueue() {
  try {
    console.log('🔍 Checking sync_queue table structure...')
    
    // Check if sync_queue table exists and what columns it has
    const { data: tableInfo, error: tableError } = await supabase
      .from('sync_queue')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Error accessing sync_queue table:', tableError)
      return
    }
    
    console.log('✅ sync_queue table exists')
    
    // Try inserting a single simple record
    console.log('\n🧪 Testing single record insertion...')
    const testRecord = {
      product_sku: 'TEST-SKU-001',
      merchant_id: 18557,
      sync_type: 'full_history',
      priority: 1,
      status: 'pending'
    }
    
    const { data: insertResult, error: insertError } = await supabase
      .from('sync_queue')
      .insert(testRecord)
      .select()
    
    if (insertError) {
      console.error('❌ Insert error:', insertError)
      console.log('Error details:', JSON.stringify(insertError, null, 2))
    } else {
      console.log('✅ Insert successful:', insertResult)
      
      // Clean up test record
      await supabase
        .from('sync_queue')
        .delete()
        .eq('product_sku', 'TEST-SKU-001')
      
      console.log('🧹 Cleaned up test record')
    }
    
    // Check existing records
    console.log('\n📋 Current sync_queue contents:')
    const { data: queueContents, error: queueError } = await supabase
      .from('sync_queue')
      .select('*')
      .limit(5)
    
    if (queueError) {
      console.error('❌ Error fetching queue contents:', queueError)
    } else {
      console.log(`Found ${queueContents?.length || 0} records in sync_queue`)
      queueContents?.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.product_sku} - ${record.status}`)
      })
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

debugSyncQueue()