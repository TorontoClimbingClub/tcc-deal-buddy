import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProductsDuplicates() {
  console.log('🔍 Checking products table for duplicates...')
  
  const { data, error } = await supabase
    .from('products')
    .select('sku, merchant_id, last_sync_date, id, name')
    .order('sku')
    .order('merchant_id')
    .order('last_sync_date')

  if (error) throw error

  // Group by SKU + merchant_id to find duplicates
  const skuGroups = new Map()
  data?.forEach(product => {
    const key = `${product.sku}-${product.merchant_id}`
    if (!skuGroups.has(key)) {
      skuGroups.set(key, [])
    }
    skuGroups.get(key).push(product)
  })

  let duplicateGroups = 0
  let totalDuplicates = 0
  
  skuGroups.forEach((products, key) => {
    if (products.length > 1) {
      duplicateGroups++
      totalDuplicates += products.length - 1 // -1 because we keep one
      
      if (duplicateGroups <= 5) {
        console.log(`   Duplicate ${duplicateGroups}: ${key} (${products.length} versions)`)
        products.forEach(p => {
          console.log(`     ${p.last_sync_date}: ${p.name?.substring(0, 40)}...`)
        })
      }
    }
  })

  console.log(`   📊 Products: ${data?.length || 0} total, ${duplicateGroups} duplicate groups, ${totalDuplicates} excess records`)
  return { total: data?.length || 0, duplicateGroups, excessRecords: totalDuplicates }
}

async function checkPriceHistoryDuplicates() {
  console.log('\n🔍 Checking price_history table for duplicates...')
  
  // Check duplicates based on the unique constraint: product_sku + merchant_id + recorded_date
  const { data, error } = await supabase
    .from('price_history')
    .select('product_sku, merchant_id, recorded_date, price, id, created_at')
    .order('product_sku')
    .order('merchant_id') 
    .order('recorded_date')
    .order('created_at', { ascending: false })

  if (error) throw error

  const dateGroups = new Map()
  data?.forEach(record => {
    const key = `${record.product_sku}-${record.merchant_id}-${record.recorded_date}`
    if (!dateGroups.has(key)) {
      dateGroups.set(key, [])
    }
    dateGroups.get(key).push(record)
  })

  let duplicateGroups = 0
  let totalDuplicates = 0
  
  dateGroups.forEach((records, key) => {
    if (records.length > 1) {
      duplicateGroups++
      totalDuplicates += records.length - 1
      
      if (duplicateGroups <= 5) {
        console.log(`   Duplicate ${duplicateGroups}: ${key} (${records.length} records)`)
        records.forEach((r, i) => {
          const marker = i === 0 ? '✅ KEEP' : '❌ DELETE'
          console.log(`     ${marker}: $${r.price} - ${new Date(r.created_at).toLocaleString()}`)
        })
      }
    }
  })

  console.log(`   📊 Price History: ${data?.length || 0} total, ${duplicateGroups} duplicate groups, ${totalDuplicates} excess records`)
  return { total: data?.length || 0, duplicateGroups, excessRecords: totalDuplicates }
}

async function checkSkuTrackingDuplicates() {
  console.log('\n🔍 Checking sku_api_tracking table for duplicates...')
  
  const { data, error } = await supabase
    .from('sku_api_tracking')
    .select('sku, merchant_id, status, id, created_at')
    .order('sku')
    .order('merchant_id')

  if (error) throw error

  const skuGroups = new Map()
  data?.forEach(record => {
    const key = `${record.sku}-${record.merchant_id}`
    if (!skuGroups.has(key)) {
      skuGroups.set(key, [])
    }
    skuGroups.get(key).push(record)
  })

  let duplicateGroups = 0
  let totalDuplicates = 0
  
  skuGroups.forEach((records, key) => {
    if (records.length > 1) {
      duplicateGroups++
      totalDuplicates += records.length - 1
      
      if (duplicateGroups <= 5) {
        console.log(`   Duplicate ${duplicateGroups}: ${key} (${records.length} records)`)
        records.forEach((r, i) => {
          const marker = i === 0 ? '✅ KEEP' : '❌ DELETE'
          console.log(`     ${marker}: ${r.status} - ${new Date(r.created_at).toLocaleString()}`)
        })
      }
    }
  })

  console.log(`   📊 SKU Tracking: ${data?.length || 0} total, ${duplicateGroups} duplicate groups, ${totalDuplicates} excess records`)
  return { total: data?.length || 0, duplicateGroups, excessRecords: totalDuplicates }
}

