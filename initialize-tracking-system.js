// Initialize the SKU tracking system via Edge Function
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://owtcaztrzujjuwwuldhl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dGNhenRyenVqanV3d3VsZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDgwNDAsImV4cCI6MjA2NjM4NDA0MH0.wA9RxmFpJNrEDMx7jjrGAm-9AUL4_YIvZ0i6GW7sKsE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function initializeTrackingSystem() {
  console.log('🚀 Initializing SKU Tracking System...\n')
  
  try {
    // Use the Edge Function to initialize the tracking system
    // This will run with service role permissions and populate the table
    console.log('📊 Running Edge Function to initialize tracking system...')
    
    const { data: initResult, error: initError } = await supabase.functions.invoke('comprehensive-price-backfill', {
      body: {
        batch_size: 1,  // Small batch just to initialize
        resume: true,   // This will trigger the population
        max_products: 1
      }
    })
    
    if (initError) {
      console.error('❌ Initialization failed:', initError.message)
      return
    }
    
    console.log('✅ Initialization completed!')
    console.log(`   Function result:`, initResult)
    
    // Now check the progress to see if tracking table was populated
    console.log('\n📈 Checking tracking system status...')
    
    const { data: progressData, error: progressError } = await supabase
      .from('price_sync_progress')
      .select('*')
      .single()
    
    if (progressError) {
      console.error('❌ Could not check progress:', progressError.message)
      return
    }
    
    console.log('📊 Tracking System Status:')
    console.log(`   Total SKUs tracked: ${progressData.total_skus}`)
    console.log(`   Completed: ${progressData.completed}`)
    console.log(`   Pending: ${progressData.pending}`)
    console.log(`   Failed: ${progressData.failed}`)
    console.log(`   Processing: ${progressData.processing}`)
    console.log(`   Completion: ${progressData.completion_percentage}%`)
    
    if (progressData.total_skus > 0) {
      console.log('\n🎉 SUCCESS! SKU tracking system initialized with', progressData.total_skus, 'SKUs')
      console.log('✅ Ready for full resumable price history backfill')
      console.log('\n🚀 Next step: Run the full backfill with:')
      console.log('   node execute-comprehensive-backfill.js')
    } else {
      console.log('\n⚠️  No SKUs found in tracking system. Check if products table has data.')
    }
    
  } catch (error) {
    console.error('💥 Initialization failed:', error)
  }
}

initializeTrackingSystem()