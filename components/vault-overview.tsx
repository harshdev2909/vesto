"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingUp, DollarSign, PieChart } from "lucide-react"
import { useVaultData } from "@/hooks/useVaultData"
import { ethers } from "ethers"

export function VaultOverview() {
  const { vaultData, isLoading, error, refreshVaultData, isConnected } = useVaultData()

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Vault Overview
          </CardTitle>
          <CardDescription>
            Connect your wallet to view your vault data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Please connect your wallet to see your current vault position and APY data.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Vault Overview
          </CardTitle>
          <CardDescription>
            Loading your vault data from smart contract...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading vault data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !vaultData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Vault Overview
          </CardTitle>
          <CardDescription>
            Error loading vault data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">
              {error || 'Failed to load vault data'}
            </p>
            <Button onClick={refreshVaultData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { currentVault, userPosition, totalVaultData, allProtocols } = vaultData

  return (
    <div className="space-y-6">
      {/* Current Vault Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Current Vault
            </div>
            <Button onClick={refreshVaultData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>
            Your current vault position and APY from smart contract
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Protocol */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Current Protocol</p>
              <Badge variant="secondary" className="text-sm">
                {currentVault.protocolName}
              </Badge>
              <p className="text-xs text-muted-foreground font-mono">
                {currentVault.protocol}
              </p>
            </div>

            {/* Current APY */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Current APY</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-2xl font-bold text-green-600">
                  {currentVault.apyPercentage.toFixed(2)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {currentVault.apy} basis points
              </p>
            </div>

            {/* Your Position */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Your Position</p>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-500" />
                <span className="text-2xl font-bold">
                  {parseFloat(userPosition.formattedAmount).toFixed(2)} mUSDC
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {userPosition.percentage.toFixed(2)}% of total vault
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vault Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Vault Statistics</CardTitle>
          <CardDescription>
            Total vault data and protocol information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Total Vault Data</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Deposited:</span>
                  <span className="font-medium">
                    {parseFloat(totalVaultData.formattedTotalDeposited).toFixed(2)} mUSDC
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Protocol Shares:</span>
                  <span className="font-medium">
                    {parseFloat(totalVaultData.formattedProtocolShares || "0").toFixed(2)} mUSDC
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Rebalance:</span>
                  <span className="font-medium">
                    {totalVaultData.lastRebalanceDate || 'Never'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">All Available Protocols</h4>
              <div className="space-y-2">
                {allProtocols.map((protocol, index) => (
                  <div key={index} className="flex justify-between items-center p-2 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{protocol.protocolName}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {protocol.protocol.slice(0, 10)}...
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {protocol.apyPercentage.toFixed(2)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {protocol.apy} bps
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
