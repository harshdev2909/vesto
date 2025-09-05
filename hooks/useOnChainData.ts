"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { readContract } from '@wagmi/core'
import { formatUnits, parseUnits } from 'viem'
import { config } from '@/lib/wagmi'
import { 
  yieldRouter, 
  yieldAggregator, 
  receiptToken, 
  createERC20Contract,
  addresses,
  YIELD_ROUTER_ABI,
  YIELD_AGGREGATOR_ABI,
  RECEIPT_TOKEN_ABI,
  ERC20_ABI
} from '@/lib/contracts'
import { Notification, HistoryEntry } from '@/lib/types'
import { useAppStore } from '@/store/use-app-store'

// Query keys for React Query
export const queryKeys = {
  supportedAssets: ['supportedAssets'] as const,
  userAssetShares: (user: string, asset: string) => ['userAssetShares', user, asset] as const,
  receiptBalance: (user: string) => ['receiptBalance', user] as const,
  bestYield: (asset: string) => ['bestYield', asset] as const,
  assetYield: (protocol: string, asset: string) => ['assetYield', protocol, asset] as const,
  compareYields: (asset: string) => ['compareYields', asset] as const,
  nextRebalanceCandidate: ['nextRebalanceCandidate'] as const,
  tokenBalance: (user: string, token: string) => ['tokenBalance', user, token] as const,
  tokenAllowance: (user: string, token: string, spender: string) => ['tokenAllowance', user, token, spender] as const,
  history: (wallet: string) => ['history', wallet] as const,
  notifications: (wallet: string) => ['notifications', wallet] as const,
}

