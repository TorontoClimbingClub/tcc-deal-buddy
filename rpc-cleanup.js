import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://owtcaztrzujjuwwuldhl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE')

console.log('🧹 Using RPC function to cleanup stuck processing records...')

const { data, error } = await supabase.rpc('cleanup_stuck_processing')

if (error) {
  console.error('❌ Error:', error.message)
} else {
  console.log(`✅ Cleaned up ${data?.[0]?.cleaned_count || 0} records`)
  
  // Check updated status
  const { data: status } = await supabase.from('price_sync_progress').select('*').single()
  if (status) {
    console.log(`📊 Updated: ${status.pending} pending, ${status.processing} processing`)
  }
}