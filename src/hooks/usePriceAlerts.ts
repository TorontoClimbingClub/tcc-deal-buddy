
import { useState, useEffect } from 'react'
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Mock implementation until price_alerts table is created
  const fetchAlerts = async () => {
    try {
      setLoading(true)
      setError(null)
      // For now, return empty array since price_alerts table doesn't exist
      setAlerts([])
    } catch (err) {
      console.error('Error fetching price alerts:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch price alerts')
    } finally {
      setLoading(false)
    }
  }

  // Create a new price alert (mock implementation)
  const createAlert = async (alertData: CreatePriceAlertData): Promise<boolean> => {
    try {
      console.log('Would create price alert:', alertData)
      
      toast({
        title: "Feature Coming Soon",
        description: "Price alerts will be available once the database setup is complete.",
      })

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

  // Update an existing price alert (mock implementation)
  const updateAlert = async (
    alertId: string, 
    updates: Partial<Pick<PriceAlert, 'target_price' | 'target_discount_percent' | 'is_active' | 'notification_methods'>>
  ): Promise<boolean> => {
    try {
      console.log('Would update price alert:', alertId, updates)
      
      toast({
        title: "Feature Coming Soon",
        description: "Price alert updates will be available once the database setup is complete.",
      })

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

  // Delete a price alert (mock implementation)
  const deleteAlert = async (alertId: string): Promise<boolean> => {
    try {
      console.log('Would delete price alert:', alertId)
      
      toast({
        title: "Feature Coming Soon",
        description: "Price alert deletion will be available once the database setup is complete.",
      })

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
    }

    return createAlert(alertData)
  }

  // Load alerts when hook is first used
  useEffect(() => {
    fetchAlerts()
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
