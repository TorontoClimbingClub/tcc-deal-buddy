
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SyncJobHealth {
  job_type: string;
  job_display_name: string;
  schedule_display: string;
  total_runs_7_days: number;
  successful_runs_7_days: number;
  failed_runs_7_days: number;
  last_successful_run: string | null;
  last_failed_run: string | null;
  success_rate_percent: number;
  status: 'healthy' | 'warning' | 'critical';
  next_expected_run?: string;
  avg_duration_minutes?: number;
  total_records_processed_7_days?: number;
  total_api_calls_7_days?: number;
}

interface DatabaseStats {
  products_count: number;
  deals_count: number;
  price_history_count: number;
  sync_jobs_count: number;
  user_profiles_count: number;
}

const Debug: React.FC = () => {
  const [syncJobs, setSyncJobs] = useState<SyncJobHealth[]>([]);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDebugData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch database statistics
      const [
        { count: productsCount },
        { count: dealsCount },
        { count: priceHistoryCount },
        { count: syncJobsCount },
        { count: userProfilesCount }
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('current_deals').select('*', { count: 'exact', head: true }),
        supabase.from('price_history').select('*', { count: 'exact', head: true }),
        supabase.from('sync_jobs').select('*', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true })
      ]);

      setDbStats({
        products_count: productsCount || 0,
        deals_count: dealsCount || 0,
        price_history_count: priceHistoryCount || 0,
        sync_jobs_count: syncJobsCount || 0,
        user_profiles_count: userProfilesCount || 0
      });

      // Fetch recent sync jobs for health monitoring
      const { data: recentJobs, error: jobsError } = await supabase
        .from('sync_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (jobsError) {
        console.error('Error fetching sync jobs:', jobsError);
      } else {
        // Transform sync jobs data into health metrics
        const jobTypes = ['daily-sync', 'price-history-sync', 'comprehensive-sync'];
        const healthMetrics: SyncJobHealth[] = jobTypes.map(jobType => {
          const jobsOfType = recentJobs?.filter(job => job.job_type === jobType) || [];
          const last7Days = jobsOfType.filter(job => 
            new Date(job.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
          );
          
          const successful = last7Days.filter(job => job.status === 'completed');
          const failed = last7Days.filter(job => job.status === 'failed');
          
          const successRate = last7Days.length > 0 ? 
            Math.round((successful.length / last7Days.length) * 100) : 0;
          
          let status: 'healthy' | 'warning' | 'critical' = 'healthy';
          if (successRate < 50) status = 'critical';
          else if (successRate < 80) status = 'warning';
          
          return {
            job_type: jobType,
            job_display_name: jobType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            schedule_display: jobType === 'daily-sync' ? 'Daily' : 
                            jobType === 'price-history-sync' ? 'Weekly' : 'Monthly',
            total_runs_7_days: last7Days.length,
            successful_runs_7_days: successful.length,
            failed_runs_7_days: failed.length,
            last_successful_run: successful[0]?.completed_at || null,
            last_failed_run: failed[0]?.completed_at || null,
            success_rate_percent: successRate,
            status,
            avg_duration_minutes: successful.length > 0 ? 
              Math.round(successful.reduce((sum, job) => {
                if (job.started_at && job.completed_at) {
                  return sum + (new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()) / (1000 * 60);
                }
                return sum;
              }, 0) / successful.length) : undefined,
            total_records_processed_7_days: last7Days.reduce((sum, job) => sum + (job.records_processed || 0), 0),
            total_api_calls_7_days: last7Days.reduce((sum, job) => sum + (job.api_calls_used || 0), 0)
          };
        });
        
        setSyncJobs(healthMetrics);
      }

    } catch (err) {
      console.error('Error fetching debug data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebugData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🔧 Debug Dashboard</h1>
          <p className="text-gray-600">System health monitoring and diagnostics</p>
        </div>
        <Button onClick={fetchDebugData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sync-health">Sync Health</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Database Statistics */}
          {dbStats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Products</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {dbStats.products_count.toLocaleString()}
                      </p>
                    </div>
                    <Database className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Deals</p>
                      <p className="text-2xl font-bold text-green-600">
                        {dbStats.deals_count.toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Price History</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {dbStats.price_history_count.toLocaleString()}
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Sync Jobs</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {dbStats.sync_jobs_count.toLocaleString()}
                      </p>
                    </div>
                    <RefreshCw className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Users</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {dbStats.user_profiles_count.toLocaleString()}
                      </p>
                    </div>
                    <Database className="h-8 w-8 text-indigo-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sync-health" className="space-y-6">
          {/* Sync Job Health */}
          <Card>
            <CardHeader>
              <CardTitle>Sync Job Health (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {syncJobs.map((job) => (
                  <div key={job.job_type} className={`p-4 rounded-lg border ${getStatusColor(job.status)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.status)}
                        <h3 className="font-medium">{job.job_display_name}</h3>
                        <Badge variant="outline">{job.schedule_display}</Badge>
                      </div>
                      <Badge variant={job.status === 'healthy' ? 'default' : 'destructive'}>
                        {job.success_rate_percent}% Success
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Runs</p>
                        <p className="font-medium">{job.total_runs_7_days}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Successful</p>
                        <p className="font-medium text-green-600">{job.successful_runs_7_days}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Failed</p>
                        <p className="font-medium text-red-600">{job.failed_runs_7_days}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Avg Duration</p>
                        <p className="font-medium">{job.avg_duration_minutes || 0}m</p>
                      </div>
                    </div>

                    {job.last_successful_run && (
                      <div className="mt-2 text-xs text-gray-500">
                        Last successful: {new Date(job.last_successful_run).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Database Diagnostics</h3>
                <p className="text-gray-500 mb-4">
                  Detailed database analysis and health checks coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Debug;