// Hook to fetch supported assets
export function useSupportedAssets() {
  return useQuery({
    queryKey: queryKeys.supportedAssets,
    queryFn: async () => {
      const assets = await yieldRouter.read.getSupportedAssets()
      return assets
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

// Hook to fetch user's asset shares
export function useUserAssetShares(userAddress: string, assetAddress: string) {
  return useQuery({
    queryKey: queryKeys.userAssetShares(userAddress, assetAddress),
    queryFn: async () => {
      const shares = await yieldRouter.read.getUserAssetShares([userAddress as `0x${string}`, assetAddress as `0x${string}`])
      return shares
    },
    enabled: !!userAddress && !!assetAddress,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

// Hook to fetch receipt token balance
export function useReceiptBalance(userAddress: string) {
  return useQuery({
    queryKey: queryKeys.receiptBalance(userAddress),
    queryFn: async () => {
      const balance = await receiptToken.read.balanceOf([userAddress as `0x${string}`])
      const decimals = await receiptToken.read.decimals()
      return {
        balance,
        formatted: formatUnits(balance, decimals)
      }
    },
    enabled: !!userAddress,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

// Hook to fetch best yield for an asset
export function useBestYield(assetAddress: string) {
  return useQuery({
    queryKey: queryKeys.bestYield(assetAddress),
    queryFn: async () => {
      const [protocol, apy, protocolName] = await yieldAggregator.read.getBestYield([assetAddress as `0x${string}`])
      return {
        protocol,
        apy,
        protocolName,
        apyFormatted: (Number(apy) / 1e15).toFixed(4) // APY is stored with 1e15 multiplier (4500000000000000 = 4.5%)
      }
    },
    enabled: !!assetAddress,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}

// Hook to fetch asset yield for a specific protocol
export function useAssetYield(protocolAddress: string, assetAddress: string) {
  return useQuery({
    queryKey: queryKeys.assetYield(protocolAddress, assetAddress),
    queryFn: async () => {
      const yieldData = await yieldAggregator.read.getAssetYield([protocolAddress as `0x${string}`, assetAddress as `0x${string}`])
      return {
        ...yieldData,
        apyFormatted: (Number(yieldData.apy) / 1e15).toFixed(4),
        tvlFormatted: formatUnits(yieldData.totalValueLocked, 18)
      }
    },
    enabled: !!protocolAddress && !!assetAddress,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}

// Hook to compare yields across all protocols
export function useCompareYields(assetAddress: string) {
  return useQuery({
    queryKey: queryKeys.compareYields(assetAddress),
    queryFn: async () => {
      const comparisons = await yieldAggregator.read.compareYields([assetAddress as `0x${string}`])
      return comparisons.map(comp => ({
        ...comp,
        apyFormatted: (Number(comp.apy) / 1e15).toFixed(4),
        tvlFormatted: formatUnits(comp.totalValueLocked, 18)
      }))
    },
    enabled: !!assetAddress,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}

// Hook to fetch next rebalance candidate
export function useNextRebalanceCandidate() {
  return useQuery({
    queryKey: queryKeys.nextRebalanceCandidate,
    queryFn: async () => {
      const [asset, timeUntilUpkeep, currentAPY, bestAPY, improvement] = 
        await yieldRouter.read.getNextRebalanceCandidate()
      return {
        asset,
        timeUntilUpkeep,
        currentAPY,
        bestAPY,
        improvement,
        currentAPYFormatted: (Number(currentAPY) / 1e12).toFixed(4),
        bestAPYFormatted: (Number(bestAPY) / 1e12).toFixed(4),
        improvementBps: Number(improvement) / 100 // Convert to basis points
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

// Hook to fetch token balance
export function useTokenBalance(userAddress: string, tokenAddress: string) {
  return useQuery({
    queryKey: queryKeys.tokenBalance(userAddress, tokenAddress),
    queryFn: async () => {
      const tokenContract = createERC20Contract(tokenAddress as `0x${string}`)
      const [balance, decimals] = await Promise.all([
        tokenContract.read.balanceOf([userAddress as `0x${string}`]),
        tokenContract.read.decimals()
      ])
      return {
        balance,
        formatted: formatUnits(balance, decimals)
      }
    },
    enabled: !!userAddress && !!tokenAddress,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

// Hook to fetch token allowance
export function useTokenAllowance(userAddress: string, tokenAddress: string, spenderAddress: string) {
  return useQuery({
    queryKey: queryKeys.tokenAllowance(userAddress, tokenAddress, spenderAddress),
    queryFn: async () => {
      const tokenContract = createERC20Contract(tokenAddress as `0x${string}`)
      const [allowance, decimals] = await Promise.all([
        tokenContract.read.allowance([userAddress as `0x${string}`, spenderAddress as `0x${string}`]),
        tokenContract.read.decimals()
      ])
      return {
        allowance,
        formatted: formatUnits(allowance, decimals)
      }
    },
    enabled: !!userAddress && !!tokenAddress && !!spenderAddress,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

// Hook to fetch transaction history
export function useTransactionHistory(walletAddress: string) {
  return useQuery({
    queryKey: queryKeys.history(walletAddress),
    queryFn: async () => {
      const response = await fetch(`/api/history?wallet=${walletAddress}`)
      if (!response.ok) {
        throw new Error('Failed to fetch transaction history')
      }
      const data = await response.json()
      return data.data || []
    },
    enabled: !!walletAddress,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  })
}

// Hook to fetch notifications
export function useNotifications(walletAddress: string) {
  return useQuery({
    queryKey: queryKeys.notifications(walletAddress),
    queryFn: async () => {
      const response = await fetch(`/api/notifications?wallet=${walletAddress}`)
      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }
      const data = await response.json()
      return data.data || { notifications: [], unreadCount: 0 }
    },
    enabled: !!walletAddress,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

// Hook to save transaction to history
export function useSaveTransactionHistory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (transactionData: {
      walletAddress: string
      type: 'deposit' | 'withdraw' | 'rebalance'
      assetAddress?: string
      amount?: number
      transactionHash: string
      blockNumber?: number
      gasUsed?: number
      protocolAddress?: string
      oldAPY?: number
      newAPY?: number
    }) => {
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to save transaction history')
      }
      
      return response.json()
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch history
      queryClient.invalidateQueries({
        queryKey: queryKeys.history(variables.walletAddress)
      })
    }
  })
}

// Hook to create notification
export function useCreateNotification() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (notificationData: {
      walletAddress: string
      message: string
      type?: 'info' | 'success' | 'warning' | 'error'
      data?: any
    }) => {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to create notification')
      }
      
      return response.json()
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications(variables.walletAddress)
      })
    }
  })
}

// Hook to update transaction status
export function useUpdateTransactionStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (updateData: {
      transactionHash: string
      walletAddress: string
      updates: {
        blockNumber?: number
        gasUsed?: number
        protocolAddress?: string
        oldAPY?: number
        newAPY?: number
      }
    }) => {
      const response = await fetch('/api/history/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update transaction status')
      }
      
      return response.json()
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch history
      queryClient.invalidateQueries({
        queryKey: queryKeys.history(variables.walletAddress)
      })
    }
  })
}

// Hook to update notification by transaction hash
export function useUpdateNotificationByTransactionHash() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (updateData: {
      transactionHash: string
      walletAddress: string
      updates: {
        message?: string
        type?: 'info' | 'success' | 'warning' | 'error'
        data?: any
      }
    }) => {
      const response = await fetch('/api/notifications/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update notification')
      }
      
      return response.json()
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications(variables.walletAddress)
      })
    }
  })
}

// Hook to mark notification as read
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ notificationId, walletAddress }: { notificationId: string, walletAddress: string }) => {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, walletAddress })
      })
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read')
      }
      
      return response.json()
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications(variables.walletAddress)
      })
    }
  })
}

