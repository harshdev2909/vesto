"use client"

import React, { useCallback, useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { readContract } from '@wagmi/core'
import { parseUnits, formatUnits } from 'viem'
import { useToast } from './use-toast'
import { useAppStore } from '@/store/use-app-store'
import { useSaveTransactionHistory, useCreateNotification } from './useOnChainData'
import { config } from '@/lib/wagmi'
import { 
  yieldRouter, 
  createERC20Contract, 
  addresses,
  YIELD_ROUTER_ABI,
  ERC20_ABI
} from '@/lib/contracts'

export function useYieldAggregatorV2() {
  const { address } = useAccount()
  const { toast } = useToast()
  const { addPendingTransaction, updateTransactionStatus, removePendingTransaction } = useAppStore()
  
  // Mutation hooks
  const saveTransactionHistory = useSaveTransactionHistory()
  const createNotification = useCreateNotification()
  
  // Transaction states
  const [isApproving, setIsApproving] = useState(false)
  const [isDepositing, setIsDepositing] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [isRebalancing, setIsRebalancing] = useState(false)
  
  // Transaction hashes
  const [approveTxHash, setApproveTxHash] = useState<string | null>(null)
  const [depositTxHash, setDepositTxHash] = useState<string | null>(null)
  const [withdrawTxHash, setWithdrawTxHash] = useState<string | null>(null)
  const [rebalanceTxHash, setRebalanceTxHash] = useState<string | null>(null)
  
  // Pending transaction data
  const [pendingDeposit, setPendingDeposit] = useState<{
    assetAddress: string
    amount: string
    transactionHash: string
  } | null>(null)
  
  const [pendingWithdrawal, setPendingWithdrawal] = useState<{
    assetAddress: string
    amount: string
    transactionHash: string
  } | null>(null)
  
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
  const { data: withdrawReceipt, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({ 
    hash: withdrawTxHash as `0x${string}` | undefined 
  })
  const { data: rebalanceReceipt, isSuccess: isRebalanceSuccess } = useWaitForTransactionReceipt({ 
    hash: rebalanceTxHash as `0x${string}` | undefined 
  })

  // Handle successful approval transactions
  React.useEffect(() => {
    if (isApproveSuccess && approveReceipt && approveTxHash) {
      console.log('✅ Approval transaction confirmed')
      updateTransactionStatus(approveTxHash, 'confirmed')
      
      toast({ 
        title: "Approval Confirmed!", 
        description: "Token approval successful. You can now proceed with the transaction." 
      })
      
      // Create notification
      if (address) {
        createNotification.mutate({
          walletAddress: address,
          message: "Token approval confirmed successfully",
          type: "success"
        })
      }
      
      // Clean up
      setTimeout(() => {
        removePendingTransaction(approveTxHash)
        setApproveTxHash(null)
      }, 5000)
    }
  }, [isApproveSuccess, approveReceipt, approveTxHash, address, toast, updateTransactionStatus, removePendingTransaction, createNotification])

  // Handle successful deposit transactions
  React.useEffect(() => {
    if (isDepositSuccess && depositReceipt && depositTxHash && address) {
      console.log('✅ Deposit transaction confirmed')
      updateTransactionStatus(depositTxHash, 'confirmed')
      
      // Save to transaction history
      saveTransactionHistory.mutate({
        walletAddress: address,
        type: 'deposit',
        assetAddress: pendingDeposit?.assetAddress,
        amount: pendingDeposit?.amount ? Number(pendingDeposit.amount) : 0,
        transactionHash: depositTxHash,
        blockNumber: Number(depositReceipt.blockNumber),
        gasUsed: Number(depositReceipt.gasUsed)
      })
      
      toast({ 
        title: "Deposit Confirmed!", 
        description: "Your deposit has been processed successfully." 
      })
      
      // Create notification
      createNotification.mutate({
        walletAddress: address,
        message: "Deposit confirmed successfully",
        type: "success"
      })
      
      // Clean up
      setTimeout(() => {
        removePendingTransaction(depositTxHash)
        setDepositTxHash(null)
        setPendingDeposit(null)
      }, 5000)
    }
  }, [isDepositSuccess, depositReceipt, depositTxHash, address, toast, updateTransactionStatus, removePendingTransaction, saveTransactionHistory, createNotification])

  // Handle successful withdrawal transactions
  React.useEffect(() => {
    if (isWithdrawSuccess && withdrawReceipt && withdrawTxHash && address) {
      console.log('✅ Withdrawal transaction confirmed')
      updateTransactionStatus(withdrawTxHash, 'confirmed')
      
      // Save to transaction history
      saveTransactionHistory.mutate({
        walletAddress: address,
        type: 'withdraw',
        assetAddress: pendingWithdrawal?.assetAddress,
        amount: pendingWithdrawal?.amount ? Number(pendingWithdrawal.amount) : 0,
        transactionHash: withdrawTxHash,
        blockNumber: Number(withdrawReceipt.blockNumber),
        gasUsed: Number(withdrawReceipt.gasUsed)
      })
      
      toast({ 
        title: "Withdrawal Confirmed!", 
        description: "Your withdrawal has been processed successfully." 
      })
      
      // Create notification
      createNotification.mutate({
        walletAddress: address,
        message: "Withdrawal confirmed successfully",
        type: "success"
      })
      
      // Clean up
      setTimeout(() => {
        removePendingTransaction(withdrawTxHash)
        setWithdrawTxHash(null)
        setPendingWithdrawal(null)
      }, 5000)
    }
  }, [isWithdrawSuccess, withdrawReceipt, withdrawTxHash, address, toast, updateTransactionStatus, removePendingTransaction, saveTransactionHistory, createNotification])

  // Handle successful rebalance transactions
  React.useEffect(() => {
    if (isRebalanceSuccess && rebalanceReceipt && rebalanceTxHash && address) {
      console.log('✅ Rebalance transaction confirmed')
      updateTransactionStatus(rebalanceTxHash, 'confirmed')
      
      // Save to transaction history
      saveTransactionHistory.mutate({
        walletAddress: address,
        type: 'rebalance',
        transactionHash: rebalanceTxHash,
        blockNumber: Number(rebalanceReceipt.blockNumber),
        gasUsed: Number(rebalanceReceipt.gasUsed)
      })
      
      toast({ 
        title: "Rebalance Confirmed!", 
        description: "Your assets have been rebalanced successfully." 
      })
      
      // Create notification
      createNotification.mutate({
        walletAddress: address,
        message: "Rebalance completed successfully",
        type: "success"
      })
      
      // Clean up
      setTimeout(() => {
        removePendingTransaction(rebalanceTxHash)
        setRebalanceTxHash(null)
      }, 5000)
    }
  }, [isRebalanceSuccess, rebalanceReceipt, rebalanceTxHash, address, toast, updateTransactionStatus, removePendingTransaction, saveTransactionHistory, createNotification])

  // Approve token function
  const approveToken = useCallback(async (tokenAddress: string, amount: bigint) => {
    if (!address) {
      toast({ title: "Error", description: "Wallet not connected" })
      return false
    }

    setIsApproving(true)
    try {
      console.log('🔐 Approving token...', { tokenAddress, amount: amount.toString() })
      
      const hash = await writeTokenAsync({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [addresses.YIELD_ROUTER as `0x${string}`, amount],
        gas: BigInt(200000)
      })
      
      console.log('✅ Approval transaction hash:', hash)
      setApproveTxHash(hash)
      addPendingTransaction(hash, 'deposit') // We'll update this when we know the actual type
      
      toast({ 
        title: "Approval sent!", 
        description: `Transaction hash: ${hash.slice(0, 10)}...` 
      })
      return true
    } catch (error) {
      console.error('❌ Approval error:', error)
      toast({ 
        title: "Approval failed", 
        description: error instanceof Error ? error.message : "Please try again" 
      })
      return false
    } finally {
      setIsApproving(false)
    }
  }, [address, writeTokenAsync, toast, addPendingTransaction])

  // Deposit function
  const deposit = useCallback(async (tokenAddress: string, amount: bigint) => {
    if (!address) {
      toast({ title: "Error", description: "Wallet not connected" })
      return false
    }

    setIsDepositing(true)
    try {
      console.log('🚀 Depositing...', { tokenAddress, amount: amount.toString() })
      
      const hash = await writeRouterAsync({
        address: addresses.YIELD_ROUTER as `0x${string}`,
        abi: YIELD_ROUTER_ABI,
        functionName: 'deposit',
        args: [tokenAddress as `0x${string}`, amount],
        gas: BigInt(500000)
      })
      
      console.log('✅ Deposit transaction hash:', hash)
      setDepositTxHash(hash)
      addPendingTransaction(hash, 'deposit')
      
      // Store pending deposit data for history saving
      setPendingDeposit({
        assetAddress: tokenAddress,
        amount: amount.toString(),
        transactionHash: hash
      })
      
      toast({ title: "Deposit sent!", description: `Transaction hash: ${hash.slice(0, 10)}...` })
      return true
    } catch (error) {
      console.error('❌ Deposit error:', error)
      toast({ title: "Deposit failed", description: "Please try again" })
      return false
    } finally {
      setIsDepositing(false)
    }
  }, [address, writeRouterAsync, toast, addPendingTransaction])

  // Deposit with approval function
  const depositWithApproval = useCallback(async (tokenAddress: string, amount: bigint, decimals: number) => {
    console.log('🚀 Starting depositWithApproval...', { tokenAddress, amount: amount.toString(), decimals })
    
    try {
      // Check current allowance
      const currentAllowance = await readContract(config, {
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address!, addresses.YIELD_ROUTER as `0x${string}`]
      })
      
      console.log('📊 Current allowance check:', {
        currentAllowance: currentAllowance.toString(),
        requiredAmount: amount.toString(),
        hasEnoughAllowance: currentAllowance >= amount
      })
      
      if (currentAllowance < amount) {
        console.log('🔐 Insufficient allowance, approving...')
        // Approve a reasonable amount (10x the deposit amount)
        const approvalAmount = amount * BigInt(10)
        const approved = await approveToken(tokenAddress, approvalAmount)
        if (!approved) {
          return false
        }
        
        // Wait for approval confirmation
        let attempts = 0
        const maxAttempts = 30
        while (!isApproveSuccess && attempts < maxAttempts) {
          console.log(`⏳ Waiting for approval confirmation (attempt ${attempts + 1}/${maxAttempts})...`)
          await new Promise(resolve => setTimeout(resolve, 2000))
          attempts++
        }
        
        if (!isApproveSuccess) {
          toast({ title: "Approval timeout", description: "Please try again" })
          return false
        }
        
        console.log('✅ Approval confirmed, proceeding with deposit...')
      }

      // Proceed with deposit
      console.log('🚀 Proceeding with deposit...')
      const deposited = await deposit(tokenAddress, amount)
      return deposited
    } catch (error) {
      console.error('❌ Deposit with approval error:', error)
      toast({ title: "Transaction failed", description: error instanceof Error ? error.message : "Please try again" })
      return false
    }
  }, [address, approveToken, deposit, isApproveSuccess, toast])

  // Withdraw function - now takes USDC amount directly
  const withdraw = useCallback(async (tokenAddress: string, usdcAmount: bigint) => {
    if (!address) {
      toast({ title: "Error", description: "Wallet not connected" })
      return false
    }

    setIsWithdrawing(true)
    try {
      console.log('💸 Withdrawing...', { tokenAddress, usdcAmount: usdcAmount.toString() })
      
      // Call the contract's withdraw function directly with the USDC amount
      // The contract will calculate how much aYRT to burn internally
      const hash = await writeRouterAsync({
        address: addresses.YIELD_ROUTER as `0x${string}`,
        abi: YIELD_ROUTER_ABI,
        functionName: 'withdraw',
        args: [tokenAddress as `0x${string}`, usdcAmount],
        gas: BigInt(200000)
      })
      
      console.log('✅ Withdraw transaction hash:', hash)
      setWithdrawTxHash(hash)
      addPendingTransaction(hash, 'withdraw')
      
      // Store pending withdrawal data for history saving
      setPendingWithdrawal({
        assetAddress: tokenAddress,
        amount: usdcAmount.toString(),
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
  }, [address, writeRouterAsync, toast, addPendingTransaction])

  // Rebalance function
  const rebalance = useCallback(async (assetAddress: string) => {
    if (!address) {
      toast({ title: "Error", description: "Wallet not connected" })
      return false
    }

    setIsRebalancing(true)
    try {
      console.log('🔄 Rebalancing...', { assetAddress })
      
      const hash = await writeRouterAsync({
        address: addresses.YIELD_ROUTER as `0x${string}`,
        abi: YIELD_ROUTER_ABI,
        functionName: 'rebalance',
        args: [assetAddress as `0x${string}`],
        gas: BigInt(300000)
      })
      
      console.log('✅ Rebalance transaction hash:', hash)
      setRebalanceTxHash(hash)
      addPendingTransaction(hash, 'rebalance')
      
      toast({ title: "Rebalance sent!", description: `Transaction hash: ${hash.slice(0, 10)}...` })
      return true
    } catch (error) {
      console.error('❌ Rebalance error:', error)
      toast({ title: "Rebalance failed", description: "Please try again" })
      return false
    } finally {
      setIsRebalancing(false)
    }
  }, [address, writeRouterAsync, toast, addPendingTransaction])

  // Force rebalance function (for demo purposes)
  const rebalanceForce = useCallback(async (assetAddress: string) => {
    if (!address) {
      toast({ title: "Error", description: "Wallet not connected" })
      return false
    }

    setIsRebalancing(true)
    try {
      console.log('🔄 Force rebalancing...', { assetAddress })
      
      const hash = await writeRouterAsync({
        address: addresses.YIELD_ROUTER as `0x${string}`,
        abi: YIELD_ROUTER_ABI,
        functionName: 'rebalanceForce',
        args: [assetAddress as `0x${string}`],
        gas: BigInt(300000)
      })
      
      console.log('✅ Force rebalance transaction hash:', hash)
      setRebalanceTxHash(hash)
      addPendingTransaction(hash, 'rebalance')
      
      toast({ title: "Force rebalance sent!", description: `Transaction hash: ${hash.slice(0, 10)}...` })
      return true
    } catch (error) {
      console.error('❌ Force rebalance error:', error)
      toast({ title: "Force rebalance failed", description: "Please try again" })
      return false
    } finally {
      setIsRebalancing(false)
    }
  }, [address, writeRouterAsync, toast, addPendingTransaction])

  return {
    // Functions
    approveToken,
    deposit,
    depositWithApproval,
    withdraw,
    rebalance,
    rebalanceForce,
    
    // Loading states
    isApproving,
    isDepositing,
    isWithdrawing,
    isRebalancing,
    isRouterPending,
    isTokenPending,
    
    // Transaction hashes
    approveTxHash,
    depositTxHash,
    withdrawTxHash,
    rebalanceTxHash,
    
    // Transaction status
    isApproveSuccess,
    isDepositSuccess,
    isWithdrawSuccess,
    isRebalanceSuccess,
    
    // Transaction receipts
    approveReceipt,
    depositReceipt,
    withdrawReceipt,
    rebalanceReceipt
  }
}
