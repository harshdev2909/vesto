export interface Asset {
  _id?: string
  symbol: string
  name: string
  address: string
  decimals: number
  logo?: string
  createdAt: Date
  updatedAt: Date
}

export interface Protocol {
  _id?: string
  name: string
  address: string
  vaultAddress: string
  description?: string
  website?: string
  logo?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface APYData {
  _id?: string
  protocolAddress: string
  assetAddress: string
  apy: number // Stored as decimal (e.g., 0.05 for 5%)
  totalValueLocked: number
  lastUpdate: Date
  createdAt: Date
  updatedAt: Date
}

export interface UserPosition {
  _id?: string
  userAddress: string
  assetAddress: string
  protocolAddress: string
  amount: number
  receiptTokens: number
  depositedAt: Date
  lastRebalance: Date
  createdAt: Date
  updatedAt: Date
}

export interface RebalanceEvent {
  _id?: string
  assetAddress: string
  oldProtocol: string
  newProtocol: string
  oldAPY: number
  newAPY: number
  totalValue: number
  gasUsed: number
  transactionHash: string
  blockNumber: number
  executedAt: Date
  createdAt: Date
}

export interface UserTransaction {
  _id?: string
  userAddress: string
  type: 'deposit' | 'withdraw' | 'rebalance'
  assetAddress: string
  amount: number
  protocolAddress?: string
  transactionHash: string
  blockNumber: number
  gasUsed: number
  executedAt: Date
  createdAt: Date
}

export interface SystemStats {
  _id?: string
  totalValueLocked: number
  totalUsers: number
  totalTransactions: number
  averageAPY: number
  lastUpdate: Date
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  _id?: string
  walletAddress: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  data?: any
  transactionHash?: string
  timestamp: Date
  read: boolean
  createdAt: Date
  updatedAt: Date
}

export interface HistoryEntry {
  _id?: string
  walletAddress: string
  type: 'deposit' | 'withdraw' | 'rebalance'
  assetAddress?: string
  amount?: number
  transactionHash: string
  blockNumber?: number
  gasUsed?: number
  protocolAddress?: string
  oldAPY?: number
  newAPY?: number
  timestamp: Date
  read: boolean
  createdAt: Date
  updatedAt: Date
}

export interface User {
  _id?: string
  walletAddress: string
  email?: string
  createdAt: Date
  updatedAt: Date
}

// API Response types
export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Dashboard data types
export interface DashboardData {
  userPositions: UserPosition[]
  totalValueLocked: number
  averageAPY: number
  recentTransactions: UserTransaction[]
  availableAssets: Asset[]
  topProtocols: Array<{
    protocol: Protocol
    apy: number
    tvl: number
  }>
}

// Rebalancing data types
export interface RebalancingData {
  assetAddress: string
  currentProtocol: Protocol
  bestProtocol: Protocol
  currentAPY: number
  bestAPY: number
  apyDifference: number
  estimatedGas: number
  canRebalance: boolean
  lastRebalance?: Date
}
