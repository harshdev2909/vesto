
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Shield, Zap, TrendingUp, Users, Globe } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <main className="flex-1 px-6 py-10 max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            About Vesto
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The next-generation yield aggregator that automatically routes your assets to the highest-yielding protocols on Arbitrum.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Badge variant="secondary" className="px-3 py-1">
              <Zap className="w-3 h-3 mr-1" />
              Auto-Rebalancing
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Shield className="w-3 h-3 mr-1" />
              Audited Protocols
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              Optimized APY
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Globe className="w-3 h-3 mr-1" />
              Arbitrum Native
            </Badge>
          </div>
        </div>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">How Vesto Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold">Deposit Assets</h3>
                <p className="text-sm text-muted-foreground">
                  Deposit your mUSDC tokens into Vesto's smart contracts. You receive aYRT (Arbitrum Yield Receipt Tokens) representing your share.
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-purple-600 font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold">Auto-Routing</h3>
                <p className="text-sm text-muted-foreground">
                  Our Yield Router automatically identifies and routes your funds to the highest-yielding protocol (Aave, Compound, or Lido).
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-green-600 font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold">Earn & Rebalance</h3>
                <p className="text-sm text-muted-foreground">
                  Earn optimal yields while our system continuously monitors and rebalances to maintain the best APY across protocols.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supported Protocols */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Supported Protocols</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">A</span>
                  </div>
                  <h3 className="font-semibold">Mock Aave</h3>
                </div>
                <p className="text-sm text-muted-foreground">Lending protocol offering competitive yields on mUSDC deposits.</p>
                <div className="text-xs text-green-600 font-medium">Current APY: 5.00%</div>
              </div>
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">C</span>
                  </div>
                  <h3 className="font-semibold">Mock Compound</h3>
                </div>
                <p className="text-sm text-muted-foreground">Algorithmic money markets with dynamic interest rates.</p>
                <div className="text-xs text-green-600 font-medium">Current APY: 7.00%</div>
              </div>
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-sm">L</span>
                  </div>
                  <h3 className="font-semibold">Mock Lido</h3>
                </div>
                <p className="text-sm text-muted-foreground">Liquid staking protocol for Ethereum and other assets.</p>
                <div className="text-xs text-green-600 font-medium">Current APY: 3.00%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Automatic Rebalancing</h3>
                    <p className="text-sm text-muted-foreground">
                      Chainlink Keepers monitor APY changes and automatically rebalance your funds to the highest-yielding protocol.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Audited Security</h3>
                    <p className="text-sm text-muted-foreground">
                      All smart contracts are audited and use battle-tested protocols. Your funds are protected by industry best practices.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Optimized Yields</h3>
                    <p className="text-sm text-muted-foreground">
                      Our algorithm continuously optimizes for the best APY, ensuring you always earn the maximum possible returns.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">User-Friendly</h3>
                    <p className="text-sm text-muted-foreground">
                      Simple deposit interface with real-time portfolio tracking. No complex DeFi knowledge required.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Arbitrum Native</h3>
                    <p className="text-sm text-muted-foreground">
                      Built specifically for Arbitrum Sepolia with low gas fees and fast transactions.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Seamless Withdrawals</h3>
                    <p className="text-sm text-muted-foreground">
                      Withdraw your funds anytime with aYRT tokens. No lock-up periods or complex exit procedures.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">How do deposits work?</h3>
                <p className="text-muted-foreground">
                  Simply deposit your mUSDC tokens through our interface. You'll receive aYRT (Arbitrum Yield Receipt Tokens) 
                  representing your share of the yield pool. The system automatically routes your funds to the highest-yielding protocol.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What is aYRT?</h3>
                <p className="text-muted-foreground">
                  aYRT (Arbitrum Yield Receipt Tokens) are ERC-20 tokens that represent your share in the yield aggregator. 
                  They accrue value as the underlying protocols generate yield, and can be redeemed for your original deposit plus earned interest.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How often does rebalancing occur?</h3>
                <p className="text-muted-foreground">
                  Our Chainlink Keepers monitor APY changes across protocols. Rebalancing occurs automatically when a new protocol 
                  offers significantly higher yields (typically 0.5%+ difference) and the gas costs are justified.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Are my funds safe?</h3>
                <p className="text-muted-foreground">
                  Yes. Vesto uses audited smart contracts and only integrates with well-established protocols like Aave, Compound, and Lido. 
                  Your funds are protected by the same security measures as these individual protocols.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What are the fees?</h3>
                <p className="text-muted-foreground">
                  Vesto charges a small performance fee (typically 10% of earned yield) to cover operational costs and incentivize 
                  optimal rebalancing. There are no deposit or withdrawal fees.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Can I withdraw anytime?</h3>
                <p className="text-muted-foreground">
                  Yes, you can withdraw your funds at any time by burning your aYRT tokens. The system will calculate your share 
                  of the total pool value and return your original deposit plus any earned yield.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Technical Architecture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Smart Contracts</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• YieldAggregator: Main deposit/withdrawal contract</li>
                  <li>• YieldRouter: Protocol routing and rebalancing logic</li>
                  <li>• ReceiptToken: aYRT token implementation</li>
                  <li>• MockERC20: Test token for mUSDC</li>
                </ul>
        </div>
        <div>
                <h3 className="font-semibold mb-2">Infrastructure</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Chainlink Keepers: Automated rebalancing</li>
                  <li>• MongoDB: User positions and transaction history</li>
                  <li>• Next.js: Frontend and API routes</li>
                  <li>• Wagmi v2: Wallet integration</li>
                </ul>
              </div>
            </div>
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Network Information</h3>
              <div className="text-sm text-muted-foreground">
                <p><strong>Network:</strong> Arbitrum Sepolia Testnet</p>
                <p><strong>Chain ID:</strong> 421614</p>
                <p><strong>RPC URL:</strong> https://sepolia-rollup.arbitrum.io/rpc</p>
                <p><strong>Block Explorer:</strong> https://sepolia.arbiscan.io/</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center space-y-4 py-8">
          <h2 className="text-2xl font-semibold">Ready to Start Earning?</h2>
          <p className="text-muted-foreground">
            Join Vesto and let us optimize your yield farming strategy automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a 
              href="/dashboard" 
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
            <a 
              href="/" 
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Make a Deposit
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
