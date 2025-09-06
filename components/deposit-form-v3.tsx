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
import { Loader2, TrendingUp, Wallet, AlertCircle, CheckCircle } from 'lucide-react'
import { useYieldAggregatorV2 } from '@/hooks/useYieldAggregatorV2'
import { useSupportedAssets, useBestYield, useTokenBalance, useTokenAllowance, usePreviewDeposit, useCreateNotification } from '@/hooks/useOnChainData'
import { useAppStore } from '@/store/use-app-store'
import { addresses } from '@/lib/contracts'

interface DepositFormV3Props {
  onSuccess?: () => void
}

export function DepositFormV3({ onSuccess }: DepositFormV3Props) {
  const { address } = useAccount()
  const { user } = useAppStore()
  const [selectedAsset, setSelectedAsset] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [isCalculating, setIsCalculating] = useState(false)
  const [balanceError, setBalanceError] = useState<string>('')
  const [allowanceError, setAllowanceError] = useState<string>('')
  
  // Hooks
  const { approveToken, deposit, depositWithApproval, isDepositing, isApproving } = useYieldAggregatorV2()
  const { data: supportedAssets, isLoading: assetsLoading } = useSupportedAssets()
  const { data: bestYield, isLoading: yieldLoading } = useBestYield(selectedAsset)
  const { data: tokenBalance, isLoading: balanceLoading, refetch: refetchBalance } = useTokenBalance(address || '', selectedAsset)
  const { data: tokenAllowance, isLoading: allowanceLoading, refetch: refetchAllowance } = useTokenAllowance(
    address || '', 
    selectedAsset, 
    addresses.YIELD_ROUTER
  )
  const { data: depositPreview, isLoading: previewLoading } = usePreviewDeposit(selectedAsset, amount, 6)
  const createNotification = useCreateNotification()

  // Get token info for selected asset
  const selectedAssetInfo = supportedAssets?.find(asset => asset === selectedAsset)
  
  // Deposit preview is now handled by the usePreviewDeposit hook

  // Validate balance and allowance
  useEffect(() => {
    if (amount && selectedAsset && tokenBalance && tokenAllowance) {
      try {
        const amountBigInt = parseUnits(amount, 6) // Assuming 6 decimals for USDC
        const balanceBigInt = parseUnits(tokenBalance.formatted, 6)
        const allowanceBigInt = parseUnits(tokenAllowance.formatted, 6)
        
        // Check balance
        if (amountBigInt > balanceBigInt) {
          setBalanceError(`Insufficient balance. You have ${tokenBalance.formatted} tokens.`)
        } else {
          setBalanceError('')
        }
        
        // Check allowance
        if (amountBigInt > allowanceBigInt) {
          // The depositWithApproval function approves 10x the amount, so show that in the message
          const approvalAmount = amountBigInt * BigInt(10)
          setAllowanceError(`Insufficient allowance. You need to approve ${formatUnits(approvalAmount, 6)} tokens (10x the deposit amount for future transactions).`)
        } else {
          setAllowanceError('')
        }
      } catch (error) {
        console.error('Error validating amount:', error)
        setBalanceError('Invalid amount format')
        setAllowanceError('')
      }
    } else {
      // Clear errors when no amount or asset selected
      setBalanceError('')
      setAllowanceError('')
    }
  }, [amount, selectedAsset, tokenBalance, tokenAllowance])

  // Deposit preview is now handled by the usePreviewDeposit hook

  const handleApprove = async () => {
    if (!address || !selectedAsset || !amount) {
      return
    }

    try {
      const amountBigInt = parseUnits(amount, 6) // Assuming 6 decimals
      // Approve 10x the amount for future transactions
      const approvalAmount = amountBigInt * BigInt(10)
      const success = await approveToken(selectedAsset, approvalAmount)
      
      if (success) {
        // Refetch allowance after successful approval
        refetchAllowance()
      }
    } catch (error) {
      console.error('Approval error:', error)
    }
  }

  const handleDeposit = async () => {
    if (!address || !selectedAsset || !amount) {
      return
    }

    if (balanceError || allowanceError) {
      return
    }

    try {
      const amountBigInt = parseUnits(amount, 6) // Assuming 6 decimals
      const success = await deposit(selectedAsset, amountBigInt)
      
      if (success && onSuccess) {
        onSuccess()
        setAmount('')
        
        // Create success notification
        if (address) {
          createNotification.mutate({
            walletAddress: address,
            message: `Successfully deposited ${amount} USDC and received ${depositPreview?.receiptTokensFormatted || '0'} aYRT tokens`,
            type: 'success',
            data: {
              amount: amount,
              receiptTokens: depositPreview?.receiptTokensFormatted || '0',
              assetAddress: selectedAsset
            }
          })
        }
        
        // Refetch balance and allowance after successful deposit
        refetchBalance()
        refetchAllowance()
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
  const canApprove = address && selectedAsset && amount && parseFloat(amount) > 0 && !isApproving && !balanceError
  const canDeposit = address && selectedAsset && amount && parseFloat(amount) > 0 && !isDepositing && !isApproving && !balanceError && !allowanceError && !isApprovalNeeded
  const isLoading = assetsLoading || yieldLoading || balanceLoading || allowanceLoading || previewLoading

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

        {/* Balance Error */}
        {balanceError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{balanceError}</AlertDescription>
          </Alert>
        )}

        {/* Allowance Error */}
        {allowanceError && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{allowanceError}</AlertDescription>
          </Alert>
        )}

        {/* Best Yield Info */}
        {bestYield && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Best Yield Protocol</p>
                <p className="text-sm text-muted-foreground">{bestYield.protocolName}</p>
              </div>
              <Badge variant="default" className="text-lg">
                {bestYield.apyFormatted}% APY
              </Badge>
            </div>
          </div>
        )}

        {/* Deposit Preview */}
        {amount && parseFloat(amount) > 0 && !balanceError && (
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Deposit Preview</h4>
            <div className="space-y-2 text-sm">
              {bestYield && (
                <>
                  <div className="flex justify-between">
                    <span>Protocol:</span>
                    <span className="font-medium">{bestYield.protocolName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected APY:</span>
                    <span className="font-medium">{bestYield.apyFormatted}%</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Approval Status */}
        {isApprovalNeeded && !allowanceError && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Token approval required before deposit
              </p>
            </div>
          </div>
        )}

        {/* Success Status */}
        {!isApprovalNeeded && !balanceError && !allowanceError && amount && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-800">
                Ready to deposit
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isApprovalNeeded ? (
          <Button
            onClick={handleApprove}
            disabled={!canApprove}
            className="w-full"
            size="lg"
          >
            {isApproving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isApproving ? 'Approving...' : 'Allow'}
          </Button>
        ) : (
          <Button
            onClick={handleDeposit}
            disabled={!canDeposit}
            className="w-full"
            size="lg"
          >
            {isDepositing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDepositing ? 'Depositing...' : 'Deposit'}
          </Button>
        )}

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
