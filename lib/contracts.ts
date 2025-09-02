import { createPublicClient, http, getContract } from 'viem'
import { arbitrumSepolia } from 'viem/chains'

// Contract addresses - update these with your deployed contract addresses
export const CONTRACT_ADDRESSES = {
  YIELD_ROUTER: process.env.NEXT_PUBLIC_YIELD_ROUTER_ADDRESS || '0xa706f8DA7934F6d8c08BC80B3B9cc30bb6c96878',
  YIELD_AGGREGATOR: process.env.NEXT_PUBLIC_YIELD_AGGREGATOR_ADDRESS || '0xd7394A378d03c09Fb6357681da0Eae43Bd1A772a',
  RECEIPT_TOKEN: process.env.NEXT_PUBLIC_RECEIPT_TOKEN_ADDRESS || '0xB5B13D115aaAECb30Bb344352B3967d647556E28',
  MOCK_USDC: process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS || '0xE1Db780adF29B405e4642D75b366FDa3909Cf04c',
} as const

// Create public client for reading contract data
export const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http()
})

// YieldRouter ABI - comprehensive ABI for all functions
export const YIELD_ROUTER_ABI = [
  {
    "inputs": [
      { "name": "asset", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "asset", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "asset", "type": "address" },
      { "name": "receiptTokens", "type": "uint256" }
    ],
    "name": "previewWithdraw",
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "asset", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "previewDeposit",
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
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
    "inputs": [],
    "name": "getSupportedAssets",
    "outputs": [
      { "name": "", "type": "address[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "user", "type": "address" },
      { "name": "asset", "type": "address" }
    ],
    "name": "getUserAssetShares",
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "user", "type": "address" }],
    "name": "getUserSupportedAssets",
    "outputs": [
      { "name": "", "type": "address[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getNextRebalanceCandidate",
    "outputs": [
      { "name": "asset", "type": "address" },
      { "name": "timeUntilUpkeep", "type": "uint256" },
      { "name": "currentAPY", "type": "uint256" },
      { "name": "bestAPY", "type": "uint256" },
      { "name": "improvement", "type": "uint256" }
    ],
    "stateMutability": "view",
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

// YieldAggregator ABI
export const YIELD_AGGREGATOR_ABI = [
  {
    "inputs": [{ "name": "asset", "type": "address" }],
    "name": "getBestYield",
    "outputs": [
      { "name": "protocol", "type": "address" },
      { "name": "apy", "type": "uint256" },
      { "name": "protocolName", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "protocol", "type": "address" },
      { "name": "asset", "type": "address" }
    ],
    "name": "getAssetYield",
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "components": [
          { "name": "asset", "type": "address" },
          { "name": "apy", "type": "uint256" },
          { "name": "lastUpdate", "type": "uint256" },
          { "name": "totalValueLocked", "type": "uint256" }
        ]
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "asset", "type": "address" }],
    "name": "compareYields",
    "outputs": [
      {
        "name": "comparisons",
        "type": "tuple[]",
        "components": [
          { "name": "protocol", "type": "address" },
          { "name": "protocolName", "type": "string" },
          { "name": "apy", "type": "uint256" },
          { "name": "totalValueLocked", "type": "uint256" }
        ]
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSupportedProtocols",
    "outputs": [
      { "name": "", "type": "address[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSupportedAssets",
    "outputs": [
      { "name": "", "type": "address[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// ReceiptToken ABI
export const RECEIPT_TOKEN_ABI = [
  {
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      { "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      { "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      { "name": "", "type": "uint8" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// ERC20 ABI for asset tokens
export const ERC20_ABI = [
  {
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [
      { "name": "", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      { "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      { "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      { "name": "", "type": "uint8" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "publicMint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

// Contract instances
export const yieldRouter = getContract({
  address: CONTRACT_ADDRESSES.YIELD_ROUTER as `0x${string}`,
  abi: YIELD_ROUTER_ABI,
  client: publicClient
})

export const yieldAggregator = getContract({
  address: CONTRACT_ADDRESSES.YIELD_AGGREGATOR as `0x${string}`,
  abi: YIELD_AGGREGATOR_ABI,
  client: publicClient
})

export const receiptToken = getContract({
  address: CONTRACT_ADDRESSES.RECEIPT_TOKEN as `0x${string}`,
  abi: RECEIPT_TOKEN_ABI,
  client: publicClient
})

export const mockUSDC = getContract({
  address: CONTRACT_ADDRESSES.MOCK_USDC as `0x${string}`,
  abi: ERC20_ABI,
  client: publicClient
})

// Helper function to create ERC20 contract instance for any asset
export const createERC20Contract = (address: `0x${string}`) => {
  return getContract({
    address,
    abi: ERC20_ABI,
    client: publicClient
  })
}

// Export all contract instances and ABIs for use in hooks
export {
  CONTRACT_ADDRESSES as addresses
}
