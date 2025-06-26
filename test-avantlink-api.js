// Test script to directly call AvantLink API and see the response format
const fetch = require('node-fetch');

const testAvantLinkAPI = async () => {
  const affiliateId = '348445';
  const websiteId = '406357';
  // You'll need to replace this with your actual API key
  const apiKey = 'YOUR_API_KEY_HERE';

  try {
    // Test with MEC merchant (9272)
    const apiUrl = new URL('https://classic.avantlink.com/api.php');
    apiUrl.searchParams.set('module', 'ProductSearch');
    apiUrl.searchParams.set('affiliate_id', affiliateId);
    apiUrl.searchParams.set('website_id', websiteId);
    apiUrl.searchParams.set('search_term', 'climbing');
    apiUrl.searchParams.set('merchant_ids', '9272');
    apiUrl.searchParams.set('search_results_count', '5'); // Just 5 for testing
    apiUrl.searchParams.set('output', 'json');
    
    console.log('Testing API URL:', apiUrl.toString());
    
    const response = await fetch(apiUrl.toString());
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    const data = await response.text();
    console.log('Raw response:', data.substring(0, 500) + '...');
    
    try {
      const jsonData = JSON.parse(data);
      console.log('Parsed JSON structure:');
      console.log('Type:', typeof jsonData);
      console.log('Is Array:', Array.isArray(jsonData));
      
      if (Array.isArray(jsonData) && jsonData.length > 0) {
        console.log('First product fields:', Object.keys(jsonData[0]));
        console.log('First product sample:', jsonData[0]);
      } else if (jsonData && typeof jsonData === 'object') {
        console.log('Response object keys:', Object.keys(jsonData));
        console.log('Full response:', jsonData);
      }
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError.message);
      console.log('Response might be XML or error format');
    }
    
  } catch (error) {
    console.error('API Test Error:', error);
  }
};

testAvantLinkAPI();