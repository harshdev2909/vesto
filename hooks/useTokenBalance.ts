import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'

const ERC20_ABI = [
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
  }
] as const

export function useTokenBalance(tokenAddress: string, decimals: number = 18) {
  const { address, isConnected } = useAccount()
  const [balance, setBalance] = useState<string>('0')

  const { data: balanceData, isLoading, error } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address && !!tokenAddress,
    },
  })

  useEffect(() => {
    if (balanceData && isConnected) {
      const formattedBalance = formatUnits(balanceData, decimals)
      setBalance(formattedBalance)
    } else {
      setBalance('0')
    }
  }, [balanceData, isConnected, decimals])

  return {
    balance,
    isLoading,
    error,
    balanceWei: balanceData
  }
}


