
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SyncJob {
  id: string;
  job_type: string;
  job_subtype?: string;
  status: string;
  records_processed: number;
  api_calls_used: number;
  products_added: number;
  price_history_entries: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
  avg_processing_time_ms?: number;
}

export interface SyncStats {
  totalJobs: number;
  runningJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalProductsAdded: number;
  totalApiCallsUsed: number;
  averageProcessingTime: number;
}

export const useSyncMonitoring = () => {
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [syncStats, setSyncStats] = useState<SyncStats>({
    totalJobs: 0,
    runningJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    totalProductsAdded: 0,
    totalApiCallsUsed: 0,
    averageProcessingTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSyncJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('sync_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        throw fetchError;
      }

      setSyncJobs(data || []);
      calculateSyncStats(data || []);

    } catch (err) {
      console.error('Error fetching sync jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sync jobs');
    } finally {
      setLoading(false);
    }
  };

  const calculateSyncStats = (jobs: SyncJob[]) => {
    const stats: SyncStats = {
      totalJobs: jobs.length,
      runningJobs: jobs.filter(j => j.status === 'running').length,
      completedJobs: jobs.filter(j => j.status === 'completed').length,
      failedJobs: jobs.filter(j => j.status === 'failed').length,
      totalProductsAdded: jobs.reduce((sum, j) => sum + (j.products_added || 0), 0),
      totalApiCallsUsed: jobs.reduce((sum, j) => sum + (j.api_calls_used || 0), 0),
      averageProcessingTime: 0
    };

    const completedJobsWithTime = jobs.filter(j => 
      j.status === 'completed' && j.avg_processing_time_ms
    );

    if (completedJobsWithTime.length > 0) {
      stats.averageProcessingTime = Math.round(
        completedJobsWithTime.reduce((sum, j) => sum + (j.avg_processing_time_ms || 0), 0) / 
        completedJobsWithTime.length
      );
    }

    setSyncStats(stats);
  };

  const triggerSync = async (options: {
    syncType?: string;
    merchantIds?: number[];
    maxProducts?: number;
    includePriceHistory?: boolean;
  } = {}) => {
    try {
      setError(null);

      const { data, error: invokeError } = await supabase.functions.invoke('comprehensive-sync', {
        body: {
          merchantIds: options.merchantIds || [18557],
          testMode: false,
          maxProductsTotal: options.maxProducts || 10000,
          includePriceHistory: options.includePriceHistory || false
        }
      });

      if (invokeError) {
        throw invokeError;
      }

      console.log('Sync triggered successfully:', data);
      
      // Refresh jobs after triggering sync
      setTimeout(() => {
        fetchSyncJobs();
      }, 1000);

      return data;

    } catch (err) {
      console.error('Error triggering sync:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to trigger sync';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const cancelSync = async (jobId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('sync_jobs')
        .update({ 
          status: 'cancelled',
          completed_at: new Date().toISOString(),
          error_message: 'Cancelled by user'
        })
        .eq('id', jobId);

      if (updateError) {
        throw updateError;
      }

      // Refresh jobs after cancelling
      fetchSyncJobs();

    } catch (err) {
      console.error('Error cancelling sync:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel sync');
    }
  };

  useEffect(() => {
    fetchSyncJobs();

    // Set up real-time subscription for sync job updates  
    const subscription = supabase
      .channel('sync-jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sync_jobs'
        },
        () => {
          fetchSyncJobs();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    syncJobs,
    syncStats,
    loading,
    error,
    fetchSyncJobs,
    triggerSync,
    cancelSync
  };
};
