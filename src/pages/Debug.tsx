import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Database, Zap, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface SyncJob {
  id: string;
  job_type: string;
  job_subtype?: string;
  status: string;
  created_at: string;
  completed_at?: string;
  records_processed?: number;
  api_calls_used?: number;
  merchant_ids?: number[];
}

interface DatabaseStats {
  products_count: number;
  deals_count: number;
  price_history_count: number;
  last_sync_date: string;
}

const Debug: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [testResults, setTestResults] = useState<{ [key: string]: boolean }>({});

  // Test Supabase connection
  const testConnection = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('count').limit(1);
      if (error) throw error;
      setConnectionStatus('connected');
      setTestResults(prev => ({ ...prev, connection: true }));
    } catch (err) {
      console.error('Connection test failed:', err);
      setConnectionStatus('error');
      setTestResults(prev => ({ ...prev, connection: false }));
    } finally {
      setLoading(false);
    }
  };

  // Load recent sync jobs
  const loadSyncJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sync_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSyncJobs(data || []);
      setTestResults(prev => ({ ...prev, sync_jobs: true }));
    } catch (err) {
      console.error('Failed to load sync jobs:', err);
      setTestResults(prev => ({ ...prev, sync_jobs: false }));
    } finally {
      setLoading(false);
    }
  };

  // Load database statistics
  const loadDbStats = async () => {
    setLoading(true);
    try {
      // Get product counts
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Get current deals count
      const { count: dealsCount } = await supabase
        .from('current_deals')
        .select('*', { count: 'exact', head: true });

      // Get price history count
      const { count: priceHistoryCount } = await supabase
        .from('price_history')
        .select('*', { count: 'exact', head: true });

      // Get last sync date
      const { data: lastSync } = await supabase
        .from('products')
        .select('last_sync_date')
        .order('last_sync_date', { ascending: false })
        .limit(1);

      setDbStats({
        products_count: productsCount || 0,
        deals_count: dealsCount || 0,
        price_history_count: priceHistoryCount || 0,
        last_sync_date: lastSync?.[0]?.last_sync_date || 'Never'
      });
      
      setTestResults(prev => ({ ...prev, database_stats: true }));
    } catch (err) {
      console.error('Failed to load database stats:', err);
      setTestResults(prev => ({ ...prev, database_stats: false }));
    } finally {
      setLoading(false);
    }
  };

  // Test intelligent sync function
  const testSyncFunction = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://owtcaztrzujjuwwuldhl.supabase.co/functions/v1/intelligent-sync?mode=daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ mode: 'daily', maxProductsPerMerchant: 10 })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Sync test result:', result);
      setTestResults(prev => ({ ...prev, sync_function: true }));
    } catch (err) {
      console.error('Sync function test failed:', err);
      setTestResults(prev => ({ ...prev, sync_function: false }));
    } finally {
      setLoading(false);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    await testConnection();
    await loadSyncJobs();
    await loadDbStats();
    await testSyncFunction();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">TCC Deal Buddy Debug</h1>
            <p className="text-gray-600 mt-2">System diagnostics and testing</p>
          </div>
          <Button onClick={runAllTests} disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Run All Tests
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="sync">Sync Jobs</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Connection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Connection Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Badge variant={connectionStatus === 'connected' ? 'default' : connectionStatus === 'error' ? 'destructive' : 'secondary'}>
                    {connectionStatus === 'connected' ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : connectionStatus === 'error' ? (
                      <AlertCircle className="w-3 h-3 mr-1" />
                    ) : null}
                    {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'error' ? 'Error' : 'Unknown'}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={testConnection} disabled={loading}>
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Database Stats */}
            {dbStats && (
              <Card>
                <CardHeader>
                  <CardTitle>Database Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{dbStats.products_count}</div>
                      <div className="text-sm text-gray-600">Total Products</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{dbStats.deals_count}</div>
                      <div className="text-sm text-gray-600">Current Deals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{dbStats.price_history_count}</div>
                      <div className="text-sm text-gray-600">Price Records</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">{dbStats.last_sync_date}</div>
                      <div className="text-sm text-gray-600">Last Sync</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Operations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={loadDbStats} disabled={loading}>
                  <Database className="w-4 h-4 mr-2" />
                  Refresh Database Stats
                </Button>
                {dbStats && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm">{JSON.stringify(dbStats, null, 2)}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Recent Sync Jobs
                  </span>
                  <Button variant="outline" size="sm" onClick={loadSyncJobs} disabled={loading}>
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {syncJobs.length > 0 ? (
                  <div className="space-y-3">
                    {syncJobs.map((job) => (
                      <div key={job.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant={job.status === 'completed' ? 'default' : job.status === 'failed' ? 'destructive' : 'secondary'}>
                              {job.status}
                            </Badge>
                            <span className="font-medium">{job.job_type}</span>
                            {job.job_subtype && <span className="text-gray-500">({job.job_subtype})</span>}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(job.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Records: {job.records_processed || 0} | API Calls: {job.api_calls_used || 0}
                          {job.merchant_ids && ` | Merchants: ${job.merchant_ids.join(', ')}`}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No sync jobs found. Click refresh to load recent jobs.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Tests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(testResults).map(([test, passed]) => (
                    <div key={test} className="flex items-center justify-between p-3 border rounded">
                      <span className="capitalize">{test.replace('_', ' ')}</span>
                      <Badge variant={passed ? 'default' : 'destructive'}>
                        {passed ? 'Pass' : 'Fail'}
                      </Badge>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <Button onClick={testSyncFunction} disabled={loading} className="w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    Test Sync Function (Small Test)
                  </Button>
                  <p className="text-sm text-gray-600">
                    This will test the intelligent-sync function with a small batch (10 products max)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Debug;