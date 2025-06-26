import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Bell, TrendingDown, Target, ShoppingCart } from 'lucide-react'
import { usePriceAlerts, CreatePriceAlertData } from '@/hooks/usePriceAlerts'

interface PriceAlertModalProps {
  productSku: string
  merchantId: number
  productName: string
  currentPrice?: number
  children: React.ReactNode
}

const alertTypeOptions = [
  {
    value: 'price_drop' as const,
    label: 'Any Price Drop',
    description: 'Alert me when the price decreases',
    icon: TrendingDown
  },
  {
    value: 'target_price' as const,
    label: 'Target Price',
    description: 'Alert me when price reaches a specific amount',
    icon: Target
  },
  {
    value: 'sale_starts' as const,
    label: 'Sale Starts',
    description: 'Alert me when this item goes on sale',
    icon: ShoppingCart
  }
]

const notificationOptions = [
  { value: 'email', label: 'Email' },
  { value: 'push', label: 'Push Notification' },
  { value: 'sms', label: 'SMS (Coming Soon)', disabled: true }
]

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  productSku,
  merchantId,
  productName,
  currentPrice,
  children
}) => {
  const { createAlert } = usePriceAlerts()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<{
    alertType: CreatePriceAlertData['alert_type']
    targetPrice: string
    targetDiscount: string
    notificationMethods: string[]
  }>({
    alertType: 'price_drop',
    targetPrice: '',
    targetDiscount: '',
    notificationMethods: ['email']
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const alertData: CreatePriceAlertData = {
        product_sku: productSku,
        merchant_id: merchantId,
        alert_type: formData.alertType,
        notification_methods: formData.notificationMethods
      }

      // Add target price if specified
      if (formData.alertType === 'target_price' && formData.targetPrice) {
        alertData.target_price = parseFloat(formData.targetPrice)
      }

      // Add target discount if specified
      if (formData.targetDiscount) {
        alertData.target_discount_percent = parseInt(formData.targetDiscount)
      }

      const success = await createAlert(alertData)
      if (success) {
        setOpen(false)
        // Reset form
        setFormData({
          alertType: 'price_drop',
          targetPrice: '',
          targetDiscount: '',
          notificationMethods: ['email']
        })
      }
    } catch (error) {
      console.error('Error creating alert:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationMethodChange = (method: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        notificationMethods: [...prev.notificationMethods, method]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        notificationMethods: prev.notificationMethods.filter(m => m !== method)
      }))
    }
  }

  // Suggest a reasonable target price based on current price
  const suggestedTargetPrice = currentPrice ? (currentPrice * 0.8).toFixed(2) : ''

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Create Price Alert
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-sm text-gray-900 mb-1">Product</h4>
            <p className="text-sm text-gray-600 line-clamp-2">{productName}</p>
            {currentPrice && (
              <p className="text-sm text-gray-500 mt-1">Current Price: ${currentPrice.toFixed(2)}</p>
            )}
          </div>

          {/* Alert Type */}
          <div className="space-y-3">
            <Label htmlFor="alertType">Alert Type</Label>
            <Select value={formData.alertType} onValueChange={(value: CreatePriceAlertData['alert_type']) => 
              setFormData(prev => ({ ...prev, alertType: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select alert type" />
              </SelectTrigger>
              <SelectContent>
                {alertTypeOptions.map(option => {
                  const Icon = option.icon
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Target Price (only show for target_price alert type) */}
          {formData.alertType === 'target_price' && (
            <div className="space-y-2">
              <Label htmlFor="targetPrice">Target Price ($)</Label>
              <Input
                id="targetPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder={suggestedTargetPrice ? `e.g., ${suggestedTargetPrice}` : 'Enter target price'}
                value={formData.targetPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, targetPrice: e.target.value }))}
              />
              {suggestedTargetPrice && (
                <p className="text-xs text-gray-500">
                  Suggested: ${suggestedTargetPrice} (20% below current price)
                </p>
              )}
            </div>
          )}

          {/* Target Discount (optional for all types) */}
          <div className="space-y-2">
            <Label htmlFor="targetDiscount">Minimum Discount (% off)</Label>
            <Input
              id="targetDiscount"
              type="number"
              min="1"
              max="99"
              placeholder="e.g., 25"
              value={formData.targetDiscount}
              onChange={(e) => setFormData(prev => ({ ...prev, targetDiscount: e.target.value }))}
            />
            <p className="text-xs text-gray-500">
              Optional: Only alert if discount is at least this percentage
            </p>
          </div>

          {/* Notification Methods */}
          <div className="space-y-3">
            <Label>Notification Methods</Label>
            <div className="space-y-2">
              {notificationOptions.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={formData.notificationMethods.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handleNotificationMethodChange(option.value, checked as boolean)
                    }
                    disabled={option.disabled}
                  />
                  <Label 
                    htmlFor={option.value} 
                    className={`text-sm ${option.disabled ? 'text-gray-400' : ''}`}
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || formData.notificationMethods.length === 0}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create Alert'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}