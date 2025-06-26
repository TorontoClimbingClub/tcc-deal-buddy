import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // AvantLink API credentials
    const affiliateId = Deno.env.get('AVANTLINK_AFFILIATE_ID')
    const apiKey = Deno.env.get('AVANTLINK_API_KEY')
    const websiteId = Deno.env.get('AVANTLINK_WEBSITE_ID')

    if (!affiliateId || !apiKey || !websiteId) {
      throw new Error('Missing AvantLink API credentials')
    }

    console.log('🔧 Testing AvantLink API with credentials:', {
      affiliateId,
      websiteId,
      apiKeyExists: !!apiKey
    })

    // Test multiple API variations to see what works
    const testCases = [
      {
        name: 'Basic search - no fields specified',
        params: {
          module: 'ProductSearch',
          affiliate_id: affiliateId,
          website_id: websiteId,
          search_term: 'climbing',
          merchant_ids: '9272',
          search_results_count: '3',
          output: 'json'
        }
      },
      {
        name: 'With specific fields',
        params: {
          module: 'ProductSearch',
          affiliate_id: affiliateId,
          website_id: websiteId,
          search_term: 'climbing',
          merchant_ids: '9272',
          search_results_count: '3',
          output: 'json',
          search_results_fields: 'Product SKU|Product Name|Sale Price|Retail Price|Merchant Name'
        }
      },
      {
        name: 'Sale items only',
        params: {
          module: 'ProductSearch',
          affiliate_id: affiliateId,
          website_id: websiteId,
          search_term: '*',
          merchant_ids: '9272',
          search_on_sale_only: '1',
          search_results_count: '3',
          output: 'json'
        }
      },
      {
        name: 'Different merchant (18557)',
        params: {
          module: 'ProductSearch',
          affiliate_id: affiliateId,
          website_id: websiteId,
          search_term: 'outdoor',
          merchant_ids: '18557',
          search_results_count: '3',
          output: 'json'
        }
      }
    ]

    const results = []

    for (const testCase of testCases) {
      try {
        console.log(`\n🧪 Testing: ${testCase.name}`)
        
        const apiUrl = new URL('https://classic.avantlink.com/api.php')
        Object.entries(testCase.params).forEach(([key, value]) => {
          apiUrl.searchParams.set(key, value)
        })

        console.log(`📞 API URL: ${apiUrl.toString()}`)

        const response = await fetch(apiUrl.toString())
        console.log(`📊 Response: ${response.status} ${response.statusText}`)

        const responseText = await response.text()
        console.log(`📄 Response length: ${responseText.length} characters`)
        console.log(`📝 Response preview: ${responseText.substring(0, 200)}...`)

        let parsedData = null
        let parseError = null

        try {
          parsedData = JSON.parse(responseText)
          console.log(`✅ JSON parsed successfully`)
          console.log(`📋 Data type: ${typeof parsedData}`)
          console.log(`📋 Is Array: ${Array.isArray(parsedData)}`)
          
          if (Array.isArray(parsedData)) {
            console.log(`📋 Array length: ${parsedData.length}`)
            if (parsedData.length > 0) {
              console.log(`📋 First item keys: ${Object.keys(parsedData[0]).join(', ')}`)
            }
          } else if (parsedData && typeof parsedData === 'object') {
            console.log(`📋 Object keys: ${Object.keys(parsedData).join(', ')}`)
          }
        } catch (err) {
          parseError = err.message
          console.log(`❌ JSON parse failed: ${parseError}`)
        }

        results.push({
          testCase: testCase.name,
          status: response.status,
          responseLength: responseText.length,
          responsePreview: responseText.substring(0, 200),
          parsedSuccessfully: !parseError,
          parseError,
          dataType: typeof parsedData,
          isArray: Array.isArray(parsedData),
          arrayLength: Array.isArray(parsedData) ? parsedData.length : null,
          firstItemKeys: Array.isArray(parsedData) && parsedData.length > 0 ? Object.keys(parsedData[0]) : null,
          objectKeys: parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData) ? Object.keys(parsedData) : null,
          fullData: parsedData // Include full data for small responses
        })

        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`❌ Test case "${testCase.name}" failed:`, error)
        results.push({
          testCase: testCase.name,
          error: error.message,
          failed: true
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'AvantLink API debug completed',
        credentials: {
          affiliateId,
          websiteId,
          apiKeyProvided: !!apiKey
        },
        testResults: results
      }, null, 2),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Debug function error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})