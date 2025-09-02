"use client"

import { useAccount, useChainId, useSwitchChain } from 'wagmi'

export function useWallet() {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  return {
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    chainId,
    switchChain,
  }
}
