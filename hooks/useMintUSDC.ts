"use client"

import React, { useState } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { useToast } from "@/hooks/use-toast"
import { addresses, ERC20_ABI } from "@/lib/contracts"
import { parseUnits } from "viem"

export function useMintUSDC() {
  const { address } = useAccount()
  const { toast } = useToast()
  const [isMinting, setIsMinting] = useState(false)
  const [mintTxHash, setMintTxHash] = useState<string | null>(null)

  const { writeContractAsync } = useWriteContract()

  const { data: mintReceipt, isSuccess: isMintSuccess } = useWaitForTransactionReceipt({
    hash: mintTxHash as `0x${string}`,
  })

  const mintUSDC = async (amount: string = "1000") => {
    if (!address) {
      toast({ 
        title: "Error", 
        description: "Wallet not connected",
        variant: "destructive"
      })
      return false
    }

    setIsMinting(true)
    try {
      console.log('🪙 Minting USDC...', { 
        amount, 
        to: address 
      })
      
      const amountBigInt = parseUnits(amount, 6) // USDC has 6 decimals
      
      // Call the publicMint function on the MockERC20 contract
      const hash = await writeContractAsync({
        address: addresses.MOCK_USDC as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'publicMint',
        args: [address as `0x${string}`, amountBigInt],
      })
      
      console.log('✅ Mint transaction hash:', hash)
      setMintTxHash(hash)
      
      toast({ 
        title: "Mint sent!", 
        description: `Minting ${amount} USDC... Transaction hash: ${hash.slice(0, 10)}...` 
      })
      return true
    } catch (error) {
      console.error('❌ Mint error:', error)
      toast({ 
        title: "Mint failed", 
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      })
      return false
    } finally {
      setIsMinting(false)
    }
  }

  // Handle successful mint transactions
  React.useEffect(() => {
    if (isMintSuccess && mintReceipt && mintTxHash && address) {
      console.log('✅ Mint transaction confirmed')
      
      toast({ 
        title: "Mint Confirmed!", 
        description: "USDC tokens have been minted to your wallet successfully." 
      })
      
      // Clean up
      setTimeout(() => {
        setMintTxHash(null)
      }, 5000)
    }
  }, [isMintSuccess, mintReceipt, mintTxHash, address, toast])

  return {
    mintUSDC,
    isMinting,
    mintTxHash,
    isMintSuccess
  }
}
