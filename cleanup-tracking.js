// Cleanup stuck processing records in the tracking table
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://owtcaztrzujjuwwuldhl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanupTracking() {
  console.log('🧹 Cleaning up stuck processing records...\n')
  
  try {
    // Get current status
    const { data: beforeStatus } = await supabase
      .from('price_sync_progress')
      .select('*')
      .single()
    
    if (beforeStatus) {
      console.log('📊 Before cleanup:')
      console.log(`   Total: ${beforeStatus.total_skus}`)
      console.log(`   Completed: ${beforeStatus.completed}`)
      console.log(`   Pending: ${beforeStatus.pending}`)
      console.log(`   Processing: ${beforeStatus.processing}`)
      console.log(`   Failed: ${beforeStatus.failed}`)
    }
    
    // Reset all processing records to pending
    const { data: resetResult, error: resetError } = await supabase
      .from('sku_api_tracking')
      .update({ 
        status: 'pending',
        error_message: 'Reset from stuck processing state by cleanup script'
      })
      .eq('status', 'processing')
      .select('sku')
    
    if (resetError) {
      console.error('❌ Error resetting processing records:', resetError.message)
      return
    }
    
    console.log(`\n✅ Reset ${resetResult?.length || 0} stuck processing records to pending`)
    
    // Get updated status
    const { data: afterStatus } = await supabase
      .from('price_sync_progress')
      .select('*')
      .single()
    
    if (afterStatus) {
      console.log('\n📊 After cleanup:')
      console.log(`   Total: ${afterStatus.total_skus}`)
      console.log(`   Completed: ${afterStatus.completed}`)
      console.log(`   Pending: ${afterStatus.pending}`)
      console.log(`   Processing: ${afterStatus.processing}`)
      console.log(`   Failed: ${afterStatus.failed}`)
      console.log(`   Completion: ${afterStatus.completion_percentage}%`)
    }
    
    console.log('\n🎉 Cleanup completed! Ready for local price sync.')
    
  } catch (error) {
    console.error('💥 Cleanup failed:', error)
  }
}

cleanupTracking()