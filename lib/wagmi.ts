import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, arbitrum, arbitrumSepolia } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet, safe } from 'wagmi/connectors'

// YieldRouter contract configuration
export const YIELD_ROUTER_ADDRESS = process.env.NEXT_PUBLIC_YIELD_ROUTER_ADDRESS || '0xa706f8DA7934F6d8c08BC80B3B9cc30bb6c96878'

export const YIELD_ROUTER_ABI = [
  {
    "inputs": [{ "name": "asset", "type": "address" }],
    "name": "rebalance",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "asset", "type": "address" }],
    "name": "rebalanceForce",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "checkData", "type": "bytes" }
    ],
    "name": "checkUpkeep",
    "outputs": [
      { "name": "upkeepNeeded", "type": "bool" },
      { "name": "performData", "type": "bytes" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "performData", "type": "bytes" }],
    "name": "performUpkeep",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

export const config = createConfig({
  chains: [
    arbitrumSepolia, // Primary chain for testing
    arbitrum,        // Mainnet Arbitrum
    sepolia,         // Ethereum testnet
    mainnet,         // Ethereum mainnet
  ],
  connectors: [
    injected(),
    walletConnect({ 
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id' 
    }),
    coinbaseWallet(),
    safe(),
  ],
  transports: {
    [arbitrumSepolia.id]: http(),
    [arbitrum.id]: http(),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
})
