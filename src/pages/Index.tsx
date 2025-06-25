
import React, { useState } from 'react';
import ProductGrid from '../components/ProductGrid';
import { Button } from '../components/ui/button';
import { testProductSync, testFullDailySync, testCleanup, testMultiMerchantSync } from '../utils/testSync';
import { debugDatabaseContents } from '../utils/debugDatabase';
import { debugAvantLinkApi } from '../utils/debugApi';
import { analyzeDuplicates } from '../utils/analyzeDuplicates';
import { testMerchantAvailability } from '../utils/testMerchants';

const Index = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTestSync = async () => {
    setIsLoading(true);
    setTestResult('Testing basic product sync...');
    
    try {
      const result = await testProductSync();
      if (result.success) {
        setTestResult(`✅ Basic sync success! Saved ${result.savedCount} products to database.`);
      } else {
        setTestResult(`❌ Basic sync failed: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFullSync = async () => {
    setIsLoading(true);
    setTestResult('Running comprehensive daily sync... This may take several minutes.');
    
    try {
      const result = await testFullDailySync();
      if (result.success) {
        setTestResult(`🎉 Full daily sync completed!\n📊 Saved: ${result.result.totalSaved} products\n📂 Categories: ${result.result.syncedCategories.join(', ')}\n❌ Errors: ${result.result.totalErrors}`);
      } else {
        setTestResult(`❌ Full sync failed: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Full sync error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMultiMerchantSync = async () => {
    setIsLoading(true);
    setTestResult('Running multi-merchant sync...');
    
    try {
      const result = await testMultiMerchantSync();
      if (result.success) {
        const merchantInfo = result.result.merchantResults
          .map(r => `${r.merchant}: ${r.saved || 0} products${r.error ? ` (Error: ${r.error})` : ''}`)
          .join('\n');
        
        setTestResult(`🎉 Multi-merchant sync completed!\n📊 Total saved: ${result.result.totalSaved} products\n\n🏪 Merchant Results:\n${merchantInfo}\n\n❌ Total errors: ${result.result.totalErrors}`);
      } else {
        setTestResult(`❌ Multi-merchant sync failed: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Multi-merchant sync error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanup = async () => {
    setIsLoading(true);
    setTestResult('Cleaning up old products...');
    
    try {
      const result = await testCleanup();
      if (result.success) {
        setTestResult(`🗑️ Cleanup completed! Removed ${result.removedCount} old products.`);
      } else {
        setTestResult(`❌ Cleanup failed: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Cleanup error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebugDatabase = async () => {
    setIsLoading(true);
    setTestResult('Checking database contents...');
    
    try {
      const result = await debugDatabaseContents();
      if (result.error) {
        setTestResult(`❌ Debug failed: ${result.error}`);
      } else {
        const debugInfo = `🔍 Database Debug Results:
📊 Total products: ${result.totalCount}
📅 Today's products: ${result.todayCount}
📅 Yesterday's products: ${result.yesterdayCount}

📋 Sample products (showing ${result.sampleProducts?.length || 0}):
${result.sampleProducts?.map((p, i) => `${i+1}. ${p.name} - $${p.sale_price} (${p.merchant_name})`).join('\n') || 'No products found'}

📝 Recent sync jobs:
${result.syncJobs?.map((j, i) => `${i+1}. ${j.job_type}: ${j.status} (${j.records_processed} records)`).join('\n') || 'No sync jobs found'}

🗓️ Today: ${result.debug?.todayDate}
🗓️ Yesterday: ${result.debug?.yesterdayDate}`;
        
        setTestResult(debugInfo);
      }
    } catch (error) {
      setTestResult(`❌ Debug error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebugApi = async () => {
    setIsLoading(true);
    setTestResult('Checking AvantLink API...');
    
    try {
      const result = await debugAvantLinkApi();
      if (result.error) {
        setTestResult(`❌ API Debug failed: ${result.error}`);
      } else {
        const apiInfo = `🔍 AvantLink API Debug Results:
⚙️ Configured: ${result.configured}
🔗 Connection: ${result.connectionTest ? 'WORKING' : 'FAILED'}
📊 Search results: ${result.searchResults} products
💰 Sale results: ${result.saleResults} products

📄 Sample Product Fields:
${result.sampleProduct ? Object.keys(result.sampleProduct).join(', ') : 'No product data'}

📄 Sample Product Data:
${result.sampleProduct ? JSON.stringify(result.sampleProduct, null, 2).substring(0, 800) + '...' : 'No data'}

💰 Sale Product Sample:
${result.saleSampleProduct ? `Name: "${result.saleSampleProduct['Product Name']}"
ID: "${result.saleSampleProduct['Product Id']}"
SKU: "${result.saleSampleProduct['Product SKU']}"
Merchant: "${result.saleSampleProduct['Merchant Name']}"
Sale Price: "${result.saleSampleProduct['Sale Price']}"
Retail Price: "${result.saleSampleProduct['Retail Price']}"` : 'No sale data'}`;
        
        setTestResult(apiInfo);
      }
    } catch (error) {
      setTestResult(`❌ API Debug error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeDuplicates = async () => {
    setIsLoading(true);
    setTestResult('Analyzing duplicates in database...');
    
    try {
      const result = await analyzeDuplicates();
      if (result.error) {
        setTestResult(`❌ Duplicate analysis failed: ${result.error}`);
      } else {
        const duplicateInfo = `🔍 Duplicate Analysis Results:
📊 Total Products: ${result.totalProducts}

🎯 Uniqueness Breakdown:
   Unique SKUs: ${result.uniqueSkus} (${result.duplicateCounts?.skuDuplicates || 0} SKU duplicates - ${result.duplicatePercentage?.bySku || 0}%)
   Unique Names: ${result.uniqueNames} (${result.duplicateCounts?.nameDuplicates || 0} name duplicates - ${result.duplicatePercentage?.byName || 0}%)
   Unique Name+Merchant: ${result.uniqueNameAndMerchant} (${result.duplicateCounts?.exactDuplicates || 0} exact duplicates - ${result.duplicatePercentage?.exact || 0}%)
   Unique URLs: ${result.uniqueUrls}

📋 Sample Exact Duplicates:
${result.sampleDuplicates?.map((dup, i) => 
  `${i+1}. "${dup.products[0]?.name}" (${dup.count} copies)
     Merchant: ${dup.products[0]?.merchant}
     SKUs: ${dup.products.map(p => p.sku).join(', ')}`
).join('\n\n') || 'No exact duplicates found'}

💡 Summary:
${result.duplicatePercentage?.exact === 0 ? 
  '✅ No exact duplicates! All products are unique by name+merchant.' : 
  `⚠️ ${result.duplicateCounts?.exactDuplicates} exact duplicates found (${result.duplicatePercentage?.exact}% of total)`}`;
        
        setTestResult(duplicateInfo);
      }
    } catch (error) {
      setTestResult(`❌ Duplicate analysis error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestMerchants = async () => {
    setIsLoading(true);
    setTestResult('Testing merchant availability...');
    
    try {
      const result = await testMerchantAvailability();
      
      const merchantInfo = `🔍 Merchant Availability Test:
🏪 Unique merchants found: ${result.merchantCount}
📋 Merchants: ${result.uniqueMerchants.join(', ') || 'None'}

🔍 Search Results:
${result.searchResults.map(r => 
  r.error ? 
  `❌ "${r.search}": Error - ${r.error}` :
  `${r.productCount > 0 ? '✅' : '❌'} "${r.search}" (sale=${r.onSale}): ${r.productCount} products
   Merchants: ${r.merchants}`
).join('\n\n')}

💡 Analysis:
${result.merchantCount === 1 ? 
  '⚠️ Only one merchant (MEC) is returning results.\n\nPossible reasons:\n1. Your AvantLink account may only be approved for MEC\n2. Other merchants may not have active promotions\n3. You may need to apply for additional merchant relationships\n\nCheck your AvantLink dashboard for approved merchants.' : 
  `✅ Found ${result.merchantCount} different merchants!`}`;
      
      setTestResult(merchantInfo);
    } catch (error) {
      setTestResult(`❌ Merchant test error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Test Section */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-blue-900">Product Sync Testing</h3>
            <p className="text-blue-700">Test saving AvantLink products to Supabase database</p>
          </div>
        </div>
        
        <div className="flex gap-3 mb-4 flex-wrap">
          <Button 
            onClick={handleTestSync} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Testing...' : 'Basic Test (10 items)'}
          </Button>
          
          <Button 
            onClick={handleFullSync} 
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'Syncing...' : 'Full Daily Sync'}
          </Button>
          
          <Button 
            onClick={handleMultiMerchantSync} 
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? 'Syncing...' : 'Multi-Merchant Sync'}
          </Button>
          
          <Button 
            onClick={handleCleanup} 
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? 'Cleaning...' : 'Cleanup Old Items'}
          </Button>
          
          <Button 
            onClick={handleDebugDatabase} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Checking...' : 'Check Database'}
          </Button>
          
          <Button 
            onClick={handleAnalyzeDuplicates} 
            disabled={isLoading}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Duplicates'}
          </Button>
          
          <Button 
            onClick={handleTestMerchants} 
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isLoading ? 'Testing...' : 'Test Merchants'}
          </Button>
        </div>
        
        {testResult && (
          <div className="mt-3 text-sm">
            <pre className="whitespace-pre-wrap text-blue-800 bg-white p-3 rounded border">{testResult}</pre>
          </div>
        )}
      </div>
      
      <ProductGrid />
      
      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 TCC Deal Dashboard
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
