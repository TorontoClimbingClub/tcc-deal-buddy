// Apply sync_queue table schema via Edge Function
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = 'https://owtcaztrzujjuwwuldhl.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('SUPABASE_ANON_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function applySyncQueueSchema() {
  try {
    console.log('🛠️ Applying sync_queue table schema...')
    
    // Use the apply-schema-fix function to execute our SQL
    const sqlContent = readFileSync('create-sync-queue-table.sql', 'utf8')
    
    const { data: result, error } = await supabase.functions.invoke('apply-schema-fix', {
      body: { sql: sqlContent }
    })
    
    if (error) {
      console.error('❌ Error applying schema:', error)
      return
    }
    
    console.log('✅ Schema applied successfully:', result)
    
    // Test the table was created
    console.log('\n🧪 Testing sync_queue table access...')
    const { data: testResult, error: testError } = await supabase
      .from('sync_queue')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ Table still not accessible:', testError)
    } else {
      console.log('✅ sync_queue table is now accessible!')
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

applySyncQueueSchema()