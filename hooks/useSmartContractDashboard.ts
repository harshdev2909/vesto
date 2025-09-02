"use client"

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { useAccount } from 'wagmi'
import { useVaultData } from './useVaultData'

interface SmartContractDashboardData {
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
    formattedProtocolShares: string
    lastRebalance: string
    lastRebalanceDate: string
  }
  allProtocols: Array<{
    protocol: string
    protocolName: string
    apy: number
    apyPercentage: number
    totalValueLocked: string
  }>
  // Additional dashboard data
  totalDeposits: string
  formattedTotalDeposits: string
  currentAPY: number
  currentAPYPercentage: number
  capitalDeployment: {
    asset: string
    amount: string
    protocol: string
    protocolName: string
  }
  lastRebalanceDate: string
  aYRTBalance: string
  formattedAYRTBalance: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useSmartContractDashboard() {
  const { address } = useAccount()
  const { vaultData, isLoading: vaultLoading, error: vaultError, refreshVaultData } = useVaultData()
  
  const [dashboardData, setDashboardData] = useState<SmartContractDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshDashboard = useCallback(() => {
    refreshVaultData()
  }, [refreshVaultData])

  useEffect(() => {
    if (!address) {
      setDashboardData(null)
      setIsLoading(false)
      setError(null)
      return
    }

    if (vaultLoading) {
      setIsLoading(true)
      return
    }

    if (vaultError || !vaultData) {
      setError(vaultError || 'Failed to load vault data')
      setIsLoading(false)
      return
    }

    // Transform vault data into dashboard data
    const transformedData: SmartContractDashboardData = {
      userAddress: vaultData.userAddress,
      currentVault: vaultData.currentVault,
      userPosition: vaultData.userPosition,
      totalVaultData: vaultData.totalVaultData,
      allProtocols: vaultData.allProtocols,
      
      // Dashboard-specific data derived from vault data
      totalDeposits: vaultData.totalVaultData.totalDeposited,
      formattedTotalDeposits: vaultData.totalVaultData.formattedTotalDeposited,
      currentAPY: vaultData.currentVault.apy,
      currentAPYPercentage: vaultData.currentVault.apyPercentage,
      
      // Capital deployment data
      capitalDeployment: {
        asset: 'mUSDC',
        amount: vaultData.userPosition.formattedAmount,
        protocol: vaultData.currentVault.protocol,
        protocolName: vaultData.currentVault.protocolName
      },
      
      // Last rebalance date
      lastRebalanceDate: vaultData.totalVaultData.lastRebalanceDate,
      
      // aYRT balance (derived from user shares)
      aYRTBalance: vaultData.userPosition.shares,
      formattedAYRTBalance: vaultData.userPosition.formattedAmount
    }

    setDashboardData(transformedData)
    setIsLoading(false)
    setError(null)
  }, [address, vaultData, vaultLoading, vaultError])

  return {
    dashboardData,
    isLoading,
    error,
    refreshDashboard,
    isConnected: !!address
  }
}
