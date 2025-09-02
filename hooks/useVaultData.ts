"use client"

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { useAccount } from 'wagmi'

interface VaultData {
  userAddress: string
  currentVault: {
    protocol: string
    protocolName: string
    apy: number
    apyPercentage: number
  }
  userPosition: {
    shares: string
    assetAmount: string
    formattedAmount: string
    percentage: number
  }
  totalVaultData: {
    totalDeposited: string
    formattedTotalDeposited: string
    protocolShares: string
    lastRebalance: string
  }
  allProtocols: Array<{
    protocol: string
    protocolName: string
    apy: number
    apyPercentage: number
    totalValueLocked: string
  }>
}

interface VaultDataResponse {
  success: boolean
  data?: VaultData
  error?: string
  details?: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useVaultData() {
  const { address } = useAccount()
  
  const { data, error, isLoading, mutate } = useSWR<VaultDataResponse>(
    address ? `/api/user/vault-data?address=${address}` : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  )

  const refreshVaultData = useCallback(() => {
    mutate()
  }, [mutate])

  return {
    vaultData: data?.data,
    isLoading,
    error: data?.error || error,
    refreshVaultData,
    isConnected: !!address
  }
}
