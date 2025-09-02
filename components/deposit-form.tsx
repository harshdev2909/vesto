"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from "@/hooks/useWallet"
import { useAssets } from "@/hooks/useBackendData"
import { useYieldAggregator } from "@/hooks/useYieldAggregator"
import { parseUnits } from "viem"

export function DepositForm() {
  const [amount, setAmount] = useState("")
  const [selectedAsset, setSelectedAsset] = useState("")
  const [selectedAssetAddress, setSelectedAssetAddress] = useState("")
  const [selectedAssetDecimals, setSelectedAssetDecimals] = useState(0) // Start with 0 to force selection
  const { address, isConnected } = useWallet()
  const { assets, isLoading: assetsLoading } = useAssets()
  const { toast } = useToast()
  const { 
    depositWithApproval, 
    isApproving, 
    isDepositing, 
    approveTxHash, 
    depositTxHash,
    isApproveSuccess,
    isDepositSuccess 
  } = useYieldAggregator()

  // Debug logging
  console.log('DepositForm - assets:', assets)
  console.log('DepositForm - assetsLoading:', assetsLoading)

  const handleDeposit = async () => {
    console.log('🚀 Deposit button clicked!')
    console.log('📊 Form data:', { amount, selectedAsset, selectedAssetAddress, selectedAssetDecimals })
    
    if (!isConnected) {
      toast({ title: "Wallet not connected", description: "Please connect your wallet first" })
      return
    }

    if (!amount || !selectedAsset || !selectedAssetAddress || !selectedAssetDecimals) {
      toast({ title: "Missing information", description: "Please select an asset and enter amount" })
      return
    }

    const amountNum = parseFloat(amount)
    if (amountNum <= 0) {
      toast({ title: "Invalid amount", description: "Amount must be greater than 0" })
      return
    }

    if (amountNum < 1.0) {
      toast({ title: "Amount too small", description: "Minimum deposit amount is 1.0 mUSDC" })
      return
    }

    // Test with a simple, known amount first
    if (amountNum === 0.1) {
      console.log('🧪 Testing with 0.1 amount...')
      // For 6 decimals: 0.1 * 10^6 = 100,000
      const expectedWei = 100000n
      const manualCalc = BigInt(Math.floor(0.1 * Math.pow(10, 6)))
      console.log('🧮 Expected wei for 0.1 with 6 decimals:', expectedWei.toString())
      console.log('🧮 Manual calculation result:', manualCalc.toString())
      console.log('🧮 Match?', expectedWei === manualCalc)
    }

    try {
      console.log('🔄 Converting amount to wei...')
      console.log('📊 Conversion details:', {
        amount,
        selectedAssetDecimals,
        selectedAsset,
        selectedAssetAddress
      })
      
      // Validate decimals
      if (!selectedAssetDecimals || selectedAssetDecimals <= 0) {
        toast({ title: "Error", description: "Invalid asset decimals. Please select an asset first." })
        return
      }
      
      // Convert amount to proper decimal format using manual calculation
      // parseUnits sometimes has issues with certain decimal values
      const amountFloat = parseFloat(amount)
      const multiplier = Math.pow(10, selectedAssetDecimals)
      let amountInWei = BigInt(Math.floor(amountFloat * multiplier))
      
      console.log('💰 Amount conversion details:', {
        originalAmount: amount,
        parsedFloat: amountFloat,
        decimals: selectedAssetDecimals,
        multiplier: multiplier,
        multiplierString: multiplier.toString(),
        calculatedWei: amountInWei.toString(),
        expectedFor01: (0.1 * Math.pow(10, 6)).toString()
      })
      
      // Also try parseUnits for comparison
      try {
        const parseUnitsResult = parseUnits(amount, selectedAssetDecimals)
        console.log('💰 Amount in wei (parseUnits):', parseUnitsResult.toString())
        if (parseUnitsResult !== amountInWei) {
          console.log('⚠️ parseUnits and manual calculation differ!')
          console.log('🔧 Using parseUnits result instead')
          amountInWei = parseUnitsResult
        }
      } catch (parseError) {
        console.log('❌ parseUnits failed:', parseError)
      }
      
      // Validate the converted amount
      if (amountInWei <= 0n) {
        toast({ title: "Error", description: "Invalid amount conversion. Please try again." })
        return
      }
      
      console.log('📝 Calling depositWithApproval...')
      // Execute deposit with approval
      const success = await depositWithApproval(selectedAssetAddress, amountInWei, selectedAssetDecimals)
      console.log('✅ depositWithApproval result:', success)
      
      if (success) {
        toast({ 
          title: "Transaction sent!", 
          description: `Deposit transaction submitted for ${amount} ${selectedAsset}` 
        })
        
        // Reset form
        setAmount("")
        setSelectedAsset("")
        setSelectedAssetAddress("")
        setSelectedAssetDecimals(18)
      }
    } catch (error) {
      console.error('❌ Deposit error:', error)
      toast({ 
        title: "Deposit failed", 
        description: "Transaction failed. Please check your wallet and try again." 
      })
    }
  }

  if (!isConnected) {
    return null
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Deposit to Yield Aggregator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Select Asset</label>
          {assetsLoading ? (
            <div className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
              Loading assets...
            </div>
          ) : (
            <select
              value={selectedAsset}
              onChange={(e) => {
                const asset = assets.find(a => a.symbol === e.target.value)
                console.log('🎯 Asset selected:', asset)
                if (asset) {
                  // Use the correct asset address from the deployed contract
                  const correctAssetAddress = '0xE1Db780adF29B405e4642D75b366FDa3909Cf04c'
                  setSelectedAsset(asset.symbol)
                  setSelectedAssetAddress(correctAssetAddress)
                  setSelectedAssetDecimals(asset.decimals)
                  console.log('✅ Asset details set:', {
                    symbol: asset.symbol,
                    address: correctAssetAddress, // Use correct address
                    decimals: asset.decimals
                  })
                } else {
                  setSelectedAsset("")
                  setSelectedAssetAddress("")
                  setSelectedAssetDecimals(18)
                  console.log('❌ No asset found, resetting to defaults')
                }
              }}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            >
              <option value="">Choose an asset...</option>
              {assets && assets.length > 0 ? (
                assets.filter(asset => asset.symbol === 'mUSDC').map((asset) => (
                  <option key={asset.address} value={asset.symbol}>
                    {asset.name} ({asset.symbol})
                  </option>
                ))
              ) : (
                <option value="" disabled>No assets available</option>
              )}
            </select>
          )}
          {!assetsLoading && assets && assets.length === 0 && (
            <p className="text-xs text-red-500 mt-1">No assets found. Please check the database.</p>
          )}
        </div>
        
        <div>
          <label className="text-sm font-medium">Amount</label>
          <Input
            type="number"
            placeholder="1.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1.0"
            step="0.1"
          />
          {/* Debug info */}
          <div className="text-xs text-gray-500 mt-1">
            <div>Asset: {selectedAsset || 'None'}</div>
            <div>Address: {selectedAssetAddress ? `${selectedAssetAddress.slice(0, 10)}...` : 'None'}</div>
            <div>Decimals: {selectedAssetDecimals}</div>
            <div className="text-yellow-600 font-medium">Minimum deposit: 1.0 mUSDC</div>
            {amount && selectedAssetDecimals > 0 && (
              <div>Expected wei: {BigInt(Math.floor(parseFloat(amount) * Math.pow(10, selectedAssetDecimals))).toString()}</div>
            )}
          </div>
        </div>

        <Button 
          onClick={handleDeposit} 
          disabled={!amount || !selectedAsset || isApproving || isDepositing}
          className="w-full"
        >
          {isApproving ? "Approving..." : isDepositing ? "Depositing..." : "Deposit"}
        </Button>
        
        <div className="text-xs text-muted-foreground text-center">
          <p>Note: This will require 2 transactions:</p>
          <p>1. Approve token spending</p>
          <p>2. Deposit to yield aggregator</p>
          <p className="mt-2">Gas fees will apply to both transactions.</p>
          <p className="mt-2 text-yellow-600">Make sure you have enough ETH for gas fees!</p>
        </div>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <div>Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</div>
          {selectedAsset && (
            <div>Selected: {selectedAsset} ({selectedAssetDecimals} decimals)</div>
          )}
          {amount && selectedAsset && (
            <div>Amount: {amount} {selectedAsset}</div>
          )}
          
          {/* Transaction Status */}
          {approveTxHash && (
            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
              <div className="text-blue-800 font-medium">Approval Transaction</div>
              <div className="text-blue-600 text-xs break-all">{approveTxHash}</div>
              {isApproveSuccess && (
                <div className="text-green-600 text-xs">✅ Approved successfully!</div>
              )}
            </div>
          )}
          
          {depositTxHash && (
            <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
              <div className="text-green-800 font-medium">Deposit Transaction</div>
              <div className="text-green-600 text-xs break-all">{depositTxHash}</div>
              {isDepositSuccess && (
                <div className="text-green-600 text-xs">✅ Deposit successful!</div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
