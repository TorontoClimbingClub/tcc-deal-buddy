import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from './use-toast'

export interface PriceAlert {
  id: string
  user_id: string
  product_sku: string
  merchant_id: number
  alert_type: 'price_drop' | 'back_in_stock' | 'sale_starts' | 'sale_ends' | 'target_price'
  target_price?: number
  target_discount_percent?: number
  is_active: boolean
  last_triggered_at?: string
  trigger_count: number
  notification_methods: string[]
  created_at: string
  updated_at: string
}

export interface CreatePriceAlertData {
  product_sku: string
  merchant_id: number
  alert_type: PriceAlert['alert_type']
  target_price?: number
  target_discount_percent?: number
  notification_methods?: string[]
}

export interface PriceAlertWithProduct extends PriceAlert {
  product_name?: string
  merchant_name?: string
  current_price?: number
  image_url?: string
}

export const usePriceAlerts = () => {
  const [alerts, setAlerts] = useState<PriceAlertWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch user's price alerts with product information
  const fetchAlerts = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setAlerts([])
        return
      }

      // Get alerts with product information
      const { data: alertsData, error: alertsError } = await supabase
        .from('price_alerts')
        .select(`
          *,
          products!inner(
            name,
            merchant_name,
            sale_price,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (alertsError) {
        throw alertsError
      }

      // Transform the data to flatten product information
      const transformedAlerts: PriceAlertWithProduct[] = (alertsData || []).map(alert => ({
        ...alert,
        product_name: alert.products?.name,
        merchant_name: alert.products?.merchant_name,
        current_price: alert.products?.sale_price,
        image_url: alert.products?.image_url
      }))

      setAlerts(transformedAlerts)
    } catch (err) {
      console.error('Error fetching price alerts:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch price alerts')
    } finally {
      setLoading(false)
    }
  }

  // Create a new price alert
  const createAlert = async (alertData: CreatePriceAlertData): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('price_alerts')
        .insert({
          ...alertData,
          user_id: user.id,
          notification_methods: alertData.notification_methods || ['email']
        })

      if (error) {
        throw error
      }

      toast({
        title: "Price Alert Created",
        description: "You'll be notified when your price conditions are met.",
      })

      // Refresh alerts list
      await fetchAlerts()
      return true
    } catch (err) {
      console.error('Error creating price alert:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create price alert'
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      
      return false
    }
  }

  // Update an existing price alert
  const updateAlert = async (
    alertId: string, 
    updates: Partial<Pick<PriceAlert, 'target_price' | 'target_discount_percent' | 'is_active' | 'notification_methods'>>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('price_alerts')
        .update(updates)
        .eq('id', alertId)

      if (error) {
        throw error
      }

      toast({
        title: "Alert Updated",
        description: "Your price alert has been updated.",
      })

      // Refresh alerts list
      await fetchAlerts()
      return true
    } catch (err) {
      console.error('Error updating price alert:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update price alert'
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      
      return false
    }
  }

  // Delete a price alert
  const deleteAlert = async (alertId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', alertId)

      if (error) {
        throw error
      }

      toast({
        title: "Alert Deleted",
        description: "Your price alert has been removed.",
      })

      // Refresh alerts list
      await fetchAlerts()
      return true
    } catch (err) {
      console.error('Error deleting price alert:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete price alert'
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      
      return false
    }
  }

  // Toggle alert active status
  const toggleAlert = async (alertId: string, isActive: boolean): Promise<boolean> => {
    return updateAlert(alertId, { is_active: isActive })
  }

  // Get alert statistics
  const getAlertStats = () => {
    const totalAlerts = alerts.length
    const activeAlerts = alerts.filter(alert => alert.is_active).length
    const recentTriggers = alerts.filter(alert => 
      alert.last_triggered_at && 
      new Date(alert.last_triggered_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length

    return {
      totalAlerts,
      activeAlerts,
      inactiveAlerts: totalAlerts - activeAlerts,
      recentTriggers
    }
  }

  // Helper function to create quick alerts for common scenarios
  const createQuickAlert = async (
    productSku: string,
    merchantId: number,
    alertType: 'price_drop' | 'target_price',
    value?: number
  ): Promise<boolean> => {
    const alertData: CreatePriceAlertData = {
      product_sku: productSku,
      merchant_id: merchantId,
      alert_type: alertType
    }

    if (alertType === 'target_price' && value) {
      alertData.target_price = value
    } else if (alertType === 'price_drop') {
      // For price drop alerts, we don't need a specific value
      // The system will trigger on any price decrease
    }

    return createAlert(alertData)
  }

  // Load alerts when hook is first used
  useEffect(() => {
    fetchAlerts()
  }, [])

  // Set up real-time subscription for alerts
  useEffect(() => {
    const setupSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return

        const subscription = supabase
          .channel('price_alerts_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'price_alerts',
              filter: `user_id=eq.${user.id}`
            },
            () => {
              // Refresh alerts when changes occur
              fetchAlerts()
            }
          )
          .subscribe()

        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('Error setting up price alerts subscription:', error)
      }
    }

    setupSubscription()
  }, [])

  return {
    alerts,
    loading,
    error,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleAlert,
    createQuickAlert,
    getAlertStats,
    refetch: fetchAlerts
  }
}