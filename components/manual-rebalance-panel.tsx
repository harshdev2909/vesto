"use client"

import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, RefreshCw, Zap, AlertTriangle, TrendingUp } from 'lucide-react'
import { useYieldAggregatorV2 } from '@/hooks/useYieldAggregatorV2'
import { useSupportedAssets, useNextRebalanceCandidate, useCompareYields } from '@/hooks/useOnChainData'
import { useAppStore } from '@/store/use-app-store'

interface ManualRebalancePanelProps {
  onSuccess?: () => void
}

export function ManualRebalancePanel({ onSuccess }: ManualRebalancePanelProps) {
  const { address } = useAccount()
  const { user } = useAppStore()
  const [selectedAsset, setSelectedAsset] = useState<string>('')
  
  // Hooks
  const { rebalance, rebalanceForce, isRebalancing } = useYieldAggregatorV2()
  const { data: supportedAssets, isLoading: assetsLoading } = useSupportedAssets()
  const { data: nextCandidate, isLoading: candidateLoading } = useNextRebalanceCandidate()
  const { data: yieldComparisons, isLoading: comparisonsLoading } = useCompareYields(selectedAsset)

  const handleRebalance = async (force: boolean = false) => {
    if (!address || !selectedAsset) {
      return
    }

    try {
      const success = force 
        ? await rebalanceForce(selectedAsset)
        : await rebalance(selectedAsset)
      
      if (success && onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Rebalance error:', error)
    }
  }

  const isLoading = assetsLoading || candidateLoading || comparisonsLoading
  const canRebalance = address && selectedAsset && !isRebalancing

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Manual Rebalancing
          </CardTitle>
          <CardDescription>
            Connect your wallet to access rebalancing features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Please connect your wallet to continue</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Demo Mode Warning */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Demo Mode:</strong> This is a manual rebalancing interface for demonstration purposes. 
          In production, rebalancing will be automated using Chainlink Keepers.
        </AlertDescription>
      </Alert>

      {/* Next Rebalance Candidate */}
      {nextCandidate && nextCandidate.asset !== '0x0000000000000000000000000000000000000000' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Next Rebalance Candidate
            </CardTitle>
            <CardDescription>
              Asset that will be rebalanced next by the automated system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Asset</p>
                <p className="text-sm text-muted-foreground">
                  {nextCandidate.asset.slice(0, 6)}...{nextCandidate.asset.slice(-4)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Current APY</p>
                <Badge variant="outline">
                  {(parseFloat(nextCandidate.currentAPYFormatted) * 100).toFixed(2)}%
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Best APY</p>
                <Badge variant="default">
                  {(parseFloat(nextCandidate.bestAPYFormatted) * 100).toFixed(2)}%
                </Badge>
              </div>
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm">Improvement:</span>
                <span className="text-sm font-medium">
                  +{nextCandidate.improvementBps.toFixed(2)} basis points
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Time until upkeep:</span>
                <span className="text-sm font-medium">
                  {Number(nextCandidate.timeUntilUpkeep) > 0 
                    ? `${Math.floor(Number(nextCandidate.timeUntilUpkeep) / 3600)}h ${Math.floor((Number(nextCandidate.timeUntilUpkeep) % 3600) / 60)}m`
                    : 'Ready now'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Rebalance Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Manual Rebalance
          </CardTitle>
          <CardDescription>
            Manually trigger rebalancing for a specific asset
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Asset Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Asset to Rebalance</label>
            <Select value={selectedAsset} onValueChange={setSelectedAsset} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an asset to rebalance" />
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

          {/* Yield Comparisons */}
          {yieldComparisons && yieldComparisons.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Available Protocols</label>
              <div className="space-y-2">
                {yieldComparisons.map((comparison, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{comparison.protocolName}</p>
                      <p className="text-sm text-muted-foreground">
                        {comparison.protocol.slice(0, 6)}...{comparison.protocol.slice(-4)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={index === 0 ? "default" : "outline"}>
                        {(parseFloat(comparison.apyFormatted) * 100).toFixed(2)}% APY
                      </Badge>
                      {index === 0 && (
                        <p className="text-xs text-muted-foreground mt-1">Best</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rebalance Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => handleRebalance(false)}
              disabled={!canRebalance}
              className="flex-1"
            >
              {isRebalancing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <RefreshCw className="mr-2 h-4 w-4" />
              Rebalance
            </Button>
            
            <Button
              onClick={() => handleRebalance(true)}
              disabled={!canRebalance}
              variant="destructive"
              className="flex-1"
            >
              {isRebalancing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Zap className="mr-2 h-4 w-4" />
              Force Rebalance
            </Button>
          </div>

          {/* Force Rebalance Warning */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Force Rebalance:</strong> Bypasses cooldown and APY improvement checks. 
              Use only for testing or emergency situations.
            </AlertDescription>
          </Alert>

          {/* User Info */}
          {user.email && (
            <div className="text-xs text-muted-foreground text-center">
              Rebalancing as {user.email}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
