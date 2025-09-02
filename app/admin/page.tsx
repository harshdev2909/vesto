"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { toast } from "sonner"
import { SiteHeader } from "@/components/site-header"
import { useSmartContractDashboard } from "@/hooks/useSmartContractDashboard"

export default function AdminPage() {
  const { dashboardData, isLoading: dashboardLoading, refreshDashboard } = useSmartContractDashboard()
  const [selectedProtocol, setSelectedProtocol] = useState("")
  const [newAPY, setNewAPY] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  // Smart contract addresses
  const YIELD_AGGREGATOR_ADDRESS = process.env.NEXT_PUBLIC_YIELD_AGGREGATOR_ADDRESS || '0xd7394A378d03c09Fb6357681da0Eae43Bd1A772a'
  const MOCK_ASSET_ADDRESS = process.env.NEXT_PUBLIC_MOCK_ASSET_ADDRESS || '0xE1Db780adF29B405e4642D75b366FDa3909Cf04c'

  // Wagmi hooks for smart contract interaction
  const { writeContractAsync } = useWriteContract()

  const handleUpdateAPY = async () => {
    console.log('APY update button clicked')
    
    if (!selectedProtocol || !newAPY) {
      toast.error("Please select a protocol and enter APY value")
      return
    }

    setIsUpdating(true)
    try {
      // Convert APY percentage to basis points (multiply by 1e14)
      const apyInBasisPoints = Math.floor(parseFloat(newAPY) * 1e14)
      console.log('APY in basis points:', apyInBasisPoints)
      
      console.log('Calling writeContractAsync...')
      // Call updateAPY function on YieldAggregator contract
      const txHash = await writeContractAsync({
        address: YIELD_AGGREGATOR_ADDRESS as `0x${string}`,
        abi: [
          {
            "inputs": [
              { "name": "protocol", "type": "address" },
              { "name": "asset", "type": "address" },
              { "name": "apy", "type": "uint256" },
              { "name": "totalValueLocked", "type": "uint256" }
            ],
            "name": "updateAPY",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: "updateAPY",
        args: [
          selectedProtocol as `0x${string}`,
          MOCK_ASSET_ADDRESS as `0x${string}`,
          BigInt(apyInBasisPoints),
          BigInt(1000000000) // Default TVL
        ],
        gas: BigInt(100000) // Set reasonable gas limit
      })

      console.log('Transaction submitted successfully:', txHash)
      toast.success(`APY update transaction submitted: ${txHash}`)
      
      // Refresh dashboard data after successful update
      setTimeout(() => {
        refreshDashboard()
      }, 3000)

    } catch (error) {
      console.error("Failed to update APY:", error)
      toast.error(`Failed to update APY: ${error.message || 'Unknown error'}`)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 py-8 space-y-6 max-w-4xl mx-auto">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage protocol APY values directly on the smart contract
          </p>
        </div>

        {/* APY Management */}
        <Card>
          <CardHeader>
            <CardTitle>Update Protocol APY</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardLoading ? (
              <div className="text-center py-4">Loading protocol data...</div>
            ) : dashboardData?.allProtocols ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="protocol">Select Protocol</Label>
                  <Select value={selectedProtocol} onValueChange={setSelectedProtocol}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a protocol" />
                    </SelectTrigger>
                    <SelectContent>
                      {dashboardData.allProtocols.map((protocol: any) => (
                        <SelectItem key={protocol.protocol} value={protocol.protocol}>
                          {protocol.protocolName} (Current: {protocol.apyPercentage.toFixed(2)}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apy">New APY (%)</Label>
                  <Input
                    id="apy"
                    type="number"
                    step="0.01"
                    placeholder="Enter new APY percentage"
                    value={newAPY}
                    onChange={(e) => setNewAPY(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleUpdateAPY} 
                  disabled={isUpdating || !selectedProtocol || !newAPY}
                  className="w-full"
                >
                  {isUpdating ? "Updating APY..." : "Update APY on Smart Contract"}
                </Button>

                {selectedProtocol && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Selected Protocol Details:</h4>
                    <div className="text-sm space-y-1">
                      <div><strong>Protocol:</strong> {dashboardData.allProtocols.find((p: any) => p.protocol === selectedProtocol)?.protocolName}</div>
                      <div><strong>Address:</strong> <code className="text-xs">{selectedProtocol}</code></div>
                      <div><strong>Current APY:</strong> {dashboardData.allProtocols.find((p: any) => p.protocol === selectedProtocol)?.apyPercentage.toFixed(2)}%</div>
                      <div><strong>Asset:</strong> mUSDC</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4 text-red-500">
                Failed to load protocol data. Please check your connection.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Vault Status */}
        {dashboardData && (
          <Card>
            <CardHeader>
              <CardTitle>Current Vault Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div>
                  <div className="text-sm text-muted-foreground">Current Protocol</div>
                  <div className="font-semibold">{dashboardData.currentVault.protocolName}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {dashboardData.currentVault.protocol}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Current APY</div>
                  <div className="font-semibold text-green-600">{dashboardData.currentVault.apyPercentage.toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground">
                    {dashboardData.currentVault.apy} basis points
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground mb-2">All Available Protocols:</div>
                <div className="space-y-2">
                  {dashboardData.allProtocols.map((protocol: any) => (
                    <div key={protocol.protocol} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{protocol.protocolName}</div>
                        <div className="text-xs text-muted-foreground font-mono">{protocol.protocol}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">{protocol.apyPercentage.toFixed(2)}%</div>
                        <div className="text-xs text-muted-foreground">{protocol.apy} bps</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}