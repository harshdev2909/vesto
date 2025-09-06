"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Zap, Target, BarChart3, AlertCircle } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useAccount } from "wagmi"
import { useBestYield } from "@/hooks/useOnChainData"
import { useVaultData } from "@/hooks/useVaultData"

interface FundingRate {
  rate: number
  timestamp: number
}

interface BalanceProjection {
  month: string
  baseYield: number
  hyperzoneYield: number
  totalYield: number
}

export function HyperZone() {
  const { isConnected, address } = useAccount()
  const { data: bestYield, isLoading: yieldLoading } = useBestYield("0xE1Db3C7c22333C22333C22333C22333C22333f04c")
  const { vaultData, isLoading: vaultLoading } = useVaultData()
  
  const [fundingRate, setFundingRate] = useState<FundingRate>({ rate: 0, timestamp: Date.now() })
  const [allocation, setAllocation] = useState([50]) // 50% default allocation
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isComingSoon, setIsComingSoon] = useState(true) // Coming soon simulation mode

  // Mock funding rate generator
  const generateMockFundingRate = (): FundingRate => {
    // Random rate between -5% to +20% APY
    const rate = (Math.random() - 0.2) * 0.25 // -5% to +20%
    return {
      rate: Number(rate.toFixed(4)),
      timestamp: Date.now()
    }
  }

  // Update funding rate every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFundingRate(generateMockFundingRate())
    }, 10000)

    // Set initial rate
    setFundingRate(generateMockFundingRate())

    return () => clearInterval(interval)
  }, [])

  // Calculate APY values - use actual current vault APY
  const baseAPY = useMemo(() => {
    // First try to get from vault data (current user's APY)
    if (vaultData?.currentVault?.apyPercentage) {
      return vaultData.currentVault.apyPercentage
    }
    // Fallback to best yield if no vault data
    if (yieldLoading || !bestYield?.apyFormatted) return 0
    return parseFloat(bestYield.apyFormatted)
  }, [vaultData, bestYield, yieldLoading])

  const fundingAPY = useMemo(() => {
    return fundingRate.rate * 100 // Convert to percentage
  }, [fundingRate.rate])

  const totalAPY = useMemo(() => {
    const allocationPercent = allocation[0] / 100
    return baseAPY + (fundingAPY * allocationPercent)
  }, [baseAPY, fundingAPY, allocation])

  // Generate balance projection data
  const balanceProjection = useMemo((): BalanceProjection[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const data: BalanceProjection[] = []
    
    let baseBalance = 10000 // Starting with $10k
    let hyperzoneBalance = 10000
    
    months.forEach((month, index) => {
      const baseYield = baseBalance * (baseAPY / 100) / 12
      const hyperzoneYield = hyperzoneBalance * (totalAPY / 100) / 12
      
      baseBalance += baseYield
      hyperzoneBalance += hyperzoneYield
      
      data.push({
        month,
        baseYield: baseBalance,
        hyperzoneYield: hyperzoneBalance,
        totalYield: hyperzoneBalance
      })
    })
    
    return data
  }, [baseAPY, totalAPY])

  const handleEnableHyperZone = () => {
    console.log("Enable HyperZone clicked - would open Hyperliquid integration")
    setIsModalOpen(true)
  }

  const isPositiveFunding = fundingAPY > 0
  const allocationPercent = allocation[0]

  if (!isConnected) {
    return (
      <div className="min-h-dvh flex flex-col">
        <main className="flex-1 px-6 py-8 space-y-6 max-w-6xl mx-auto">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              HyperZone
            </h1>
            <p className="text-xl text-muted-foreground">
              Funding Yield Booster
            </p>
            <p className="text-muted-foreground">
              Connect your wallet to access HyperZone funding rate simulation
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <main className="flex-1 px-6 py-8 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                HyperZone
              </h1>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                Coming Soon
              </Badge>
            </div>
            <p className="text-xl text-muted-foreground">
              Funding Yield Booster
            </p>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Simulate additional yield from Hyperliquid perps. Combine your base yield with funding rate opportunities.
            </p>
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Simulation Mode:</strong> This is a preview of the upcoming HyperZone feature. 
                All data is simulated and for demonstration purposes only.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Base APY */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Base APY</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                key={baseAPY}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-3xl font-bold text-green-600"
              >
                {(vaultLoading || yieldLoading) ? '...' : `${baseAPY.toFixed(2)}%`}
              </motion.div>
              <p className="text-xs text-muted-foreground mt-1">
                {vaultData?.currentVault?.protocolName ? 
                  `From ${vaultData.currentVault.protocolName}` : 
                  'From Vesto protocols'
                }
              </p>
            </CardContent>
          </Card>

          {/* Funding Rate */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                Simulated Funding Rate
                <Badge variant="outline" className="text-xs">Simulation</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                key={fundingAPY}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`text-3xl font-bold flex items-center gap-2 ${
                  isPositiveFunding ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isPositiveFunding ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                {fundingAPY.toFixed(2)}%
              </motion.div>
              <p className="text-xs text-muted-foreground mt-1">Hyperliquid perps (simulated)</p>
            </CardContent>
          </Card>

          {/* Total APY */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                Projected Total APY
                <Badge variant="outline" className="text-xs">Simulation</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                key={totalAPY}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-3xl font-bold text-blue-600 flex items-center gap-2"
              >
                <Zap className="h-6 w-6" />
                {totalAPY.toFixed(2)}%
              </motion.div>
              <p className="text-xs text-muted-foreground mt-1">
                {allocationPercent}% allocation (simulated)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Allocation Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Simulated Allocation Strategy
              <Badge variant="outline" className="text-xs">Simulation</Badge>
            </CardTitle>
            <CardDescription>
              Simulate what percentage of your funds would be allocated to HyperZone strategy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">HyperZone Allocation</span>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {allocationPercent}%
                </Badge>
              </div>
              <Slider
                value={allocation}
                onValueChange={setAllocation}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Base Strategy</h4>
                <p className="text-2xl font-bold text-green-600">
                  {baseAPY.toFixed(2)}% APY
                </p>
                <p className="text-xs text-muted-foreground">
                  {(100 - allocationPercent).toFixed(0)}% of funds
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">HyperZone Strategy</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {totalAPY.toFixed(2)}% APY
                </p>
                <p className="text-xs text-muted-foreground">
                  {allocationPercent}% of funds
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance Projection Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Simulated Balance Growth
              <Badge variant="outline" className="text-xs">Simulation</Badge>
            </CardTitle>
            <CardDescription>
              Simulated 12-month balance growth comparison (for demonstration only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={balanceProjection}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `$${Number(value).toLocaleString()}`, 
                      name === 'baseYield' ? 'Base Strategy' : 'HyperZone Strategy'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="baseYield" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="baseYield"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="hyperzoneYield" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="hyperzoneYield"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Coming Soon: HyperZone Integration</h3>
                <p className="text-muted-foreground">
                  This simulation shows the potential of combining your current yield with funding rate strategies
                </p>
              </div>
              
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    onClick={handleEnableHyperZone}
                    disabled={isComingSoon}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {isComingSoon ? 'Coming Soon' : 'Enable HyperZone'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      HyperZone Coming Soon
                    </DialogTitle>
                    <DialogDescription className="text-left space-y-3">
                      <p>
                        HyperZone is currently in development and will be available soon. This simulation shows the potential of combining your current yield with funding rate strategies.
                      </p>
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">What's Coming:</h4>
                        <ul className="text-sm space-y-1 text-blue-700 dark:text-blue-300">
                          <li>• Direct integration with Hyperliquid protocol</li>
                          <li>• Automated long/short positions to capture funding rates</li>
                          <li>• Smart rebalancing based on funding rate changes</li>
                          <li>• Additional yield on top of your current {baseAPY.toFixed(2)}% APY</li>
                          <li>• Risk management and position sizing controls</li>
                        </ul>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                        <p className="text-sm text-orange-800 dark:text-orange-200">
                          <strong>Stay tuned!</strong> We'll notify you when HyperZone becomes available for your account.
                        </p>
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
