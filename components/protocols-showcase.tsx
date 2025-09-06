"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TrendingUp, Shield, DollarSign, Activity, BarChart3, Clock, Users } from "lucide-react"
import { motion } from "framer-motion"
import { ProtocolComparisonModal } from "@/components/protocol-comparison-modal"
import { useProtocolData } from "@/hooks/useProtocolData"
import { usePlatformStats } from "@/hooks/usePlatformStats"

interface Protocol {
  name: string
  apy: number
  tvl: string
  risk: "Low" | "Medium" | "High"
  audited: boolean
  description: string
  color: string
  comingSoon?: boolean
}

export function ProtocolsShowcase() {
  const { protocols, isLoading } = useProtocolData()
  const { stats, isLoading: statsLoading } = usePlatformStats()
  return (
    <div className="space-y-8">
      {/* Live Stats Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-semibold mb-2">Live Platform Stats</h3>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>
                  Total Deposited: {statsLoading ? (
                    <span className="animate-pulse bg-blue-400 rounded w-16 h-4 inline-block"></span>
                  ) : (
                    `$${stats.totalDeposited.toLocaleString()}`
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span>
                  Active Users: {statsLoading ? (
                    <span className="animate-pulse bg-blue-400 rounded w-8 h-4 inline-block"></span>
                  ) : (
                    stats.activeUsers
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>
                  Avg APY: {statsLoading ? (
                    <span className="animate-pulse bg-blue-400 rounded w-12 h-4 inline-block"></span>
                  ) : (
                    `${stats.avgAPY}%`
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              Earn up to {statsLoading ? (
                <span className="animate-pulse bg-blue-400 rounded w-20 h-8 inline-block"></span>
              ) : (
                `${stats.maxAPY}% APY`
              )}
            </div>
            <div className="text-sm opacity-90">on USDC right now</div>
          </div>
        </div>
      </motion.div>

      {/* Protocols Grid */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Supported Protocols</h2>
          <p className="text-muted-foreground">
            Choose from the best DeFi protocols with competitive yields
          </p>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                    <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            protocols.map((protocol, index) => (
            <motion.div
              key={protocol.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{protocol.name}</CardTitle>
                    <div className={`w-3 h-3 rounded-full ${protocol.color}`} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {protocol.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">APY</div>
                      <div className="font-semibold text-green-600">
                        {protocol.apy}%
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">TVL</div>
                      <div className="font-semibold">{protocol.tvl}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Risk: {protocol.risk}</span>
                    </div>
                    {protocol.audited && (
                      <Badge variant="secondary" className="text-xs">
                        Audited
                      </Badge>
                    )}
                  </div>

                  {protocol.comingSoon ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <Clock className="h-4 w-4 mr-2" />
                          Coming Soon
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${protocol.color}`} />
                            {protocol.name} - Coming Soon
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="text-center py-8">
                            <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Coming Soon!</h3>
                            <p className="text-muted-foreground">
                              We're working hard to integrate {protocol.name} into Vesto. 
                              Stay tuned for updates!
                            </p>
                          </div>
                          <div className="bg-muted p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">What to expect:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Real-time APY data from {protocol.name}</li>
                              <li>• Automated rebalancing integration</li>
                              <li>• Enhanced yield optimization</li>
                              <li>• Full protocol compatibility</li>
                            </ul>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${protocol.color}`} />
                            {protocol.name} - Protocol Details
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="grid gap-4 md:grid-cols-3">
                            <Card className="bg-green-50 border-green-200">
                              <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-green-600">
                                  {protocol.apy}%
                                </div>
                                <div className="text-sm text-green-700">Current APY</div>
                              </CardContent>
                            </Card>
                            <Card className="bg-blue-50 border-blue-200">
                              <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                  {protocol.tvl}
                                </div>
                                <div className="text-sm text-blue-700">Total Value Locked</div>
                              </CardContent>
                            </Card>
                            <Card className="bg-purple-50 border-purple-200">
                              <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                  {protocol.risk}
                                </div>
                                <div className="text-sm text-purple-700">Risk Level</div>
                              </CardContent>
                            </Card>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Description</h4>
                              <p className="text-muted-foreground">{protocol.description}</p>
                            </div>
                            
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Audited</span>
                                <Badge variant={protocol.audited ? "default" : "destructive"}>
                                  {protocol.audited ? "Yes" : "No"}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Status</span>
                                <Badge variant="default">Active</Badge>
                              </div>
                            </div>
                            
                            <div className="bg-muted p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">Features</h4>
                              <div className="grid gap-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4" />
                                  <span>Smart contract security</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4" />
                                  <span>Competitive yields</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  <span>Community governance</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            </motion.div>
            ))
          )}
        </div>

        {/* Protocol Comparison */}
        <div className="text-center">
          <ProtocolComparisonModal />
        </div>
      </div>

      {/* Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: "deposited", amount: "50 USDC", protocol: "Aave V3", time: "2 mins ago" },
                { action: "withdrew", amount: "25 USDC", protocol: "Compound V3", time: "5 mins ago" },
                { action: "deposited", amount: "100 USDC", protocol: "Hyperliquid", time: "8 mins ago" },
                { action: "rebalanced", amount: "75 USDC", protocol: "Aave V3 → Compound V3", time: "12 mins ago" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">
                      User {activity.action} {activity.amount} into {activity.protocol}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
