"use client"

import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, TrendingDown, Wallet, AlertCircle } from 'lucide-react'
import { useYieldAggregatorV2 } from '@/hooks/useYieldAggregatorV2'
import { useSupportedAssets, useUserAssetShares, useReceiptBalance } from '@/hooks/useOnChainData'
import { useAppStore } from '@/store/use-app-store'

interface WithdrawFormV2Props {
  onSuccess?: () => void
}

export function WithdrawFormV2({ onSuccess }: WithdrawFormV2Props) {
  const { address } = useAccount()
  const { user } = useAppStore()
  const [selectedAsset, setSelectedAsset] = useState<string>('')
  const [aYRTAmount, setAYRTAmount] = useState<string>('')
  const [isCalculating, setIsCalculating] = useState(false)
  
  // Hooks
  const { withdraw, isWithdrawing } = useYieldAggregatorV2()
  const { data: supportedAssets, isLoading: assetsLoading } = useSupportedAssets()
  const { data: userAssetShares, isLoading: sharesLoading } = useUserAssetShares(address || '', selectedAsset)
  const { data: receiptBalance, isLoading: balanceLoading } = useReceiptBalance(address || '')

  // Calculate withdrawal preview
  const [withdrawPreview, setWithdrawPreview] = useState<{
    assetAmount: string
    remainingShares: string
  } | null>(null)

  // Update withdrawal preview when amount or asset changes
  useEffect(() => {
    if (aYRTAmount && selectedAsset && userAssetShares) {
      setIsCalculating(true)
      try {
        const aYRTAmountBigInt = parseUnits(aYRTAmount, 18) // aYRT has 18 decimals
        const currentShares = userAssetShares
        
        if (aYRTAmountBigInt <= currentShares) {
          // For now, we'll use a simple 1:1 ratio for asset amount
          // In a real implementation, you'd call previewWithdraw on the contract
          const assetAmount = aYRTAmount // Simplified
          const remainingShares = formatUnits(currentShares - aYRTAmountBigInt, 18)
          
          setWithdrawPreview({
            assetAmount,
            remainingShares
          })
        } else {
          setWithdrawPreview(null)
        }
      } catch (error) {
        console.error('Error calculating withdrawal preview:', error)
        setWithdrawPreview(null)
      } finally {
        setIsCalculating(false)
      }
    } else {
      setWithdrawPreview(null)
    }
  }, [aYRTAmount, selectedAsset, userAssetShares])

  const handleWithdraw = async () => {
    if (!address || !selectedAsset || !aYRTAmount) {
      return
    }

    try {
      const aYRTAmountBigInt = parseUnits(aYRTAmount, 18) // aYRT has 18 decimals
      const success = await withdraw(selectedAsset, aYRTAmountBigInt)
      
      if (success && onSuccess) {
        onSuccess()
        setAYRTAmount('')
      }
    } catch (error) {
      console.error('Withdrawal error:', error)
    }
  }

  const handleMaxAmount = () => {
    if (userAssetShares) {
      setAYRTAmount(formatUnits(userAssetShares, 18))
    }
  }

  const canWithdraw = address && selectedAsset && aYRTAmount && parseFloat(aYRTAmount) > 0 && !isWithdrawing
  const isLoading = assetsLoading || sharesLoading || balanceLoading
  const hasShares = userAssetShares && userAssetShares > 0n

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Withdraw Assets
          </CardTitle>
          <CardDescription>
            Connect your wallet to withdraw your assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Please connect your wallet to continue</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Withdraw Assets
        </CardTitle>
        <CardDescription>
          Withdraw your assets and burn receipt tokens
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Asset Selection */}
        <div className="space-y-2">
          <Label htmlFor="asset">Select Asset</Label>
          <Select value={selectedAsset} onValueChange={setSelectedAsset} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an asset to withdraw" />
            </SelectTrigger>
            <SelectContent>
              {supportedAssets?.map((asset) => (
                <SelectItem key={asset} value={asset}>
                  <div className="flex items-center gap-2">
                    <span>{asset.slice(0, 6)}...{asset.slice(-4)}</span>
                    <Badge variant="secondary">USDC</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* aYRT Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="ayrt-amount">aYRT Amount to Burn</Label>
          <div className="flex gap-2">
            <Input
              id="ayrt-amount"
              type="number"
              placeholder="0.00"
              value={aYRTAmount}
              onChange={(e) => setAYRTAmount(e.target.value)}
              disabled={!selectedAsset || isWithdrawing}
            />
            <Button
              variant="outline"
              onClick={handleMaxAmount}
              disabled={!hasShares || isWithdrawing}
            >
              Max
            </Button>
          </div>
          {userAssetShares && (
            <p className="text-sm text-muted-foreground">
              Your shares: {formatUnits(userAssetShares, 18)} aYRT
            </p>
          )}
        </div>

        {/* Total Receipt Balance */}
        {receiptBalance && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total aYRT Balance</span>
              <span className="text-sm">{receiptBalance.formatted} aYRT</span>
            </div>
          </div>
        )}

        {/* Withdrawal Preview */}
        {withdrawPreview && (
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Withdrawal Preview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>You will receive:</span>
                <span className="font-medium">{withdrawPreview.assetAmount} USDC</span>
              </div>
              <div className="flex justify-between">
                <span>aYRT to burn:</span>
                <span className="font-medium">{aYRTAmount} aYRT</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining shares:</span>
                <span className="font-medium">{withdrawPreview.remainingShares} aYRT</span>
              </div>
            </div>
          </div>
        )}

        {/* Insufficient Shares Warning */}
        {aYRTAmount && userAssetShares && parseUnits(aYRTAmount, 18) > userAssetShares && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-800">
                Insufficient aYRT shares for this withdrawal
              </p>
            </div>
          </div>
        )}

        {/* No Shares Warning */}
        {selectedAsset && !hasShares && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                No shares found for this asset. Make a deposit first.
              </p>
            </div>
          </div>
        )}

        {/* Withdraw Button */}
        <Button
          onClick={handleWithdraw}
          disabled={!canWithdraw}
          className="w-full"
          size="lg"
        >
          {isWithdrawing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
        </Button>

        {/* User Info */}
        {user.email && (
          <div className="text-xs text-muted-foreground text-center">
            Withdrawing as {user.email}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
