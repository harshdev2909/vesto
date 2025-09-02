"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAssets, useDashboardData } from "@/hooks/useBackendData"
import { useWallet } from "@/hooks/useWallet"
import { useYieldAggregator } from "@/hooks/useYieldAggregator"
import { useAYRTBalance } from "@/hooks/useAYRTBalance"
import { useUserTransactions } from "@/hooks/useUserTransactions"
import { SiteHeader } from "@/components/site-header"
import { ArrowLeft, ArrowRight, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function WithdrawPage() {
  const { address: walletAddress, isConnected } = useWallet()
  const { dashboardData, isLoading: dashboardLoading } = useDashboardData(walletAddress || '')
  const { assets, isLoading: assetsLoading } = useAssets()
  const { withdraw, isWithdrawing: isWithdrawingFromHook } = useYieldAggregator()
  const { balance: aYRTBalance, isLoading: aYRTBalanceLoading } = useAYRTBalance()
  const { transactions: withdrawalTransactions, isLoading: transactionsLoading, refetch: refetchTransactions } = useUserTransactions('withdraw', 10)
  const { toast } = useToast()
  
  const [selectedPosition, setSelectedPosition] = useState<string>("")
  const [withdrawAmount, setWithdrawAmount] = useState<string>("")
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  // Get user's positions for withdrawal
  const userPositions = dashboardData?.userPositions || []
  
  // Find the selected position
  const selectedPositionData = userPositions.find((pos: any) => pos._id === selectedPosition)
  const selectedAsset = selectedPositionData ? assets?.find((a: any) => a.address === selectedPositionData.assetAddress) : null
  
  // Calculate equivalent asset amount based on current aYRT balance and exchange rate
  const calculateEquivalentAssetAmount = (aYRTAmount: number) => {
    if (!selectedPositionData || !selectedAsset || !aYRTAmount) return 0
    
    // Get the total deposited amount for this position (in asset tokens)
    const totalDeposited = Number(selectedPositionData.amount) / Math.pow(10, selectedAsset.decimals)
    
    // Get the current total aYRT balance
    const currentTotalAYRT = parseFloat(aYRTBalance) || 0
    
    if (currentTotalAYRT === 0) return 0
    
    // Calculate current exchange rate: asset tokens per aYRT
    // This accounts for any yield that has been earned
    const currentExchangeRate = totalDeposited / currentTotalAYRT
    
    // Calculate equivalent asset amount based on current exchange rate
    return aYRTAmount * currentExchangeRate
  }

  // Calculate aYRT amount from USDC amount (reverse calculation)
  const calculateAYRTFromUSDC = (usdcAmount: number) => {
    if (!selectedPositionData || !selectedAsset || !usdcAmount) return 0
    
    // Get the total deposited amount for this position (in asset tokens)
    const totalDeposited = Number(selectedPositionData.amount) / Math.pow(10, selectedAsset.decimals)
    
    // Get the current total aYRT balance
    const currentTotalAYRT = parseFloat(aYRTBalance) || 0
    
    if (currentTotalAYRT === 0) return 0
    
    // Calculate current exchange rate: asset tokens per aYRT
    const currentExchangeRate = totalDeposited / currentTotalAYRT
    
    // Calculate aYRT amount from USDC amount
    return usdcAmount / currentExchangeRate
  }

  // Calculate max withdrawable amount (receipt tokens) - use real-time balance
  const maxWithdrawableAYRT = parseFloat(aYRTBalance) || 0
  
  // Calculate max withdrawable amount in USDC
  const maxWithdrawableUSDC = selectedPositionData && selectedAsset ? 
    calculateEquivalentAssetAmount(maxWithdrawableAYRT) : 0

  // Calculate the current exchange rate for display
  const getCurrentExchangeRate = () => {
    if (!selectedPositionData || !selectedAsset) return 0
    
    const totalDeposited = Number(selectedPositionData.amount) / Math.pow(10, selectedAsset.decimals)
    const currentTotalAYRT = parseFloat(aYRTBalance) || 0
    
    if (currentTotalAYRT === 0) return 0
    
    return totalDeposited / currentTotalAYRT
  }

  // Calculate yield earned (if any)
  const getYieldEarned = () => {
    if (!selectedPositionData || !selectedAsset) return 0
    
    const totalDeposited = Number(selectedPositionData.amount) / Math.pow(10, selectedAsset.decimals)
    const currentTotalAYRT = parseFloat(aYRTBalance) || 0
    
    if (currentTotalAYRT === 0) return 0
    
    // If aYRT balance is greater than the original deposit, there's yield
    const originalAYRT = totalDeposited // Assuming 1:1 ratio at deposit
    const yieldEarned = currentTotalAYRT - originalAYRT
    
    return Math.max(0, yieldEarned)
  }

  const handleWithdraw = async () => {
    if (!isConnected || !walletAddress) {
      toast({ title: "Error", description: "Please connect your wallet first" })
      return
    }

    if (!selectedPositionData) {
      toast({ title: "Error", description: "Please select a position to withdraw from" })
      return
    }

    const usdcAmount = parseFloat(withdrawAmount)
    if (isNaN(usdcAmount) || usdcAmount <= 0) {
      toast({ title: "Error", description: "Please enter a valid withdrawal amount" })
      return
    }

    if (usdcAmount > maxWithdrawableUSDC) {
      toast({ title: "Error", description: `Maximum withdrawable: ${maxWithdrawableUSDC.toFixed(6)} ${selectedAsset?.symbol}` })
      return
    }

    setIsWithdrawing(true)
    try {
      // Convert USDC amount to aYRT amount
      const aYRTAmount = calculateAYRTFromUSDC(usdcAmount)
      
      // Convert aYRT amount to BigInt (receipt tokens are typically 18 decimals)
      const withdrawAmountBigInt = BigInt(Math.floor(aYRTAmount * Math.pow(10, 18)))
      
      // Call the actual withdraw function
      const success = await withdraw(selectedPositionData.assetAddress, withdrawAmountBigInt)
      
      if (success) {
        toast({ 
          title: "Withdrawal Successful!", 
          description: `Successfully withdrew ${usdcAmount.toFixed(6)} ${selectedAsset?.symbol}` 
        })
        
        // Reset form
        setWithdrawAmount("")
        setSelectedPosition("")
        
        // Trigger a refresh of the dashboard data to show updated balances
        window.dispatchEvent(new CustomEvent('refreshDashboard'))
        
        // Refresh withdrawal transactions to show the new transaction
        refetchTransactions()
      }
      
    } catch (error) {
      console.error('Withdrawal error:', error)
      toast({ title: "Withdrawal Failed", description: "Please try again" })
    } finally {
      setIsWithdrawing(false)
    }
  }

  const handleMaxWithdraw = () => {
    setWithdrawAmount(maxWithdrawableUSDC.toString())
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 py-8 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          {/* <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </Button> */}
          <div>
            <h1 className="text-3xl font-bold">Withdraw Funds</h1>
            <p className="text-muted-foreground">Withdraw your assets from the yield aggregator</p>
          </div>
        </div>

        {/* Withdrawal Form */}
        <Card>
          <CardHeader>
            <CardTitle>Withdraw Position</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isConnected ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Wallet Not Connected</h3>
                <p className="text-muted-foreground mb-4">Please connect your wallet to view and withdraw your positions.</p>
                <Button asChild>
                  <Link href="/">Connect Wallet</Link>
                </Button>
              </div>
            ) : dashboardLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your positions...</p>
              </div>
            ) : userPositions.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Positions Found</h3>
                <p className="text-muted-foreground mb-4">You don't have any positions to withdraw from.</p>
                <Button asChild>
                  <Link href="/">Make a Deposit</Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Position Selection */}
                <div className="space-y-2">
                  <Label htmlFor="position">Select Position</Label>
                  <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a position to withdraw from" />
                    </SelectTrigger>
                    <SelectContent>
                      {userPositions.map((position: any) => {
                        const asset = assets?.find((a: any) => a.address === position.assetAddress)
                        const amountInTokens = asset ? 
                          (Number(position.amount) / Math.pow(10, asset.decimals)) : 0
                        
                        return (
                          <SelectItem key={position._id} value={position._id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{asset?.symbol || 'Unknown'} - {amountInTokens.toFixed(6)} tokens</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                {aYRTBalanceLoading ? 'Loading...' : `${parseFloat(aYRTBalance).toFixed(15)} aYRT`}
                              </span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Position Details */}
                {selectedPositionData && selectedAsset && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Asset</div>
                          <div className="font-semibold">{selectedAsset.symbol}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Deposited Amount</div>
                          <div className="font-semibold">
                            {(() => {
                              if (!selectedPositionData || !selectedAsset) return '0'
                              const amount = Number(selectedPositionData.amount)
                              if (isNaN(amount) || amount === null || amount === undefined) {
                                return 'Invalid amount'
                              }
                              return (amount / Math.pow(10, selectedAsset.decimals)).toFixed(6)
                            })()} {selectedAsset?.symbol}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Receipt Tokens</div>
                          <div className="font-semibold text-green-600">
                            {aYRTBalanceLoading ? 'Loading...' : `${maxWithdrawableAYRT.toFixed(15)} aYRT`}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Withdrawal Amount */}
                {selectedPosition && (
                  <div className="space-y-2">
                    <Label htmlFor="amount">Withdrawal Amount ({selectedAsset?.symbol})</Label>
                    <div className="flex gap-2">
                      <Input
                        id="amount"
                        type="number"
                        placeholder={`Enter amount to withdraw in ${selectedAsset?.symbol}`}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        min="0"
                        max={maxWithdrawableUSDC}
                        step="0.000001"
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleMaxWithdraw}
                        disabled={maxWithdrawableUSDC === 0}
                      >
                        Max
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Maximum withdrawable: {aYRTBalanceLoading ? 'Loading...' : `${maxWithdrawableUSDC.toFixed(6)} ${selectedAsset?.symbol}`}
                    </div>
                  </div>
                )}

                {/* Withdrawal Info */}
                {selectedPosition && withdrawAmount && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-blue-900">Withdrawal Summary</h4>
                        <div className="text-sm text-blue-800">
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-blue-600 mb-1">Withdrawing</div>
                                <div className="font-semibold">{parseFloat(withdrawAmount).toFixed(6)} {selectedAsset?.symbol}</div>
                              </div>
                              <div>
                                <div className="text-xs text-blue-600 mb-1">Equivalent aYRT to burn</div>
                                <div className="font-semibold">{calculateAYRTFromUSDC(parseFloat(withdrawAmount)).toFixed(15)} aYRT</div>
                              </div>
                            </div>
                            
                            <div className="border-t border-blue-200 pt-2 space-y-2">
                              <div>
                                <div className="text-xs text-blue-600 mb-1">Current Exchange Rate</div>
                                <div className="text-sm">
                                  1 {selectedAsset?.symbol} = {(1 / getCurrentExchangeRate()).toFixed(15)} aYRT
                                </div>
                              </div>
                              
                              {getYieldEarned() > 0 && (
                                <div>
                                  <div className="text-xs text-green-600 mb-1">Yield Earned</div>
                                  <div className="text-sm text-green-700 font-semibold">
                                    +{getYieldEarned().toFixed(15)} aYRT
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {aYRTBalanceLoading && (
                              <div className="text-xs text-blue-600 italic">* Calculating based on current balance...</div>
                            )}
                          </div>
                          
                          <div className="text-xs mt-3 p-2 bg-blue-100 rounded">
                            <strong>Note:</strong> You're entering the amount in {selectedAsset?.symbol}. The system will automatically calculate and burn the equivalent aYRT tokens. 
                            The final amount may vary based on current protocol conditions, accrued yield, and any fees.
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Withdraw Button */}
                <Button 
                  onClick={handleWithdraw}
                  disabled={!selectedPosition || !withdrawAmount || isWithdrawing}
                  className="w-full"
                  size="lg"
                >
                  {isWithdrawing ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Processing Withdrawal...
                    </>
                  ) : (
                    <>
                      Withdraw Funds
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Withdrawal History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Wallet Not Connected</h3>
                <p className="text-muted-foreground">Please connect your wallet to view your withdrawal history.</p>
              </div>
            ) : transactionsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading withdrawal history...</p>
              </div>
            ) : withdrawalTransactions.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Withdrawals Found</h3>
                <p className="text-muted-foreground">You haven't made any withdrawals yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawalTransactions.map((transaction: any) => {
                  const asset = assets?.find((a: any) => a.address === transaction.assetAddress)
                  const amount = Number(transaction.amount)
                  const amountInTokens = asset && !isNaN(amount) ? 
                    (amount / Math.pow(10, asset.decimals)) : 0
                  
                  return (
                    <div key={transaction._id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="font-semibold text-red-600">Withdrawal</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(transaction.executedAt).toLocaleDateString()} at {new Date(transaction.executedAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Amount</div>
                              <div className="font-semibold">
                                {amountInTokens.toFixed(6)} {asset?.symbol || 'tokens'}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Gas Used</div>
                              <div className="font-semibold">
                                {transaction.gasUsed?.toLocaleString() || 'N/A'} gas
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Block</div>
                              <div className="font-semibold">
                                #{transaction.blockNumber?.toLocaleString() || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground mb-1">Transaction Hash</div>
                            <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                              {transaction.transactionHash ? 
                                `${transaction.transactionHash.slice(0, 10)}...${transaction.transactionHash.slice(-8)}` : 
                                'N/A'
                              }
                            </div>
                            {transaction.transactionHash && (
                              <a 
                                href={`https://sepolia.arbiscan.io/tx/${transaction.transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
                              >
                                View on Arbiscan →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>How Withdrawals Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Receipt Tokens (aYRT)</h4>
                <p className="text-sm text-muted-foreground">
                  When you deposit, you receive aYRT tokens representing your share. 
                  To withdraw, you burn these tokens to get back your original assets plus any earned yield.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Automatic Routing</h4>
                <p className="text-sm text-muted-foreground">
                  If your funds are in the Yield Router, they will be automatically 
                  withdrawn from the current protocol and returned to you.
                </p>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900">Important Note</h4>
                  <p className="text-sm text-yellow-800">
                    Withdrawals are processed immediately. The final amount you receive 
                    may vary slightly based on current protocol conditions and any accrued fees.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
