"use client"

import { useAssets, useAllAPYData } from "./useBackendData"
import { useMemo } from "react"

export function usePortfolio() {
  const { assets } = useAssets()
  const { apyMap, isLoading } = useAllAPYData()

  const portfolio = useMemo(() => {
    if (!assets?.assets || !apyMap) {
      return {
        totalDepositedUsd: 0,
        receiptTokens: 0,
        currentApy: 0,
        totalValueLocked: 0,
        assetCount: 0
      }
    }

    let totalValueLocked = 0
    let totalAPY = 0
    let assetCount = 0

    // Calculate portfolio metrics from APY data
    apyMap.forEach((data, assetAddress) => {
      if (data.bestAPY) {
        totalValueLocked += data.bestAPY.totalValueLocked || 0
        totalAPY += data.bestAPY.apy || 0
        assetCount++
      }
    })

    const averageAPY = assetCount > 0 ? totalAPY / assetCount : 0
    
    // For demo purposes, show some realistic portfolio data
    // In production, this would come from user's actual positions
    const mockUserDeposit = 50000 // $50k user deposit
    const mockReceiptTokens = mockUserDeposit * 0.001 // Simplified calculation

    return {
      totalDepositedUsd: mockUserDeposit,
      receiptTokens: mockReceiptTokens,
      currentApy: averageAPY,
      totalValueLocked,
      assetCount,
      averageAPY
    }
  }, [assets, apyMap])

  return {
    portfolio,
    isLoading
  }
}
