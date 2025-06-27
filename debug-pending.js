import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://owtcaztrzujjuwwuldhl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE')

console.log('🔍 Debugging pending SKU selection...')

// Check what's in the tracking table
const { data: sample, error: sampleError } = await supabase
  .from('sku_api_tracking')
  .select('sku, status, created_at')
  .limit(10)

if (sampleError) {
  console.error('❌ Error getting sample:', sampleError.message)
} else {
  console.log('📋 Sample tracking records:')
  sample?.forEach((record, i) => {
    console.log(`   ${i+1}. ${record.sku} - ${record.status}`)
  })
}

// Try the pending query
const { data: pending, error: pendingError } = await supabase
  .from('sku_api_tracking')
  .select('sku, merchant_id, status')
  .eq('status', 'pending')
  .limit(5)

if (pendingError) {
  console.error('❌ Error getting pending:', pendingError.message)
} else {
  console.log(`\n📦 Found ${pending?.length || 0} pending SKUs`)
  pending?.forEach((record, i) => {
    console.log(`   ${i+1}. ${record.sku} - ${record.status}`)
  })
}

// Check status counts
const { data: statusCounts } = await supabase
  .from('sync_activity_status')
  .select('*')

console.log('\n📊 Status breakdown:')
statusCounts?.forEach(status => {
  console.log(`   ${status.status}: ${status.count}`)
})