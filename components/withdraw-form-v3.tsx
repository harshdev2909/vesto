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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, TrendingDown, Wallet, AlertCircle, CheckCircle } from 'lucide-react'
import { useYieldAggregatorV2 } from '@/hooks/useYieldAggregatorV2'
import { useSupportedAssets, useReceiptBalance } from '@/hooks/useOnChainData'
import { useAppStore } from '@/store/use-app-store'
import { addresses } from '@/lib/contracts'

interface WithdrawFormV3Props {
  onSuccess?: () => void
}

export function WithdrawFormV3({ onSuccess }: WithdrawFormV3Props) {
  const { address } = useAccount()
  const { user } = useAppStore()
  const [selectedAsset, setSelectedAsset] = useState<string>('')
  const [usdcAmount, setUsdcAmount] = useState<string>('')
  const [balanceError, setBalanceError] = useState<string>('')
  
  // Hooks
  const { withdraw, isWithdrawing } = useYieldAggregatorV2()
  const { data: supportedAssets, isLoading: assetsLoading } = useSupportedAssets()
  const { data: receiptBalance, isLoading: balanceLoading, refetch: refetchBalance } = useReceiptBalance(address || '', selectedAsset)
  
  // For withdrawal, we need to calculate how much aYRT to burn for the desired USDC amount
  // The contract's previewWithdraw function calculates USDC received for given aYRT amount
  // So we need to work backwards - estimate aYRT needed for USDC amount
  const [estimatedAYRT, setEstimatedAYRT] = useState<string>('0')

  // Get token info for selected asset
  const selectedAssetInfo = supportedAssets?.find(asset => asset === selectedAsset)

  // Clear any balance errors - let the contract handle validation
  useEffect(() => {
    setBalanceError('')
  }, [usdcAmount, selectedAsset])

  const handleWithdraw = async () => {
    if (!address || !selectedAsset || !usdcAmount) {
      return
    }

    // Let the contract handle balance validation

    try {
      // Convert USDC amount to the format expected by the contract
      const usdcAmountFloat = parseFloat(usdcAmount)
      const usdcAmountBigInt = parseUnits(usdcAmountFloat.toString(), 6)
      
      // Pass the USDC amount directly to the contract
      // The contract will calculate how much aYRT to burn internally
      const success = await withdraw(selectedAsset, usdcAmountBigInt)
      
      if (success && onSuccess) {
        onSuccess()
        setUsdcAmount('')
        // Refetch balance after successful withdrawal
        refetchBalance()
      }
    } catch (error) {
      console.error('Withdrawal error:', error)
    }
  }

  const handleMaxAmount = () => {
    if (receiptBalance) {
      // For now, use the full aYRT balance as max USDC (simplified)
      // In a proper implementation, you'd need to calculate the max USDC based on current exchange rate
      setUsdcAmount(receiptBalance.formatted)
    }
  }

  const canWithdraw = address && selectedAsset && usdcAmount && parseFloat(usdcAmount) > 0 && !isWithdrawing
  const isLoading = assetsLoading || balanceLoading

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Withdraw Assets
          </CardTitle>
          <CardDescription>
            Connect your wallet to start withdrawing assets
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
          Withdraw your assets by burning aYRT receipt tokens
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

        {/* USDC Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">USDC Amount to Withdraw</Label>
          <div className="flex gap-2">
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={usdcAmount}
              onChange={(e) => setUsdcAmount(e.target.value)}
              disabled={!selectedAsset || isWithdrawing}
            />
            <Button
              variant="outline"
              onClick={handleMaxAmount}
              disabled={!receiptBalance || isWithdrawing}
            >
              Max
            </Button>
          </div>
          {receiptBalance && (
            <p className="text-sm text-muted-foreground">
              aYRT Balance: {receiptBalance.formatted} aYRT
            </p>
          )}
        </div>

        {/* Balance Error */}
        {balanceError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{balanceError}</AlertDescription>
          </Alert>
        )}

        {/* Withdrawal Info */}
        {usdcAmount && parseFloat(usdcAmount) > 0 && (
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Withdrawal Info</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>USDC to receive:</span>
                <span className="font-medium">{parseFloat(usdcAmount).toFixed(6)} USDC</span>
              </div>
              <div className="text-xs text-muted-foreground">
                * The contract will automatically burn the required aYRT tokens
              </div>
            </div>
          </div>
        )}

        {/* Success Status */}
        {usdcAmount && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-800">
                Ready to withdraw
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
