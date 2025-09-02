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
import { Loader2, TrendingUp, Wallet, AlertCircle } from 'lucide-react'
import { useYieldAggregatorV2 } from '@/hooks/useYieldAggregatorV2'
import { useSupportedAssets, useBestYield, useTokenBalance, useTokenAllowance } from '@/hooks/useOnChainData'
import { useAppStore } from '@/store/use-app-store'
import { addresses } from '@/lib/contracts'

interface DepositFormV2Props {
  onSuccess?: () => void
}

export function DepositFormV2({ onSuccess }: DepositFormV2Props) {
  const { address } = useAccount()
  const { user } = useAppStore()
  const [selectedAsset, setSelectedAsset] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [isCalculating, setIsCalculating] = useState(false)
  
  // Hooks
  const { depositWithApproval, isDepositing, isApproving } = useYieldAggregatorV2()
  const { data: supportedAssets, isLoading: assetsLoading } = useSupportedAssets()
  const { data: bestYield, isLoading: yieldLoading } = useBestYield(selectedAsset)
  const { data: tokenBalance, isLoading: balanceLoading } = useTokenBalance(address || '', selectedAsset)
  const { data: tokenAllowance, isLoading: allowanceLoading } = useTokenAllowance(
    address || '', 
    selectedAsset, 
    addresses.YIELD_ROUTER
  )

  // Get token info for selected asset
  const selectedAssetInfo = supportedAssets?.find(asset => asset === selectedAsset)
  
  // Calculate deposit preview
  const [depositPreview, setDepositPreview] = useState<{
    receiptTokens: string
    apy: string
    protocol: string
  } | null>(null)

  // Update deposit preview when amount or asset changes
  useEffect(() => {
    if (amount && selectedAsset && bestYield) {
      setIsCalculating(true)
      try {
        const amountBigInt = parseUnits(amount, 6) // Assuming 6 decimals for USDC
        // For now, we'll use a simple 1:1 ratio for receipt tokens
        // In a real implementation, you'd call previewDeposit on the contract
        setDepositPreview({
          receiptTokens: amount, // Simplified
          apy: bestYield.apyFormatted,
          protocol: bestYield.protocolName
        })
      } catch (error) {
        console.error('Error calculating deposit preview:', error)
        setDepositPreview(null)
      } finally {
        setIsCalculating(false)
      }
    } else {
      setDepositPreview(null)
    }
  }, [amount, selectedAsset, bestYield])

  const handleDeposit = async () => {
    if (!address || !selectedAsset || !amount) {
      return
    }

    try {
      const amountBigInt = parseUnits(amount, 6) // Assuming 6 decimals
      const success = await depositWithApproval(selectedAsset, amountBigInt, 6)
      
      if (success && onSuccess) {
        onSuccess()
        setAmount('')
      }
    } catch (error) {
      console.error('Deposit error:', error)
    }
  }

  const handleMaxAmount = () => {
    if (tokenBalance) {
      setAmount(tokenBalance.formatted)
    }
  }

  const isApprovalNeeded = tokenAllowance && parseFloat(tokenAllowance.formatted) < parseFloat(amount || '0')
  const canDeposit = address && selectedAsset && amount && parseFloat(amount) > 0 && !isDepositing && !isApproving
  const isLoading = assetsLoading || yieldLoading || balanceLoading || allowanceLoading

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Deposit Assets
          </CardTitle>
          <CardDescription>
            Connect your wallet to start depositing assets
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
          <TrendingUp className="h-5 w-5" />
          Deposit Assets
        </CardTitle>
        <CardDescription>
          Deposit your assets to start earning yield automatically
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Asset Selection */}
        <div className="space-y-2">
          <Label htmlFor="asset">Select Asset</Label>
          <Select value={selectedAsset} onValueChange={setSelectedAsset} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an asset to deposit" />
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

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="flex gap-2">
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!selectedAsset || isDepositing || isApproving}
            />
            <Button
              variant="outline"
              onClick={handleMaxAmount}
              disabled={!tokenBalance || isDepositing || isApproving}
            >
              Max
            </Button>
          </div>
          {tokenBalance && (
            <p className="text-sm text-muted-foreground">
              Balance: {tokenBalance.formatted} USDC
            </p>
          )}
        </div>

        {/* Best Yield Info */}
        {bestYield && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Best Yield Protocol</p>
                <p className="text-sm text-muted-foreground">{bestYield.protocolName}</p>
              </div>
              <Badge variant="default" className="text-lg">
                {(parseFloat(bestYield.apyFormatted) * 100).toFixed(2)}% APY
              </Badge>
            </div>
          </div>
        )}

        {/* Deposit Preview */}
        {depositPreview && (
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Deposit Preview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>You will receive:</span>
                <span className="font-medium">{depositPreview.receiptTokens} aYRT</span>
              </div>
              <div className="flex justify-between">
                <span>Protocol:</span>
                <span className="font-medium">{depositPreview.protocol}</span>
              </div>
              <div className="flex justify-between">
                <span>Expected APY:</span>
                <span className="font-medium">{(parseFloat(depositPreview.apy) * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Approval Status */}
        {isApprovalNeeded && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Token approval required before deposit
              </p>
            </div>
          </div>
        )}

        {/* Deposit Button */}
        <Button
          onClick={handleDeposit}
          disabled={!canDeposit}
          className="w-full"
          size="lg"
        >
          {isApproving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isDepositing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isApproving ? 'Approving...' : isDepositing ? 'Depositing...' : 'Deposit'}
        </Button>

        {/* User Info */}
        {user.email && (
          <div className="text-xs text-muted-foreground text-center">
            Depositing as {user.email}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
