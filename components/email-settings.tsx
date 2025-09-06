"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mail, Bell, CheckCircle, AlertCircle } from 'lucide-react'
import { useEmailPreferences } from '@/hooks/useEmailPreferences'
import { toast } from 'sonner'

export function EmailSettings() {
  const { preferences, isLoading, error, updatePreferences } = useEmailPreferences()
  const [email, setEmail] = useState(preferences.email || '')
  const [emailNotifications, setEmailNotifications] = useState(preferences.emailNotifications)
  const [isSaving, setIsSaving] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [testType, setTestType] = useState<'deposit' | 'withdraw' | 'rebalance'>('deposit')

  const handleSave = async () => {
    if (!email) {
      toast.error('❌ Please enter a valid email address')
      return
    }

    setIsSaving(true)
    try {
      await updatePreferences(email, emailNotifications)
      toast.success('✅ Email preferences updated successfully!')
    } catch (err) {
      toast.error('❌ Failed to update email preferences')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestEmail = async () => {
    if (!email) {
      toast.error('❌ Please enter a valid email address first')
      return
    }

    setIsSendingTest(true)
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          type: testType
        })
      })

      const result = await response.json()
      if (result.success) {
        toast.success(`📧 ${testType.charAt(0).toUpperCase() + testType.slice(1)} test email sent successfully! Check your inbox.`)
      } else {
        toast.error('❌ Failed to send test email: ' + (result.error || 'Unknown error'))
      }
    } catch (err) {
      toast.error('❌ Error sending test email: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setIsSendingTest(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Notifications
        </CardTitle>
        <CardDescription>
          Configure email notifications for your transactions and account activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-600">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="max-w-md"
            />
            <p className="text-xs text-muted-foreground">
              We'll send transaction confirmations and important updates to this address
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Email Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive emails for deposits, withdrawals, and rebalances
              </p>
            </div>
            <Switch
              id="notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !email}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </Button>

            {email && (
              <Button 
                variant="outline" 
                onClick={handleTestEmail}
                disabled={isSendingTest}
                className="flex items-center gap-2"
              >
                {isSendingTest ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {isSendingTest ? 'Sending...' : 'Send Test Email'}
              </Button>
            )}
          </div>

          {email && (
            <div className="space-y-2">
              <Label htmlFor="test-type">Test Email Type</Label>
              <Select value={testType} onValueChange={(value: 'deposit' | 'withdraw' | 'rebalance') => setTestType(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select email type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">💰 Deposit Email</SelectItem>
                  <SelectItem value="withdraw">💸 Withdrawal Email</SelectItem>
                  <SelectItem value="rebalance">🔄 Rebalance Email</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose which type of transaction email to test
              </p>
            </div>
          )}
        </div>

        {preferences.email && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600">
              Email notifications are configured for {preferences.email}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
