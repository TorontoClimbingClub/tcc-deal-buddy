// Test AvantLink API with XML output to see actual response
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://owtcaztrzujjuwwuldhl.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('SUPABASE_ANON_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAvantLinkXML() {
  try {
    console.log('🧪 Testing AvantLink API with XML output...')
    
    // Use debug-avantlink to test the exact API call
    const { data: result, error } = await supabase.functions.invoke('debug-avantlink', {})
    
    if (error) {
      console.error('❌ Debug function error:', error)
      return
    }
    
    console.log('✅ Debug function response:')
    console.log(JSON.stringify(result, null, 2))
    
    // Also test direct ProductPriceCheck call
    console.log('\n🔍 Testing ProductPriceCheck API directly...')
    
    const apiUrl = 'https://classic.avantlink.com/api.php?' + new URLSearchParams({
      module: 'ProductPriceCheck',
      affiliate_id: '348445',
      merchant_id: '18557',
      sku: '6027-627',
      show_pricing_history: 'true',
      show_retail_price: 'true',
      output: 'xml'
    }).toString()
    
    console.log('🌐 API URL:', apiUrl)
    
    try {
      const response = await fetch(apiUrl)
      console.log(`📊 Response status: ${response.status}`)
      
      if (response.ok) {
        const xmlText = await response.text()
        console.log('📄 XML Response:')
        console.log(xmlText)
        
        // Test our XML parsing
        console.log('\n🔧 Testing XML parsing...')
        const parsed = parseXML(xmlText)
        console.log('Parsed results:', parsed)
      } else {
        console.log('❌ API call failed')
      }
    } catch (fetchError) {
      console.error('❌ Direct API call failed:', fetchError)
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

// Simple XML parser for testing
function parseXML(xmlText) {
  const priceHistory = []
  
  const table1Regex = /<Table1>(.*?)<\/Table1>/gs
  let match
  
  while ((match = table1Regex.exec(xmlText)) !== null) {
    const tableContent = match[1]
    
    const dateMatch = tableContent.match(/<Date>(.*?)<\/Date>/)
    const retailPriceMatch = tableContent.match(/<Retail_Price>(.*?)<\/Retail_Price>/)
    const salePriceMatch = tableContent.match(/<Sale_Price>(.*?)<\/Sale_Price>/)
    
    if (dateMatch && retailPriceMatch && salePriceMatch) {
      priceHistory.push({
        date: dateMatch[1].trim(),
        retail_price: retailPriceMatch[1].trim(),
        sale_price: salePriceMatch[1].trim()
      })
    }
  }
  
  return priceHistory
}

testAvantLinkXML()