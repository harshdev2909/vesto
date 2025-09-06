"use client"

import Link from "next/link"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { MintUSDCButton } from "@/components/mint-usdc-button"
import { ArrowRight } from "lucide-react"

import { DashboardV2 } from "@/components/dashboard-v2"
import { ProtocolsShowcase } from "@/components/protocols-showcase"
import { SimulationMode } from "@/components/simulation-mode"
import { useAccount } from "wagmi"

export default function HomePage() {
  const { address, isConnected } = useAccount()

  return (
    <div className="min-h-dvh flex flex-col">
      <main className="flex-1">
        {isConnected ? (
          <div className="px-6 py-8 space-y-6 max-w-6xl mx-auto">
            {/* Mint USDC Section for Testing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">🪙 Test USDC</h3>
                      <p className="text-sm text-blue-700">
                        Mint test USDC tokens for testing the platform (max 1000 USDC per transaction)
                      </p>
                    </div>
                    <MintUSDCButton 
                      amount="1000" 
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <DashboardV2 />
          </div>
        ) : (
          <div className="px-6 py-8 space-y-6 max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Vesto
                </h1>
                <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
                  Automatically route your funds to the highest yielding protocols. 
                  Maximize your returns with intelligent rebalancing.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <ConnectWalletButton />
              </motion.div>
            </div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl mb-2"></div>
                  <h3 className="text-lg font-semibold mb-2">Auto-Rebalancing</h3>
                  <p className="text-muted-foreground">
                    Automatically move your funds to the highest yielding protocols using Chainlink Keepers.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl mb-2"></div>
                  <h3 className="text-lg font-semibold mb-2">Real-time Data</h3>
                  <p className="text-muted-foreground">
                    All data is fetched directly from smart contracts in real-time with React Query.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl mb-2"></div>
                  <h3 className="text-lg font-semibold mb-2">Secure & Transparent</h3>
                  <p className="text-muted-foreground">
                    Your funds are secured by audited smart contracts on Arbitrum.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* How it Works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-6 text-center">How Vesto Works</h2>
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">1️</span>
                      </div>
                      <h3 className="font-semibold mb-2">Deposit Assets</h3>
                      <p className="text-sm text-muted-foreground">
                        Deposit your USDC and receive aYRT receipt tokens representing your share
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">2️</span>
                      </div>
                      <h3 className="font-semibold mb-2">Auto-Route</h3>
                      <p className="text-sm text-muted-foreground">
                        Your funds are automatically routed to the highest yielding protocol
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">3️</span>
                      </div>
                      <h3 className="font-semibold mb-2">Earn & Rebalance</h3>
                      <p className="text-sm text-muted-foreground">
                        Earn yield and automatically rebalance when better opportunities arise
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Protocols Showcase */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <ProtocolsShowcase />
            </motion.div>

            {/* Simulation Mode */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <SimulationMode />
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="text-center"
            >
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-semibold mb-4">Ready to Start Earning?</h2>
                  <p className="text-muted-foreground mb-6">
                    Connect your wallet and start earning the best yields automatically
                  </p>
                  <ConnectWalletButton />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}