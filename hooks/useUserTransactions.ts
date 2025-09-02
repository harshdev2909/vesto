import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

export function useUserTransactions(type?: 'deposit' | 'withdraw' | 'rebalance', limit: number = 20) {
  const { address, isConnected } = useAccount()
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async () => {
    if (!address || !isConnected) {
      setTransactions([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        user: address,
        limit: limit.toString()
      })
      
      if (type) {
        params.append('type', type)
      }

      const response = await fetch(`/api/user-transactions?${params}`)
      const data = await response.json()

      if (data.success) {
        setTransactions(data.data)
      } else {
        setError(data.error || 'Failed to fetch transactions')
        setTransactions([])
      }
    } catch (err) {
      console.error('Error fetching user transactions:', err)
      setError('Failed to fetch transactions')
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [address, isConnected, type, limit])

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchTransactions
  }
}