async function checkUserTablesDuplicates() {
  console.log('\n🔍 Checking user tables for duplicates...')
  
  try {
    // Check user_favorites
    const { data: favorites, error: favError } = await supabase
      .from('user_favorites')
      .select('user_id, product_sku, merchant_id, id')

    if (favError && !favError.message.includes('relation') && !favError.message.includes('does not exist')) {
      throw favError
    }

    if (favorites) {
      const favGroups = new Map()
      favorites.forEach(fav => {
        const key = `${fav.user_id}-${fav.product_sku}-${fav.merchant_id}`
        if (!favGroups.has(key)) {
          favGroups.set(key, [])
        }
        favGroups.get(key).push(fav)
      })

      const favDuplicates = Array.from(favGroups.values()).filter(group => group.length > 1).length
      console.log(`   📊 User Favorites: ${favorites.length} total, ${favDuplicates} duplicate groups`)
    } else {
      console.log(`   📊 User Favorites: No data or table doesn't exist`)
    }

    // Check cart_items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('user_id, product_sku, merchant_id, id')

    if (cartError && !cartError.message.includes('relation') && !cartError.message.includes('does not exist')) {
      throw cartError
    }

    if (cartItems) {
      const cartGroups = new Map()
      cartItems.forEach(item => {
        const key = `${item.user_id}-${item.product_sku}-${item.merchant_id}`
        if (!cartGroups.has(key)) {
          cartGroups.set(key, [])
        }
        cartGroups.get(key).push(item)
      })

      const cartDuplicates = Array.from(cartGroups.values()).filter(group => group.length > 1).length
      console.log(`   📊 Cart Items: ${cartItems.length} total, ${cartDuplicates} duplicate groups`)
    } else {
      console.log(`   📊 Cart Items: No data or table doesn't exist`)
    }

  } catch (error) {
    console.log(`   ⚠️  User tables check failed: ${error.message}`)
  }
}

async function checkSyncJobsDuplicates() {
  console.log('\n🔍 Checking sync_jobs table for duplicates...')
  
  try {
    const { data: syncJobs, error } = await supabase
      .from('sync_jobs')
      .select('job_type, sync_date, status, id, started_at')
      .order('job_type')
      .order('sync_date')

    if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
      throw error
    }

    if (syncJobs) {
      const jobGroups = new Map()
      syncJobs.forEach(job => {
        const key = `${job.job_type}-${job.sync_date}`
        if (!jobGroups.has(key)) {
          jobGroups.set(key, [])
        }
        jobGroups.get(key).push(job)
      })

      let duplicateGroups = 0
      jobGroups.forEach((jobs, key) => {
        if (jobs.length > 1) {
          duplicateGroups++
          if (duplicateGroups <= 3) {
            console.log(`   Duplicate ${duplicateGroups}: ${key} (${jobs.length} jobs)`)
            jobs.forEach(j => {
              console.log(`     ${j.status} - ${new Date(j.started_at).toLocaleString()}`)
            })
          }
        }
      })

      console.log(`   📊 Sync Jobs: ${syncJobs.length} total, ${duplicateGroups} duplicate groups`)
    } else {
      console.log(`   📊 Sync Jobs: No data or table doesn't exist`)
    }

  } catch (error) {
    console.log(`   ⚠️  Sync jobs check failed: ${error.message}`)
  }
}

async function generateDuplicatesReport() {
  console.log('🔍 COMPREHENSIVE DUPLICATE CHECK REPORT')
  console.log('==================================================');
  
  try {
    const results = {}
    
    results.products = await checkProductsDuplicates()
    results.priceHistory = await checkPriceHistoryDuplicates()
    results.skuTracking = await checkSkuTrackingDuplicates()
    await checkUserTablesDuplicates()
    await checkSyncJobsDuplicates()

    console.log('\n📋 SUMMARY:')
    console.log('==============================');
    
    const totalRecords = results.products.total + results.priceHistory.total + results.skuTracking.total
    const totalDuplicateGroups = results.products.duplicateGroups + results.priceHistory.duplicateGroups + results.skuTracking.duplicateGroups
    const totalExcessRecords = results.products.excessRecords + results.priceHistory.excessRecords + results.skuTracking.excessRecords
    
    console.log(`📊 Total Records: ${totalRecords.toLocaleString()}`)
    console.log(`🔄 Total Duplicate Groups: ${totalDuplicateGroups}`)
    console.log(`❌ Total Excess Records: ${totalExcessRecords}`)
    
    if (totalExcessRecords > 0) {
      console.log(`\n⚠️  CONCERN LEVEL: ${totalExcessRecords > 1000 ? 'HIGH' : totalExcessRecords > 100 ? 'MEDIUM' : 'LOW'}`)
      console.log(`💾 Storage Impact: ~${(totalExcessRecords * 0.5).toFixed(1)}KB of unnecessary data`)
      
      if (totalExcessRecords > 500) {
        console.log('\n💡 RECOMMENDATIONS:')
        console.log('   - Run cleanup-duplicates.js --execute to remove duplicates')
        console.log('   - Check sync processes for bugs causing duplicates')
        console.log('   - Monitor database constraints to prevent future duplicates')
      }
    } else {
      console.log('\n✅ NO CONCERNING DUPLICATES FOUND')
      console.log('   Database appears clean and well-maintained')
    }

  } catch (error) {
    console.error('❌ Error generating duplicates report:', error)
    process.exit(1)
  }
}

generateDuplicatesReport()