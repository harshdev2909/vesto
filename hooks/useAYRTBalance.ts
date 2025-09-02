import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

export function useAYRTBalance() {
  const { address, isConnected } = useAccount()
  const [balance, setBalance] = useState<string>('0')
  const [balanceWei, setBalanceWei] = useState<string>('0')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = async () => {
    if (!address || !isConnected) {
      setBalance('0')
      setBalanceWei('0')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/ayrt-balance?user=${address}`)
      const data = await response.json()

      if (data.success) {
        setBalance(data.data.balance)
        setBalanceWei(data.data.balanceWei)
      } else {
        setError(data.error || 'Failed to fetch balance')
        setBalance('0')
        setBalanceWei('0')
      }
    } catch (err) {
      console.error('Error fetching aYRT balance:', err)
      setError('Failed to fetch balance')
      setBalance('0')
      setBalanceWei('0')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [address, isConnected])

  // Listen for refresh events (e.g., after deposits)
  useEffect(() => {
    const handleRefresh = () => {
      fetchBalance()
    }

    window.addEventListener('refreshDashboard', handleRefresh)
    return () => window.removeEventListener('refreshDashboard', handleRefresh)
  }, [])

  return {
    balance,
    balanceWei,
    isLoading,
    error,
    refetch: fetchBalance
  }
}
