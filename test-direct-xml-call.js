// Test direct AvantLink API call with XML output
async function testDirectXMLCall() {
  try {
    console.log('🧪 Testing direct AvantLink ProductPriceCheck API with XML output...')
    
    // Build the exact API URL with XML output - try different combinations
    const apiConfigs = [
      {
        name: 'Standard call',
        params: {
          module: 'ProductPriceCheck',
          affiliate_id: '348445',
          merchant_id: '18557', 
          sku: '6027-627',
          show_pricing_history: 'true',
          show_retail_price: 'true',
          output: 'xml'
        }
      },
      {
        name: 'With boolean values as 1',
        params: {
          module: 'ProductPriceCheck',
          affiliate_id: '348445',
          merchant_id: '18557', 
          sku: '6027-627',
          show_pricing_history: '1',
          show_retail_price: '1',
          output: 'xml'
        }
      },
      {
        name: 'Different SKU from database',
        params: {
          module: 'ProductPriceCheck',
          affiliate_id: '348445',
          merchant_id: '18557', 
          sku: '5002-030',  // Coghlan's product from our database
          show_pricing_history: '1',
          show_retail_price: '1',
          output: 'xml'
        }
      }
    ]
    
    for (const config of apiConfigs) {
      console.log(`\n${'='.repeat(60)}`)
      console.log(`🧪 Testing: ${config.name}`)
      console.log(`${'='.repeat(60)}`)
      
      const apiUrl = 'https://classic.avantlink.com/api.php?' + new URLSearchParams(config.params).toString()
    
      console.log('🌐 API URL:', apiUrl)
      
      const response = await fetch(apiUrl)
      console.log(`📊 Response status: ${response.status} ${response.statusText}`)
      
      if (response.ok) {
        const xmlText = await response.text()
        console.log('\n📄 XML Response:')
        console.log(xmlText)
        
        // Test XML parsing
        const parsed = parseXMLData(xmlText)
        console.log(`✅ Parsed ${parsed.length} price history entries`)
        if (parsed.length > 0) {
          parsed.forEach((entry, index) => {
            console.log(`  ${index + 1}. Date: ${entry.date}, Retail: $${entry.retail_price}, Sale: $${entry.sale_price}`)
          })
        }
        
      } else {
        console.log('❌ API call failed')
        const errorText = await response.text()
        console.log('Error response:', errorText)
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
  } catch (error) {
    console.error('💥 Error:', error)
  }
}

// XML parser function
function parseXMLData(xmlText) {
  const priceHistory = []
  
  console.log('\n🔍 Searching for Table1 entries in XML...')
  
  // Look for Table1 entries
  const table1Regex = /<Table1>(.*?)<\/Table1>/gs
  let match
  let matchCount = 0
  
  while ((match = table1Regex.exec(xmlText)) !== null) {
    matchCount++
    const tableContent = match[1]
    console.log(`Found Table1 entry ${matchCount}:`, tableContent.substring(0, 100))
    
    // Extract date, retail_price, and sale_price
    const dateMatch = tableContent.match(/<Date>(.*?)<\/Date>/)
    const retailPriceMatch = tableContent.match(/<Retail_Price>(.*?)<\/Retail_Price>/)
    const salePriceMatch = tableContent.match(/<Sale_Price>(.*?)<\/Sale_Price>/)
    
    console.log('  Date match:', dateMatch?.[1])
    console.log('  Retail match:', retailPriceMatch?.[1])
    console.log('  Sale match:', salePriceMatch?.[1])
    
    if (dateMatch && retailPriceMatch && salePriceMatch) {
      priceHistory.push({
        date: dateMatch[1].trim(),
        retail_price: retailPriceMatch[1].trim(),
        sale_price: salePriceMatch[1].trim()
      })
    }
  }
  
  console.log(`Total Table1 entries found: ${matchCount}`)
  return priceHistory
}

testDirectXMLCall()