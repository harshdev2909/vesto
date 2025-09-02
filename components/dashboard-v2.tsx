"use client"

import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Wallet, 
  AlertCircle,
  BarChart3,
  History,
  Settings
} from 'lucide-react'
import { DepositFormV3 } from './deposit-form-v3'
import { WithdrawFormV3 } from './withdraw-form-v3'
import { ManualRebalancePanel } from './manual-rebalance-panel'
import { APYTVLCharts } from './apy-tvl-charts'
import { NotificationBell } from './notification-bell'
import { useSupportedAssets, useReceiptBalance, useNextRebalanceCandidate, useBestYield, useTokenBalance, useTransactionHistory } from '@/hooks/useOnChainData'
import { useVaultData } from '@/hooks/useVaultData'
import { useAppStore } from '@/store/use-app-store'

export function DashboardV2() {
  const { address, isConnected } = useAccount()
  const { user } = useAppStore()
  const [activeTab, setActiveTab] = useState('overview')

  // Hooks
  const { data: supportedAssets, isLoading: assetsLoading } = useSupportedAssets()
  const { data: receiptBalance, isLoading: balanceLoading } = useReceiptBalance(address || '')
  const { data: nextCandidate, isLoading: candidateLoading } = useNextRebalanceCandidate()
  const { data: historyEntries, isLoading: historyLoading } = useTransactionHistory(address || '')
  
  // Get the first supported asset for current APY/protocol display
  const primaryAsset = supportedAssets?.[0]
  const { data: bestYield, isLoading: yieldLoading } = useBestYield(primaryAsset || '')
  const { data: tokenBalance, isLoading: tokenBalanceLoading } = useTokenBalance(address || '', primaryAsset || '')
  
  // Vault data for platform-specific information
  const { vaultData, isLoading: vaultLoading, error: vaultError } = useVaultData()

  const handleTransactionSuccess = () => {
    // Refresh data after successful transaction
    window.location.reload()
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Vesto Dashboard
              </CardTitle>
              <CardDescription>
                Connect your wallet to access the yield aggregator
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect your wallet to start earning yield on your assets
                  </p>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please connect your wallet using the button in the top navigation
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Vesto Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back{user.email ? `, ${user.email}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Badge variant="outline" className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Connected
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total aYRT Balance</p>
                  <p className="text-2xl font-bold">
                    {balanceLoading ? '...' : receiptBalance?.formatted || '0'} aYRT
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Supported Assets</p>
                  <p className="text-2xl font-bold">
                    {assetsLoading ? '...' : supportedAssets?.length || 0}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Next Rebalance</p>
                  <p className="text-2xl font-bold">
                    {candidateLoading ? '...' : 
                     nextCandidate?.timeUntilUpkeep === 0n ? 'Ready' : 
                     nextCandidate?.timeUntilUpkeep ? `${Math.floor(Number(nextCandidate.timeUntilUpkeep) / 3600)}h` : 'N/A'}
                  </p>
                </div>
                <RefreshCw className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Best APY</p>
                  <p className="text-2xl font-bold">
                    {nextCandidate ? `${nextCandidate.bestAPYFormatted}%` : 'N/A'}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            <TabsTrigger value="rebalance">Rebalance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Available Protocols & User Deposits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Available Protocols
                  </CardTitle>
                  <CardDescription>
                    Current yield opportunities across different protocols
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {vaultError ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <p className="text-red-600">Error loading protocol data</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {vaultError.toString()}
                      </p>
                    </div>
                  ) : vaultData?.allProtocols && vaultData.allProtocols.length > 0 ? (
                    <div className="space-y-4">
                      {vaultData.allProtocols.map((protocol, index) => (
                        <div key={protocol.protocol} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{protocol.protocolName}</h4>
                            <Badge variant={index === 0 ? "default" : "secondary"} className={index === 0 ? "bg-green-100 text-green-800" : ""}>
                              {protocol.apyPercentage.toFixed(4)}%
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono">
                            {protocol.protocol.slice(0, 6)}...{protocol.protocol.slice(-4)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            TVL: {protocol.totalValueLocked}
                          </p>
                        </div>
                      ))}
                      <div className="text-sm text-muted-foreground">
                        * APY data is fetched from smart contracts in real-time
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Loading protocol data...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Your Deposits
                  </CardTitle>
                  <CardDescription>
                    Current USDC deposits and aYRT token balance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">USDC Deposited in Platform</h4>
                        <Badge variant="secondary">
                          {vaultLoading ? '...' : vaultData?.userPosition?.formattedAmount || '0'} USDC
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Total USDC amount deposited in Vesto platform
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">aYRT Receipt Tokens</h4>
                        <Badge variant="outline">
                          {balanceLoading ? '...' : receiptBalance?.formatted || '0'} aYRT
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Receipt tokens representing your share
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Wallet USDC Balance</h4>
                        <Badge variant="outline">
                          {tokenBalanceLoading ? '...' : tokenBalance?.formatted || '0'} USDC
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Available USDC in your wallet for deposits
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current APY */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Platform APY</CardTitle>
                  <CardDescription>Your current yield rate on Vesto</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {vaultLoading ? '...' : vaultData?.currentVault?.apyPercentage ? `${(vaultData.currentVault.apyPercentage * 100).toFixed(4)}%` : 'N/A'}
                  </div>
                  {vaultData?.currentVault?.protocolName && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Protocol: {vaultData.currentVault.protocolName}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Current Protocol */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Protocol</CardTitle>
                  <CardDescription>Active yield protocol</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {vaultLoading ? '...' : vaultData?.currentVault?.protocolName || 'N/A'}
                  </div>
                  {vaultData?.currentVault?.protocol && (
                    <Badge variant="secondary" className="mt-2">
                      {vaultData.currentVault.protocol.slice(0, 6)}...{vaultData.currentVault.protocol.slice(-4)}
                    </Badge>
                  )}
                </CardContent>
              </Card>

              {/* Current Deposit in USDC */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Platform Deposit</CardTitle>
                  <CardDescription>Your USDC deposited in Vesto</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {vaultLoading ? '...' : vaultData?.userPosition?.formattedAmount || '0'} USDC
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Total deposited in platform
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>
                  Your latest deposits and withdrawals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading transactions...</p>
                    </div>
                  </div>
                ) : !historyEntries || historyEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No transactions found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Start by making your first deposit
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historyEntries?.slice(0, 5).map((entry) => (
                      <div
                        key={entry._id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {entry.type === 'deposit' ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : entry.type === 'withdraw' ? (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          ) : (
                            <RefreshCw className="h-4 w-4 text-blue-600" />
                          )}
                          <div>
                            <p className="font-medium capitalize">{entry.type}</p>
                            <p className="text-sm text-muted-foreground">
                              {entry.amount.toFixed(6)} USDC
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </p>
                          {entry.transactionHash && (
                            <p className="text-xs text-muted-foreground font-mono">
                              {entry.transactionHash.slice(0, 8)}...
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {historyEntries.length > 5 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" size="sm">
                          View All Transactions
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common operations for managing your yield positions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => setActiveTab('deposit')} 
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Make a Deposit
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('withdraw')} 
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <TrendingDown className="mr-2 h-4 w-4" />
                    Withdraw Assets
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('rebalance')} 
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Manual Rebalance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deposit">
            <div className="max-w-2xl mx-auto">
              <DepositFormV3 onSuccess={handleTransactionSuccess} />
            </div>
          </TabsContent>

          <TabsContent value="withdraw">
            <div className="max-w-2xl mx-auto">
              <WithdrawFormV3 onSuccess={handleTransactionSuccess} />
            </div>
          </TabsContent>

          <TabsContent value="rebalance">
            <div className="max-w-4xl mx-auto">
              <ManualRebalancePanel onSuccess={handleTransactionSuccess} />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="max-w-6xl mx-auto">
              <APYTVLCharts />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
