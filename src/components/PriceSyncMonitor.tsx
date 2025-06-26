
import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { RefreshCw, Play, Pause } from 'lucide-react';
import { useToast } from './ui/use-toast';

interface SyncProgress {
  total_skus: number;
  completed: number;
  no_data: number;
  failed: number;
  pending: number;
  processing: number;
  completion_percentage: number;
  last_activity: string;
  total_api_calls_made: number;
}

interface ActivityStatus {
  status: string;
  count: number;
  oldest_attempt: string;
  newest_attempt: string;
  avg_api_calls: number;
}

export function PriceSyncMonitor() {
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [activity, setActivity] = useState<ActivityStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const fetchProgress = async () => {
    try {
      const { data: progressData, error: progressError } = await supabase
        .from('price_sync_progress')
        .select('*')
        .single();

      if (progressError) throw progressError;
      setProgress(progressData);

      const { data: activityData, error: activityError } = await supabase
        .from('sync_activity_status')
        .select('*');

      if (activityError) throw activityError;
      setActivity(activityData || []);

    } catch (error: any) {
      console.error('Error fetching progress:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sync progress",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeTracking = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('populate_sku_tracking');
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Added ${data?.[0]?.inserted_count || 0} SKUs to tracking system`,
      });
      
      await fetchProgress();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to initialize tracking system",
        variant: "destructive",
      });
    }
  };

  const startSync = async () => {
    try {
      setSyncing(true);
      const { data, error } = await supabase.functions.invoke('comprehensive-price-backfill', {
        body: {
          batch_size: 10,
          resume: true
        }
      });

      if (error) throw error;

      toast({
        title: "Sync Completed",
        description: `Processed ${data.processed_products} products, created ${data.price_history_entries} price records`,
      });

      await fetchProgress();
    } catch (error: any) {
      toast({
        title: "Sync Error",
        description: error.message || "Failed to start sync",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const cleanupStuck = async () => {
    try {
      const { data, error } = await supabase.rpc('cleanup_stuck_processing');
      if (error) throw error;
      
      toast({
        title: "Cleanup Complete",
        description: `Reset ${data?.[0]?.cleaned_count || 0} stuck processing records`,
      });
      
      await fetchProgress();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to cleanup stuck records",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProgress();
    const interval = setInterval(fetchProgress, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && !progress) {
    return <div className="p-4">Loading sync progress...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Price Sync Monitor</h2>
        <div className="flex gap-2">
          <Button 
            onClick={fetchProgress} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={initializeTracking} 
            variant="outline" 
            size="sm"
          >
            Initialize Tracking
          </Button>
          <Button 
            onClick={cleanupStuck} 
            variant="outline" 
            size="sm"
          >
            Cleanup Stuck
          </Button>
          <Button 
            onClick={startSync} 
            disabled={syncing}
            size="sm"
          >
            {syncing ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Syncing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Sync
              </>
            )}
          </Button>
        </div>
      </div>

      {progress && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progress.completion_percentage}%</div>
              <Progress value={progress.completion_percentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {progress.completed + progress.no_data} of {progress.total_skus} SKUs processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{progress.completed}</div>
              <p className="text-xs text-muted-foreground">Successfully synced</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{progress.pending}</div>
              <p className="text-xs text-muted-foreground">Waiting to process</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progress.total_api_calls_made}</div>
              <p className="text-xs text-muted-foreground">Total API calls made</p>
            </CardContent>
          </Card>
        </div>
      )}

      {activity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activity.map((item) => (
                <div key={item.status} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${
                      item.status === 'completed' ? 'bg-green-500' :
                      item.status === 'processing' ? 'bg-yellow-500' :
                      item.status === 'failed' ? 'bg-red-500' :
                      item.status === 'pending' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`} />
                    <span className="font-medium capitalize">{item.status}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{item.count}</div>
                    <div className="text-xs text-muted-foreground">
                      Avg {item.avg_api_calls?.toFixed(1)} calls
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {progress?.last_activity && (
        <Card>
          <CardHeader>
            <CardTitle>Last Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {new Date(progress.last_activity).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
