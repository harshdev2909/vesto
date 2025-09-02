"use client"

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'

interface RebalancingOpportunity {
  assetAddress: string
  assetSymbol: string
  assetName: string
  currentAPY: number
  bestAPY: number
  improvement: number
  bestProtocol: string
  bestProtocolName: string
  currentProtocol: string
  currentProtocolName: string
  isOpportunity: boolean
  minDeltaBps: number
  protocolCount?: number
}

interface RebalancingData {
  opportunities: RebalancingOpportunity[]
  minDeltaBps: number
  totalAssets: number
  opportunitiesCount: number
  isMockData?: boolean
  isDynamic?: boolean
  dataSource?: string
  error?: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useRebalancing() {
  const { data, error, isLoading, mutate } = useSWR<RebalancingData>(
    '/api/rebalancing/real-opportunities',
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  )

  const [isExecuting, setIsExecuting] = useState(false)
  const [lastExecution, setLastExecution] = useState<{
    txHash: string
    timestamp: number
  } | null>(null)

  const executeRebalancing = useCallback(async (assetAddress: string, userAddress: string, privateKey: string) => {
    setIsExecuting(true)
    try {
      const response = await fetch('/api/rebalancing/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetAddress,
          userAddress,
          privateKey
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to execute rebalancing')
      }

      setLastExecution({
        txHash: result.transactionHash,
        timestamp: Date.now()
      })

      // Refresh the opportunities data
      mutate()

      return result
    } catch (error) {
      console.error('Error executing rebalancing:', error)
      throw error
    } finally {
      setIsExecuting(false)
    }
  }, [mutate])

  const recordRebalancingSuccess = useCallback(async (assetAddress: string, fromProtocol: string, toProtocol: string, transactionHash?: string) => {
    try {
      const response = await fetch('/api/rebalancing/success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetAddress,
          fromProtocol,
          toProtocol,
          transactionHash
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to record rebalancing success')
      }

      // Refresh the opportunities data to show updated APY values
      mutate()

      return result
    } catch (error) {
      console.error('Error recording rebalancing success:', error)
      throw error
    }
  }, [mutate])

  const refreshOpportunities = useCallback(() => {
    mutate()
  }, [mutate])

  return {
    opportunities: data?.opportunities || [],
    minDeltaBps: data?.minDeltaBps || 0,
    totalAssets: data?.totalAssets || 0,
    opportunitiesCount: data?.opportunitiesCount || 0,
    isLoading,
    error,
    isExecuting,
    lastExecution,
    executeRebalancing,
    recordRebalancingSuccess,
    refreshOpportunities,
    isMockData: data?.isMockData || false,
    isDynamic: data?.isDynamic || false,
    dataSource: data?.dataSource || 'unknown'
  }
}
