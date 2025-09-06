import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

interface EmailPreferences {
  email: string | null
  emailNotifications: boolean
}

export function useEmailPreferences() {
  const { address } = useAccount()
  const [preferences, setPreferences] = useState<EmailPreferences>({
    email: null,
    emailNotifications: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch email preferences
  const fetchPreferences = async () => {
    if (!address) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/user/email?address=${address}`)
      const data = await response.json()

      if (data.success) {
        setPreferences(data.data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch email preferences')
    } finally {
      setIsLoading(false)
    }
  }

  // Update email preferences
  const updatePreferences = async (email: string, emailNotifications: boolean = true) => {
    if (!address) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          email,
          emailNotifications
        })
      })

      const data = await response.json()

      if (data.success) {
        setPreferences({ email, emailNotifications })
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to update email preferences')
    } finally {
      setIsLoading(false)
    }
  }

  // Send email notification
  const sendEmailNotification = async (type: 'deposit' | 'withdraw' | 'rebalance', data: any) => {
    console.log('📧 Attempting to send email notification:', { type, data, email: preferences.email, notifications: preferences.emailNotifications })
    
    if (!preferences.email || !preferences.emailNotifications) {
      console.log('📧 Email notification skipped - no email or notifications disabled')
      return
    }

    try {
      console.log('📧 Sending email to:', preferences.email)
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          to: preferences.email,
          data
        })
      })

      const result = await response.json()
      if (result.success) {
        console.log('📧 Email sent successfully:', result.messageId)
      } else {
        console.error('📧 Failed to send email:', result.error)
      }
    } catch (err) {
      console.error('📧 Error sending email notification:', err)
    }
  }

  useEffect(() => {
    fetchPreferences()
  }, [address])

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
    sendEmailNotification,
    refetch: fetchPreferences
  }
}
