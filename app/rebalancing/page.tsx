"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ApyComparisonChart } from "@/components/apy-comparison-chart"
import { useState } from "react"
import { useMockPortfolio } from "@/hooks/useBackendData"
import { useRebalancing } from "@/hooks/useRebalancing"
import { useWallet } from "@/hooks/useWallet"
import { useAssets } from "@/hooks/useBackendData"
import { SiteHeader } from "@/components/site-header"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, TrendingUp, Clock, Zap, RefreshCw } from "lucide-react"
import Link from "next/link"
import { RebalancingModal } from "@/components/rebalancing-modal"
import { RebalancingHistory } from "@/components/rebalancing-history"

export default function RebalancingPage() {
  const { portfolio } = useMockPortfolio()
  const { address: walletAddress, isConnected } = useWallet()
  const { assets } = useAssets()
  const { toast } = useToast()
  const {
    opportunities,
    minDeltaBps,
    totalAssets,
    opportunitiesCount,
    isLoading,
    error,
    isExecuting,
    lastExecution,
    executeRebalancing,
    recordRebalancingSuccess,
    refreshOpportunities,
    isMockData,
    isDynamic,
    dataSource
  } = useRebalancing()
  
  const [keepersActive, setKeepersActive] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null)

  const handleManualRebalance = async (opportunity: any) => {
    if (!isConnected || !walletAddress) {
      toast({ title: "Error", description: "Please connect your wallet first" })
      return
    }

    // Open the rebalancing modal
    setSelectedOpportunity(opportunity)
    setIsModalOpen(true)
  }

  const handleRebalancingSuccess = () => {
    // Refresh opportunities to show updated state
    refreshOpportunities()
    // Close modal
    setIsModalOpen(false)
    setSelectedOpportunity(null)
  }

  const getAssetSymbol = (opportunity: any) => {
    return opportunity.assetSymbol || 'Unknown'
  }

  const formatAPY = (apy: number) => {
    return (apy / 100).toFixed(2) + '%'
  }

  const formatBasisPoints = (bps: number) => {
    return (bps / 100).toFixed(2) + '%'
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 py-8 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Rebalancing Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage yield optimization across protocols</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={refreshOpportunities}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant={keepersActive ? "default" : "secondary"} 
              onClick={() => setKeepersActive((s) => !s)}
            >
              <Zap className="w-4 h-4 mr-2" />
              Keepers {keepersActive ? "Active" : "Inactive"}
            </Button>
          </div>
        </div>

        {/* Data Source Status */}
        {isMockData && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div>
                  <h4 className="font-semibold text-orange-900">Development Mode - Mock Data</h4>
                  <p className="text-sm text-orange-800">
                    Using mock data due to network connection issues. To see dynamic data:
                  </p>
                  <ul className="text-sm text-orange-800 mt-2 ml-4 list-disc">
                    <li>Go to Admin page and create APY entries for assets and protocols</li>
                    <li>Set different APY values for the same asset across different protocols</li>
                    <li>Return here to see real rebalancing opportunities</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {isDynamic && !isMockData && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="font-semibold text-green-900">Dynamic Mode Active</h4>
                  <p className="text-sm text-green-800">
                    Using admin-managed APY data from database. Opportunities are calculated dynamically based on configured APY values.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium leading-none">Total Assets</p>
                  <p className="text-2xl font-bold">{totalAssets}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium leading-none">Opportunities</p>
                  <p className="text-2xl font-bold text-orange-600">{opportunitiesCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium leading-none">Min Threshold</p>
                  <p className="text-2xl font-bold">{formatBasisPoints(minDeltaBps)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Zap className="h-4 w-4 text-green-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium leading-none">Keepers Status</p>
                  <p className="text-2xl font-bold text-green-600">{keepersActive ? "ON" : "OFF"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rebalancing Opportunities */}
      <Card>
        <CardHeader>
            <CardTitle>Rebalancing Opportunities</CardTitle>
            <p className="text-sm text-muted-foreground">
              Assets with APY improvements above the minimum threshold of {formatBasisPoints(minDeltaBps)}
            </p>
        </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading rebalancing opportunities...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
                <p className="text-muted-foreground mb-4">{error.message || 'Failed to load rebalancing opportunities'}</p>
                <Button onClick={refreshOpportunities}>Try Again</Button>
              </div>
            ) : opportunities.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Opportunities Found</h3>
                <p className="text-muted-foreground">All assets are optimally positioned. No rebalancing needed at this time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {opportunities.map((opportunity) => (
                  <div 
                    key={opportunity.assetAddress} 
                    className={`border rounded-lg p-4 ${
                      opportunity.isOpportunity 
                        ? 'border-orange-200 bg-orange-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{getAssetSymbol(opportunity)}</h4>
                          {opportunity.isOpportunity && (
                            <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                              Opportunity Available
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
                            <div className="text-muted-foreground">Current APY</div>
                            <div className="font-semibold">{formatAPY(opportunity.currentAPY)}</div>
            </div>
            <div>
                            <div className="text-muted-foreground">Best Available APY</div>
                            <div className="font-semibold text-green-600">{formatAPY(opportunity.bestAPY)}</div>
            </div>
            <div>
                            <div className="text-muted-foreground">Improvement</div>
                            <div className={`font-semibold ${opportunity.improvement > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                              {opportunity.improvement > 0 ? '+' : ''}{formatBasisPoints(opportunity.improvement)}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          <div>Current: {opportunity.currentProtocolName}</div>
                          <div>Best: {opportunity.bestProtocolName}</div>
                          <div>Protocols: {opportunity.protocolCount || 0} available</div>
                        </div>
            </div>
                      <div className="ml-4">
                        {opportunity.isOpportunity ? (
                          <Button 
                            onClick={() => handleManualRebalance(opportunity)}
                            disabled={!isConnected || isExecuting}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            {isExecuting ? (
                              <>
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                Rebalancing...
                              </>
                            ) : (
                              'Rebalance Now'
                            )}
              </Button>
                        ) : (
                          <div className="text-sm text-muted-foreground text-center">
                            <div>No action needed</div>
                            <div className="text-xs">Below threshold</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Last Execution */}
        {lastExecution && (
          <Card>
            <CardHeader>
              <CardTitle>Last Rebalancing Execution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Transaction Hash</div>
                  <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                    {lastExecution.txHash.slice(0, 10)}...{lastExecution.txHash.slice(-8)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Executed</div>
                  <div className="font-semibold">
                    {new Date(lastExecution.timestamp).toLocaleString()}
            </div>
          </div>
          <div>
                  <a 
                    href={`https://sepolia.arbiscan.io/tx/${lastExecution.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View on Arbiscan →
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* APY Comparison Chart */}
        <Card>
          <CardHeader>
            <CardTitle>APY Comparison</CardTitle>
            <p className="text-sm text-muted-foreground">
              Historical APY performance across protocols
            </p>
          </CardHeader>
          <CardContent>
            <ApyComparisonChart 
              oldApy={portfolio?.lastApy ?? 0.05} 
              newApy={portfolio?.currentApy ?? 0.078} 
            />
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>How Rebalancing Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Automatic Rebalancing</h4>
                <p className="text-sm text-muted-foreground">
                  Chainlink Keepers monitor APY across protocols and automatically rebalance 
                  when opportunities exceed the minimum threshold.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Manual Rebalancing</h4>
                <p className="text-sm text-muted-foreground">
                  You can manually trigger rebalancing for specific assets when opportunities 
                  are available, giving you control over the timing.
                </p>
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Important Note</h4>
                  <p className="text-sm text-blue-800">
                    Rebalancing involves withdrawing from one protocol and depositing into another. 
                    This process may incur gas costs and temporary exposure to market volatility.
                  </p>
                </div>
              </div>
          </div>
        </CardContent>
      </Card>

        {/* Rebalancing History */}
        <div className="mt-8">
          <RebalancingHistory />
        </div>
      </main>

      {/* Rebalancing Modal */}
      {selectedOpportunity && (
        <RebalancingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          opportunity={selectedOpportunity}
          onSuccess={handleRebalancingSuccess}
        />
      )}
    </div>
  )
}