// Hook to mark all notifications as read
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (walletAddress: string) => {
      const response = await fetch(`/api/notifications?wallet=${walletAddress}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read')
      }
      
      return response.json()
    },
    onSuccess: (_, walletAddress) => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications(walletAddress)
      })
    }
  })
}

// Hook to preview deposit (calculate aYRT tokens to be received)
export function usePreviewDeposit(assetAddress: string, amount: string, decimals: number = 6) {
  return useQuery({
    queryKey: ['preview-deposit', assetAddress, amount],
    queryFn: async () => {
      if (!amount || parseFloat(amount) <= 0) {
        return { receiptTokens: '0', receiptTokensFormatted: '0' }
      }

      try {
        const amountBigInt = parseUnits(amount, decimals)
        const receiptTokens = await readContract(config, {
          address: addresses.YIELD_ROUTER as `0x${string}`,
          abi: YIELD_ROUTER_ABI,
          functionName: 'previewDeposit',
          args: [assetAddress as `0x${string}`, amountBigInt]
        })

        return {
          receiptTokens: receiptTokens.toString(),
          receiptTokensFormatted: formatUnits(receiptTokens, decimals)
        }
      } catch (error) {
        console.error('Error previewing deposit:', error)
        return { receiptTokens: '0', receiptTokensFormatted: '0' }
      }
    },
    enabled: !!assetAddress && !!amount && parseFloat(amount) > 0,
    staleTime: 10 * 1000, // 10 seconds
  })
}

// Hook to preview withdrawal (calculate aYRT tokens to burn for given USDC amount)
export function usePreviewWithdraw(assetAddress: string, usdcAmount: string, decimals: number = 6) {
  return useQuery({
    queryKey: ['preview-withdraw', assetAddress, usdcAmount],
    queryFn: async () => {
      if (!usdcAmount || parseFloat(usdcAmount) <= 0) {
        return { aYRTToBurn: '0', aYRTToBurnFormatted: '0' }
      }

      try {
        const usdcAmountBigInt = parseUnits(usdcAmount, decimals)
        
        // For now, we'll use a simplified approach: assume 1:1 ratio
        // In a real implementation, you'd need to reverse the previewWithdraw calculation
        // or add a public getter for asset positions in the smart contract
        
        // Get receipt token supply to estimate the ratio
        const receiptSupply = await readContract(config, {
          address: addresses.RECEIPT_TOKEN as `0x${string}`,
          abi: RECEIPT_TOKEN_ABI,
          functionName: 'totalSupply'
        })

        if (receiptSupply === BigInt(0)) {
          return { aYRTToBurn: '0', aYRTToBurnFormatted: '0' }
        }

        // Simplified calculation: assume 1:1 ratio for now
        // TODO: Implement proper calculation using asset position data
        const aYRTToBurn = usdcAmountBigInt

        return {
          aYRTToBurn: aYRTToBurn.toString(),
          aYRTToBurnFormatted: formatUnits(aYRTToBurn, decimals)
        }
      } catch (error) {
        console.error('Error previewing withdrawal:', error)
        return { aYRTToBurn: '0', aYRTToBurnFormatted: '0' }
      }
    },
    enabled: !!assetAddress && !!usdcAmount && parseFloat(usdcAmount) > 0,
    staleTime: 10 * 1000, // 10 seconds
  })
}
