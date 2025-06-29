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
  products_added?: number;
  products_updated?: number;
  price_history_entries?: number;
  last_run_duration_ms?: number;
  success_rate?: number;
}

interface SyncJobHealth {
  job_type: string;
  job_display_name: string;
  schedule_display: string;
  total_runs_7_days: number;
  successful_runs: number;
  failed_runs: number;
  currently_running: number;
  success_rate_percent: number;
  last_successful_run: string;
  last_failed_run: string;
  avg_records_processed: number;
  avg_api_calls: number;
  avg_duration_seconds: number;
  health_status: string;
  expected_frequency: string;
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
  const [syncJobsHealth, setSyncJobsHealth] = useState<SyncJobHealth[]>([]);
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
        .limit(20);

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

  // Load sync jobs health status
  const loadSyncJobsHealth = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('three_sync_jobs_status')
        .select('*')
        .order('job_type');

      if (error) throw error;
      setSyncJobsHealth(data || []);
      setTestResults(prev => ({ ...prev, sync_health: true }));
    } catch (err) {
      console.error('Failed to load sync jobs health:', err);
      setTestResults(prev => ({ ...prev, sync_health: false }));
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

  // Test individual sync functions
  const testDailySalesSync = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://owtcaztrzujjuwwuldhl.supabase.co/functions/v1/daily-sales-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Daily sales sync test result:', result);
      setTestResults(prev => ({ ...prev, daily_sales_sync: true }));
      // Refresh sync jobs to see the new job
      await loadSyncJobs();
    } catch (err) {
      console.error('Daily sales sync test failed:', err);
      setTestResults(prev => ({ ...prev, daily_sales_sync: false }));
    } finally {
      setLoading(false);
    }
  };

  const testWeeklyCatalogSync = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://owtcaztrzujjuwwuldhl.supabase.co/functions/v1/weekly-catalog-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Weekly catalog sync test result:', result);
      setTestResults(prev => ({ ...prev, weekly_catalog_sync: true }));
      // Refresh sync jobs to see the new job
      await loadSyncJobs();
    } catch (err) {
      console.error('Weekly catalog sync test failed:', err);
      setTestResults(prev => ({ ...prev, weekly_catalog_sync: false }));
    } finally {
      setLoading(false);
    }
  };

  const testPriceHistorySync = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://owtcaztrzujjuwwuldhl.supabase.co/functions/v1/weekly-price-history-sync?batch_size=10&max_api_calls=10', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Price history sync test result:', result);
      setTestResults(prev => ({ ...prev, price_history_sync: true }));
      // Refresh sync jobs to see the new job
      await loadSyncJobs();
    } catch (err) {
      console.error('Price history sync test failed:', err);
      setTestResults(prev => ({ ...prev, price_history_sync: false }));
    } finally {
      setLoading(false);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    await testConnection();
    await loadSyncJobs();
    await loadSyncJobsHealth();
    await loadDbStats();
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
            <TabsTrigger value="sync-health">Sync Health</TabsTrigger>
            <TabsTrigger value="sync-jobs">Sync Jobs</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
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

          <TabsContent value="sync-health" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Three Sync Jobs Health Status
                  </span>
                  <Button variant="outline" size="sm" onClick={loadSyncJobsHealth} disabled={loading}>
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {syncJobsHealth.length > 0 ? (
                  <div className="grid gap-6">
                    {syncJobsHealth.map((healthStatus) => (
                      <div key={healthStatus.job_type} className="border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold">{healthStatus.job_display_name}</h3>
                            <Badge 
                              variant={
                                healthStatus.health_status === 'healthy' ? 'default' : 
                                healthStatus.health_status === 'unhealthy' ? 'destructive' : 
                                'secondary'
                              }
                            >
                              {healthStatus.health_status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            {healthStatus.schedule_display}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{healthStatus.total_runs_7_days}</div>
                            <div className="text-sm text-gray-600">Total Runs (7d)</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{healthStatus.successful_runs}</div>
                            <div className="text-sm text-gray-600">Successful</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{healthStatus.failed_runs}</div>
                            <div className="text-sm text-gray-600">Failed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{healthStatus.success_rate_percent}%</div>
                            <div className="text-sm text-gray-600">Success Rate</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-800">{Math.round(healthStatus.avg_records_processed)}</div>
                            <div className="text-sm text-gray-600">Avg Records</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-800">{healthStatus.avg_duration_seconds}s</div>
                            <div className="text-sm text-gray-600">Avg Duration</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Last Success:</span> {' '}
                            <span className="text-gray-600">
                              {healthStatus.last_successful_run ? 
                                new Date(healthStatus.last_successful_run).toLocaleString() : 
                                'Never'
                              }
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Expected:</span> {' '}
                            <span className="text-gray-600">{healthStatus.expected_frequency}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No sync job health data found. Click refresh to load health status.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync-jobs" className="space-y-6">
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>Records: {job.records_processed || 0}</div>
                          <div>API Calls: {job.api_calls_used || 0}</div>
                          {job.products_added !== undefined && <div>Added: {job.products_added}</div>}
                          {job.products_updated !== undefined && <div>Updated: {job.products_updated}</div>}
                          {job.price_history_entries !== undefined && <div>Price History: {job.price_history_entries}</div>}
                          {job.last_run_duration_ms && <div>Duration: {Math.round(job.last_run_duration_ms / 1000)}s</div>}
                        </div>
                        {job.merchant_ids && (
                          <div className="text-sm text-gray-500 mt-2">
                            Merchants: {job.merchant_ids.join(', ')}
                          </div>
                        )}
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
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Individual Sync Job Tests</h3>
                  
                  <div className="grid gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Daily Sales Sync</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Tests the daily sales sync function (sale items only, fast)
                      </p>
                      <Button onClick={testDailySalesSync} disabled={loading} className="w-full">
                        <Zap className="w-4 h-4 mr-2" />
                        Test Daily Sales Sync
                      </Button>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Weekly Catalog Sync</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Tests the weekly catalog sync function (comprehensive, all products)
                      </p>
                      <Button onClick={testWeeklyCatalogSync} disabled={loading} className="w-full">
                        <Zap className="w-4 h-4 mr-2" />
                        Test Weekly Catalog Sync
                      </Button>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Weekly Price History Sync</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Tests the weekly price history sync function (historical data, limited to 10 products)
                      </p>
                      <Button onClick={testPriceHistorySync} disabled={loading} className="w-full">
                        <Zap className="w-4 h-4 mr-2" />
                        Test Price History Sync
                      </Button>
                    </div>
                  </div>
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