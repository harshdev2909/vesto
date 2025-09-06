"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calculator, TrendingUp, Info, Play } from "lucide-react"
import { motion } from "framer-motion"
import { useProtocolData } from "@/hooks/useProtocolData"

interface SimulationResult {
  initialAmount: number
  finalAmount: number
  totalEarnings: number
  apy: number
  days: number
}

export function SimulationMode() {
  const { protocols: protocolData, isLoading } = useProtocolData()
  const [amount, setAmount] = useState("1000")
  const [days, setDays] = useState("30")
  const [protocol, setProtocol] = useState("aave")
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  const protocols = [
    { 
      id: "aave", 
      name: "Mock Aave", 
      apy: protocolData.find(p => p.name === "Mock Aave")?.apy || 3.2, 
      color: "bg-blue-500" 
    },
    { 
      id: "compound", 
      name: "Mock Compound", 
      apy: protocolData.find(p => p.name === "Mock Compound")?.apy || 2.8, 
      color: "bg-green-500" 
    },
    { id: "hyperliquid", name: "Hyperliquid", apy: 8.5, color: "bg-purple-500", comingSoon: true },
    { id: "uniswap", name: "Uniswap V3", apy: 4.1, color: "bg-pink-500", comingSoon: true }
  ]

  const runSimulation = () => {
    setIsSimulating(true)
    
    // Simulate API call delay
    setTimeout(() => {
      const selectedProtocol = protocols.find(p => p.id === protocol)
      if (!selectedProtocol) return

      const initialAmount = parseFloat(amount)
      const apy = selectedProtocol.apy / 100
      const daysNum = parseInt(days)
      
      // Calculate compound interest
      const finalAmount = initialAmount * Math.pow(1 + apy, daysNum / 365)
      const totalEarnings = finalAmount - initialAmount

      setResult({
        initialAmount,
        finalAmount,
        totalEarnings,
        apy: selectedProtocol.apy,
        days: daysNum
      })
      setIsSimulating(false)
    }, 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Portfolio Simulation
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Try our simulation mode to see potential earnings without connecting your wallet
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Initial Amount (USDC)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="days">Time Period (Days)</Label>
              <Select value={days} onValueChange={setDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="protocol">Protocol</Label>
              <Select value={protocol} onValueChange={setProtocol}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {protocols.map((p) => (
                    <SelectItem key={p.id} value={p.id} disabled={p.comingSoon}>
                      <div className="flex items-center gap-2">
                        {p.name} ({p.apy}% APY)
                        {p.comingSoon && <Badge variant="secondary" className="text-xs">Coming Soon</Badge>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={runSimulation} 
            disabled={isSimulating || !amount}
            className="w-full"
          >
            {isSimulating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Simulating...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Simulation
              </>
            )}
          </Button>

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${result.finalAmount.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-700">Final Amount</div>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      +${result.totalEarnings.toFixed(2)}
                    </div>
                    <div className="text-sm text-blue-700">Total Earnings</div>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {result.apy}%
                    </div>
                    <div className="text-sm text-purple-700">APY</div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4" />
                  <span className="font-semibold">Simulation Results</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  If you deposited ${result.initialAmount} USDC into {protocols.find(p => p.id === protocol)?.name} 
                  for {result.days} days, you would earn ${result.totalEarnings.toFixed(2)} in yield 
                  ({(result.totalEarnings / result.initialAmount * 100).toFixed(2)}% return).
                </p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Explain Like I'm 5 Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Explain Like I'm 5
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">What is APY?</h4>
              <p className="text-sm text-muted-foreground">
                APY (Annual Percentage Yield) is like the interest rate on your savings account, 
                but much higher! If you put $100 in a 5% APY protocol, you'd have $105 after one year.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">What is Rebalancing?</h4>
              <p className="text-sm text-muted-foreground">
                Rebalancing is like automatically moving your money to the bank that offers 
                the highest interest rate. Vesto does this for you automatically!
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">What is DeFi?</h4>
              <p className="text-sm text-muted-foreground">
                DeFi (Decentralized Finance) is like traditional banking, but without banks. 
                You can lend, borrow, and earn interest directly with other people using smart contracts.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">What is TVL?</h4>
              <p className="text-sm text-muted-foreground">
                TVL (Total Value Locked) shows how much money is already in a protocol. 
                Higher TVL usually means more trusted and liquid.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
