"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Shield, DollarSign, Activity, BarChart3 } from "lucide-react"
import { motion } from "framer-motion"

interface ProtocolData {
  name: string
  apy: number
  tvl: string
  risk: "Low" | "Medium" | "High"
  audited: boolean
  description: string
  color: string
  features: string[]
  historicalApy: number[]
}

const protocols: ProtocolData[] = [
  {
    name: "Aave V3",
    apy: 3.2,
    tvl: "$2.1B",
    risk: "Low",
    audited: true,
    description: "Leading DeFi lending protocol with high liquidity",
    color: "bg-blue-500",
    features: ["Lending", "Borrowing", "Liquidity Mining", "Governance"],
    historicalApy: [3.1, 3.0, 3.2, 3.3, 3.1, 3.2, 3.2]
  },
  {
    name: "Compound V3",
    apy: 2.8,
    tvl: "$1.8B",
    risk: "Low",
    audited: true,
    description: "Algorithmic money markets with competitive rates",
    color: "bg-green-500",
    features: ["Lending", "Borrowing", "Algorithmic Rates", "Governance"],
    historicalApy: [2.9, 2.7, 2.8, 2.9, 2.8, 2.8, 2.8]
  }
]

export function ProtocolComparisonModal() {
  const [selectedProtocols, setSelectedProtocols] = useState<string[]>(["aave", "compound"])

  const protocolMap = {
    aave: protocols[0],
    compound: protocols[1]
  }

  const selectedProtocolData = selectedProtocols.map(id => protocolMap[id as keyof typeof protocolMap])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <BarChart3 className="h-4 w-4 mr-2" />
          Compare Protocols
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Protocol Comparison</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Protocol Selection */}
          <div className="flex gap-2">
            {protocols.map((protocol) => (
              <Button
                key={protocol.name}
                variant={selectedProtocols.includes(protocol.name.toLowerCase().replace(' ', '')) ? "default" : "outline"}
                onClick={() => {
                  const id = protocol.name.toLowerCase().replace(' ', '')
                  if (selectedProtocols.includes(id)) {
                    setSelectedProtocols(selectedProtocols.filter(p => p !== id))
                  } else if (selectedProtocols.length < 2) {
                    setSelectedProtocols([...selectedProtocols, id])
                  }
                }}
                className="flex-1"
              >
                {protocol.name}
              </Button>
            ))}
          </div>

          {/* Comparison Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {selectedProtocolData.map((protocol, index) => (
              <motion.div
                key={protocol.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${protocol.color}`} />
                        {protocol.name}
                      </CardTitle>
                      <Badge variant={protocol.risk === "Low" ? "default" : "secondary"}>
                        {protocol.risk} Risk
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {protocol.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {protocol.apy}%
                        </div>
                        <div className="text-xs text-green-700">Current APY</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {protocol.tvl}
                        </div>
                        <div className="text-xs text-blue-700">Total Value Locked</div>
                      </div>
                    </div>

                    {/* Historical APY Chart */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        7-Day APY Trend
                      </h4>
                      <div className="flex items-end gap-1 h-16">
                        {protocol.historicalApy.map((apy, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                            style={{ height: `${(apy / Math.max(...protocol.historicalApy)) * 100}%` }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>7 days ago</span>
                        <span>Today</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Features
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {protocol.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Security */}
                    <div className="flex items-center justify-between text-sm">
                      <span>Audited</span>
                      <Badge variant={protocol.audited ? "default" : "destructive"}>
                        {protocol.audited ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Comparison Summary */}
          {selectedProtocolData.length === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="bg-muted">
                <CardHeader>
                  <CardTitle>Comparison Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {selectedProtocolData[0].apy > selectedProtocolData[1].apy ? 
                          `${selectedProtocolData[0].name} wins` : 
                          `${selectedProtocolData[1].name} wins`
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">Higher APY</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {selectedProtocolData[0].tvl > selectedProtocolData[1].tvl ? 
                          `${selectedProtocolData[0].name} wins` : 
                          `${selectedProtocolData[1].name} wins`
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">Higher TVL</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {selectedProtocolData[0].risk === selectedProtocolData[1].risk ? 
                          "Tie" : 
                          selectedProtocolData[0].risk === "Low" ? 
                            `${selectedProtocolData[0].name} wins` : 
                            `${selectedProtocolData[1].name} wins`
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">Lower Risk</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
