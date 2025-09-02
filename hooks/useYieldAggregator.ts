"use client"

import { useCallback, useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits, createPublicClient, http } from 'viem'
import { arbitrumSepolia } from 'viem/chains'
import { useToast } from './use-toast'

// Contract ABIs - these should match your deployed contracts
const YIELD_ROUTER_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "asset",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "asset",
        "type": "address"
      }
    ],
    "name": "getSupportedAssets",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "asset",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "asset",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "receiptTokens",
        "type": "uint256"
      }
    ],
    "name": "previewWithdraw",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

const ERC20_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "publicMint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

export function useYieldAggregator() {
  const { address } = useAccount()
  const { toast } = useToast()
  const [isApproving, setIsApproving] = useState(false)
  const [isDepositing, setIsDepositing] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [approveTxHash, setApproveTxHash] = useState<string | null>(null)
  const [depositTxHash, setDepositTxHash] = useState<string | null>(null)
  const [mintTxHash, setMintTxHash] = useState<string | null>(null)
  const [withdrawTxHash, setWithdrawTxHash] = useState<string | null>(null)
  
  // Store pending transaction details for database operations
  const [pendingDeposit, setPendingDeposit] = useState<{
    tokenAddress: string
    amount: string
    receiptTokens: string
    transactionHash: string
  } | null>(null)

  const [pendingWithdrawal, setPendingWithdrawal] = useState<{
    tokenAddress: string
    amount: string
    transactionHash: string
  } | null>(null)

  // Contract addresses - update these with your deployed contract addresses
  const YIELD_ROUTER_ADDRESS = process.env.NEXT_PUBLIC_YIELD_ROUTER_ADDRESS || '0xa706f8DA7934F6d8c08BC80B3B9cc30bb6c96878'
  
  // Write contract hooks
  const { writeContractAsync: writeRouterAsync, isPending: isRouterPending } = useWriteContract()
  const { writeContractAsync: writeTokenAsync, isPending: isTokenPending } = useWriteContract()

  // Transaction receipt hooks
  const { data: approveReceipt, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ 
    hash: approveTxHash as `0x${string}` | undefined 
  })
  const { data: depositReceipt, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({ 
    hash: depositTxHash as `0x${string}` | undefined 
  })
  const { data: mintReceipt, isSuccess: isMintSuccess } = useWaitForTransactionReceipt({ 
    hash: mintTxHash as `0x${string}` | undefined 
  })
  const { data: withdrawReceipt, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({ 
    hash: withdrawTxHash as `0x${string}` | undefined 
  })



  // Handle successful deposit transactions - save to database only after confirmation
  useEffect(() => {
    if (isDepositSuccess && depositReceipt && pendingDeposit && address) {
      console.log('✅ Deposit transaction confirmed, fetching aYRT balance...')
      
      // Save to database only after transaction is confirmed
      const saveToDatabase = async () => {
        try {
          // First, fetch the actual aYRT balance from the smart contract
          const balanceResponse = await fetch(`/api/ayrt-balance?user=${address}`)
          const balanceData = await balanceResponse.json()
          
          let actualReceiptTokens = "0"
          if (balanceData.success) {
            actualReceiptTokens = balanceData.data.balanceWei
            console.log(`✅ Fetched actual aYRT balance: ${balanceData.data.balance} aYRT (${actualReceiptTokens} wei)`)
          } else {
            console.warn('⚠️ Failed to fetch aYRT balance, using 0')
          }

          const response = await fetch('/api/user-positions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userAddress: address,
              assetAddress: pendingDeposit.tokenAddress,
              protocolAddress: YIELD_ROUTER_ADDRESS,
              amount: pendingDeposit.amount.toString(), // Convert BigInt to string
              receiptTokens: actualReceiptTokens, // Use actual aYRT balance from smart contract
              transactionHash: pendingDeposit.transactionHash,
              blockNumber: depositReceipt.blockNumber?.toString() || '0'
            })
          })
          
          if (response.ok) {
            console.log('✅ User position saved to database successfully with actual aYRT balance')
            toast({ 
              title: "Deposit Confirmed!", 
              description: `Your deposit has been processed. You received ${balanceData.success ? balanceData.data.balance : '0'} aYRT tokens.` 
            })
            
            // Trigger a refresh of the dashboard data to show updated balances
            window.dispatchEvent(new CustomEvent('refreshDashboard'))
          } else {
            console.error('❌ Failed to save user position to database')
            toast({ 
              title: "Database Error", 
              description: "Deposit confirmed but failed to save to database" 
            })
          }
        } catch (dbError) {
          console.error('❌ Database error:', dbError)
          toast({ 
            title: "Database Error", 
            description: "Deposit confirmed but failed to save to database" 
          })
        } finally {
          // Clear pending deposit
          setPendingDeposit(null)
        }
      }
      
      saveToDatabase()
    }
  }, [isDepositSuccess, depositReceipt, pendingDeposit, address, YIELD_ROUTER_ADDRESS, toast])

  // Handle failed deposit transactions - clear pending deposit
  useEffect(() => {
    if (depositTxHash && depositReceipt && depositReceipt.status === 'reverted' && pendingDeposit) {
      console.log('❌ Deposit transaction failed, clearing pending deposit...')
      setPendingDeposit(null)
      toast({ 
        title: "Deposit Failed", 
        description: "Transaction was reverted. No changes were made to your account." 
      })
    }
  }, [depositTxHash, depositReceipt, pendingDeposit, toast])

  // Handle successful withdrawal transactions - refresh balances and update database
  useEffect(() => {
    if (isWithdrawSuccess && withdrawReceipt && pendingWithdrawal && address) {
      console.log('✅ Withdrawal transaction confirmed, updating database and refreshing balances...')
      
      // Update the database with new deployed amount and aYRT balance
      const updateDatabase = async () => {
        try {
          // First, fetch the updated aYRT balance from the smart contract
          const balanceResponse = await fetch(`/api/ayrt-balance?user=${address}`)
          const balanceData = await balanceResponse.json()
          
          if (balanceResponse.ok && balanceData.success) {
            // Get the current user positions to find the specific position to update
            const positionsResponse = await fetch(`/api/user-positions?user=${address}`)
            const positionsData = await positionsResponse.json()
            
            if (positionsResponse.ok && positionsData.success && positionsData.data.length > 0) {
              // Find the position that matches the withdrawal token address
              const position = positionsData.data.find((pos: any) => 
                pos.assetAddress.toLowerCase() === pendingWithdrawal.tokenAddress.toLowerCase()
              )
              
              if (position) {
                // Calculate the new deployed amount based on the withdrawal
                const withdrawnAssetAmount = Number(pendingWithdrawal.amount) // This is the actual asset amount withdrawn
                const currentAYRTBalance = parseFloat(balanceData.data.balance) // This is the balance AFTER withdrawal
                const originalAYRTBalance = parseFloat(position.receiptTokens) / Math.pow(10, 18) // This is the balance BEFORE withdrawal
                
                // Calculate new deployed amount (reduce by the actual asset amount withdrawn)
                const originalDeployedAmount = Number(position.amount)
                const newDeployedAmount = originalDeployedAmount - withdrawnAssetAmount
                
                console.log(`📊 Withdrawal calculation:`, {
                  originalDeployedAmount,
                  withdrawnAssetAmount,
                  originalAYRTBalance,
                  newDeployedAmount,
                  newAYRTBalance: currentAYRTBalance
                })
                
                // Update the position in the database
                const updateResponse = await fetch('/api/user-positions', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userAddress: address,
                    assetAddress: position.assetAddress,
                    amount: newDeployedAmount.toString(),
                    receiptTokens: balanceData.data.balanceWei
                  })
                })
                
                if (updateResponse.ok) {
                  console.log('✅ Database updated with new deployed amount and aYRT balance')
                  
                  // Also create a user transaction record for the withdrawal
                  try {
                    // The pendingWithdrawal.amount now contains the actual asset amount that was withdrawn
                    // (calculated using previewWithdraw before the transaction)
                    const withdrawnAssetAmount = Number(pendingWithdrawal.amount)
                    
                    const transactionResponse = await fetch('/api/user-transactions', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userAddress: address,
                        type: 'withdraw',
                        assetAddress: position.assetAddress,
                        amount: withdrawnAssetAmount.toString(), // Store the actual asset amount withdrawn
                        transactionHash: pendingWithdrawal.transactionHash,
                        blockNumber: withdrawReceipt.blockNumber?.toString() || '0',
                        gasUsed: withdrawReceipt.gasUsed?.toString() || '0',
                        executedAt: new Date().toISOString()
                      })
                    })
                    
                    if (transactionResponse.ok) {
                      console.log('✅ Withdrawal transaction record created')
                    } else {
                      console.warn('⚠️ Failed to create withdrawal transaction record')
                    }
                  } catch (txError) {
                    console.error('❌ Error creating withdrawal transaction record:', txError)
                  }
                } else {
                  console.warn('⚠️ Failed to update database after withdrawal')
                }
              } else {
                console.warn('⚠️ Could not find position for withdrawal token address:', pendingWithdrawal.tokenAddress)
              }
            }
          }
        } catch (error) {
          console.error('❌ Error updating database after withdrawal:', error)
        } finally {
          // Clear pending withdrawal
          setPendingWithdrawal(null)
        }
      }
      
      updateDatabase()
      
      // Trigger a refresh of the dashboard data to show updated balances
      window.dispatchEvent(new CustomEvent('refreshDashboard'))
      
      toast({ 
        title: "Withdrawal Confirmed!", 
        description: "Your withdrawal has been processed successfully. Balances have been updated." 
      })
    }
  }, [isWithdrawSuccess, withdrawReceipt, pendingWithdrawal, address, toast])

  // Handle failed withdrawal transactions - clear pending withdrawal
  useEffect(() => {
    if (withdrawTxHash && withdrawReceipt && withdrawReceipt.status === 'reverted' && pendingWithdrawal) {
      console.log('❌ Withdrawal transaction failed, clearing pending withdrawal...')
      setPendingWithdrawal(null)
      toast({ 
        title: "Withdrawal Failed", 
        description: "Transaction was reverted. No changes were made to your account." 
      })
    }
  }, [withdrawTxHash, withdrawReceipt, pendingWithdrawal, toast])

  const approveToken = useCallback(async (tokenAddress: string, amount: bigint) => {
    console.log('🔐 Approving token...', { 
      tokenAddress, 
      amount: amount.toString(), 
      amountHex: '0x' + amount.toString(16),
      routerAddress: YIELD_ROUTER_ADDRESS 
    })
    
    if (!address) {
      toast({ title: "Error", description: "Wallet not connected" })
      return false
    }

    setIsApproving(true)
    try {
      console.log('📝 Calling writeTokenAsync for approval...')
      console.log('📋 Approval details:', {
        tokenAddress,
        spender: YIELD_ROUTER_ADDRESS,
        amount: amount.toString(),
        amountHex: '0x' + amount.toString(16)
      })
      
      // This will trigger the wallet to sign the transaction
      const hash = await writeTokenAsync({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [YIELD_ROUTER_ADDRESS as `0x${string}`, amount],
        gas: BigInt(200000) // Set explicit gas limit for approval
      })
      
      console.log('✅ Approval transaction hash:', hash)
      console.log('🔗 View on Arbiscan:', `https://sepolia.arbiscan.io/tx/${hash}`)
      
      // Store the transaction hash to track the approval
      setApproveTxHash(hash)
      
      toast({ 
        title: "Approval sent!", 
        description: `Transaction hash: ${hash.slice(0, 10)}...` 
      })
      return true
    } catch (error) {
      console.error('❌ Approval error:', error)
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        reason: error.reason,
        data: error.data
      })
      toast({ 
        title: "Approval failed", 
        description: error.message || "Please try again" 
      })
      return false
    } finally {
      setIsApproving(false)
    }
  }, [address, writeTokenAsync, toast])

  const deposit = useCallback(async (tokenAddress: string, amount: bigint) => {
    if (!address) {
      toast({ title: "Error", description: "Wallet not connected" })
      return false
    }

    setIsDepositing(true)
    try {
      // This will trigger the wallet to sign the transaction
      const hash = await writeRouterAsync({
        address: YIELD_ROUTER_ADDRESS as `0x${string}`,
        abi: YIELD_ROUTER_ABI,
        functionName: 'deposit',
        args: [tokenAddress as `0x${string}`, amount],
        gas: BigInt(500000) // Set explicit gas limit for deposit
      })
      
      // Store the transaction hash to track the deposit
      setDepositTxHash(hash)
      
      // Store pending deposit details for database save after confirmation
      // Store pending deposit details for database save after confirmation
      // We'll get the actual aYRT amount from the smart contract after confirmation
      setPendingDeposit({
        tokenAddress,
        amount: amount.toString(),
        receiptTokens: "0", // Will be updated with actual aYRT amount after confirmation
        transactionHash: hash
      })
      
      console.log('📝 Deposit transaction sent, waiting for confirmation before saving to database...')
      
      toast({ title: "Deposit sent!", description: `Transaction hash: ${hash.slice(0, 10)}...` })
      return true
    } catch (error) {
      console.error('Deposit error:', error)
      toast({ title: "Deposit failed", description: "Please try again" })
      return false
    } finally {
      setIsDepositing(false)
    }
  }, [address, writeRouterAsync, toast])

  const depositWithApproval = useCallback(async (tokenAddress: string, amount: bigint, decimals: number) => {
    console.log('🚀 Starting depositWithApproval...', {
      tokenAddress,
      amount: amount.toString(),
      decimals
    })
    
    try {
      // Use a reasonable approval amount (10x the deposit amount to allow for multiple deposits)
      const reasonableApproval = amount * BigInt(10)
      console.log('🔐 Approval amount calculation:', {
        depositAmount: amount.toString(),
        approvalAmount: reasonableApproval.toString(),
        approvalAmountHex: '0x' + reasonableApproval.toString(16)
      })
      
      // Validate approval amount is reasonable (max 100,000 tokens)
      let approved = false
      if (reasonableApproval > BigInt("100000000000000000000000")) { // 100k tokens
        console.log('⚠️ Approval amount too large, using deposit amount instead')
        approved = await approveToken(tokenAddress, amount)
      } else {
        console.log('✅ Approval amount is reasonable, proceeding with approval...')
        approved = await approveToken(tokenAddress, reasonableApproval)
      }
      
      console.log('📋 Approval result:', approved)
      if (!approved) {
        console.error('❌ Approval failed, stopping deposit process')
        return false
      }

      // Wait for approval transaction to be confirmed
      console.log('⏳ Waiting for approval transaction to be confirmed...')
      let approvalConfirmed = false
      let attempts = 0
      const maxAttempts = 30 // 60 seconds total (30 * 2 seconds)
      
      while (!approvalConfirmed && attempts < maxAttempts) {
        attempts++
        console.log(`Checking approval status (attempt ${attempts}/${maxAttempts})...`)
        console.log('Current approveReceipt:', approveReceipt)
        
        // Check if we have a successful approval receipt
        if (approveReceipt && approveReceipt.status === 'success') {
          console.log('✅ Approval transaction confirmed!')
          approvalConfirmed = true
          break
        }
        
        // Wait 2 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      
      if (!approvalConfirmed) {
        console.error('❌ Approval transaction timeout')
        toast({ title: "Approval timeout", description: "Please try again" })
        return false
      }

      // Then deposit
      console.log('🚀 Proceeding with deposit...')
      const deposited = await deposit(tokenAddress, amount)
      console.log('📋 Deposit result:', deposited)
      return deposited
    } catch (error) {
      console.error('❌ Deposit with approval error:', error)
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        reason: error.reason
      })
      toast({ title: "Transaction failed", description: error.message || "Please try again" })
      return false
    }
  }, [approveToken, deposit, approveReceipt, toast])

  const mintTokens = useCallback(async (tokenAddress: string, amount: bigint) => {
    if (!address) {
      toast({ title: "Error", description: "Wallet not connected" })
      return false
    }

    setIsMinting(true)
    try {
      console.log('🪙 Minting tokens...', { 
        tokenAddress, 
        amount: amount.toString(), 
        amountHex: '0x' + amount.toString(16),
        to: address 
      })
      
      // This will trigger the wallet to sign the transaction
      const hash = await writeTokenAsync({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'publicMint',
        args: [address as `0x${string}`, amount],
        gas: BigInt(200000) // Set explicit gas limit
      })
      
      console.log('✅ Mint transaction hash:', hash)
      // Store the transaction hash to track the mint
      setMintTxHash(hash)
      
      toast({ title: "Mint sent!", description: `Transaction hash: ${hash.slice(0, 10)}...` })
      return true
    } catch (error) {
      console.error('❌ Mint error:', error)
      toast({ title: "Mint failed", description: "Please try again" })
      return false
    } finally {
      setIsMinting(false)
    }
  }, [address, writeTokenAsync, toast])

  const withdraw = useCallback(async (tokenAddress: string, aYRTAmount: bigint) => {
    if (!address) {
      toast({ title: "Error", description: "Wallet not connected" })
      return false
    }

    setIsWithdrawing(true)
    try {
      console.log('💸 Withdrawing tokens...', { 
        tokenAddress, 
        aYRTAmount: aYRTAmount.toString(), 
        aYRTAmountHex: '0x' + aYRTAmount.toString(16),
        from: address 
      })
      
      // First, get the equivalent asset amount using previewWithdraw
      const publicClient = createPublicClient({
        chain: arbitrumSepolia,
        transport: http()
      })
      
      const assetAmount = await publicClient.readContract({
        address: YIELD_ROUTER_ADDRESS as `0x${string}`,
        abi: YIELD_ROUTER_ABI,
        functionName: 'previewWithdraw',
        args: [tokenAddress as `0x${string}`, aYRTAmount]
      })
      
      console.log('📊 Withdrawal preview:', {
        aYRTAmount: aYRTAmount.toString(),
        assetAmount: assetAmount?.toString()
      })
      
      // This will trigger the wallet to sign the transaction
      const hash = await writeRouterAsync({
        address: YIELD_ROUTER_ADDRESS as `0x${string}`,
        abi: YIELD_ROUTER_ABI,
        functionName: 'withdraw',
        args: [tokenAddress as `0x${string}`, assetAmount || BigInt(0)], // Use the calculated asset amount
        gas: BigInt(200000) // Set explicit gas limit for withdrawal
      })
      
      console.log('✅ Withdraw transaction hash:', hash)
      // Store the transaction hash to track the withdrawal
      setWithdrawTxHash(hash)
      
      // Store pending withdrawal details for database update after confirmation
      setPendingWithdrawal({
        tokenAddress,
        amount: (assetAmount || BigInt(0)).toString(), // Store the actual asset amount
        transactionHash: hash
      })
      
      toast({ title: "Withdrawal sent!", description: `Transaction hash: ${hash.slice(0, 10)}...` })
      return true
    } catch (error) {
      console.error('❌ Withdraw error:', error)
      toast({ title: "Withdrawal failed", description: "Please try again" })
      return false
    } finally {
      setIsWithdrawing(false)
    }
  }, [address, writeRouterAsync, toast])

  return {
    approveToken,
    deposit,
    depositWithApproval,
    mintTokens,
    withdraw,
    isApproving,
    isDepositing,
    isMinting,
    isWithdrawing,
    isRouterPending,
    isTokenPending,
    approveTxHash,
    depositTxHash,
    mintTxHash,
    withdrawTxHash,
    isApproveSuccess,
    isDepositSuccess,
    isMintSuccess,
    isWithdrawSuccess,
    approveReceipt,
    depositReceipt,
    mintReceipt,
    withdrawReceipt,
    pendingDeposit
  }
}
