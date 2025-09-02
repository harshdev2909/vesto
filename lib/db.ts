import clientPromise from './mongodb'
import { 
  Asset, 
  Protocol, 
  APYData, 
  UserPosition, 
  RebalanceEvent, 
  UserTransaction,
  SystemStats,
  Notification,
  HistoryEntry,
  User
} from './types'

const DB_NAME = 'vesto_yield_aggregator'

// Collection names
const COLLECTIONS = {
  ASSETS: 'assets',
  PROTOCOLS: 'protocols',
  APY_DATA: 'apy_data',
  USER_POSITIONS: 'user_positions',
  REBALANCE_EVENTS: 'rebalance_events',
  USER_TRANSACTIONS: 'user_transactions',
  SYSTEM_STATS: 'system_stats',
  NOTIFICATIONS: 'notifications',
  HISTORY: 'history',
  USERS: 'users'
} as const

// Generic database operations
export async function getCollection<T>(collectionName: string) {
  const client = await clientPromise
  const db = client.db(DB_NAME)
  return db.collection<T>(collectionName)
}

// Asset operations
export async function getAssets(): Promise<Asset[]> {
  const collection = await getCollection<Asset>(COLLECTIONS.ASSETS)
  return collection.find({}).sort({ symbol: 1 }).toArray()
}

export async function getAssetByAddress(address: string): Promise<Asset | null> {
  const collection = await getCollection<Asset>(COLLECTIONS.ASSETS)
  return collection.findOne({ address: address.toLowerCase() })
}

export async function createAsset(asset: Omit<Asset, '_id' | 'createdAt' | 'updatedAt'>): Promise<Asset> {
  const collection = await getCollection<Asset>(COLLECTIONS.ASSETS)
  const now = new Date()
  const newAsset: Asset = {
    ...asset,
    address: asset.address.toLowerCase(),
    createdAt: now,
    updatedAt: now
  }
  const result = await collection.insertOne(newAsset)
  return { ...newAsset, _id: result.insertedId.toString() }
}

// Protocol operations
export async function getProtocols(): Promise<Protocol[]> {
  const collection = await getCollection<Protocol>(COLLECTIONS.PROTOCOLS)
  return collection.find({ isActive: true }).sort({ name: 1 }).toArray()
}

export async function getProtocolByAddress(address: string): Promise<Protocol | null> {
  const collection = await getCollection<Protocol>(COLLECTIONS.PROTOCOLS)
  return collection.findOne({ address: address.toLowerCase() })
}

export async function createProtocol(protocol: Omit<Protocol, '_id' | 'createdAt' | 'updatedAt'>): Promise<Protocol> {
  const collection = await getCollection<Protocol>(COLLECTIONS.PROTOCOLS)
  const now = new Date()
  const newProtocol: Protocol = {
    ...protocol,
    address: protocol.address.toLowerCase(),
    vaultAddress: protocol.vaultAddress.toLowerCase(),
    createdAt: now,
    updatedAt: now
  }
  const result = await collection.insertOne(newProtocol)
  return { ...newProtocol, _id: result.insertedId.toString() }
}

// APY Data operations
export async function getAPYData(assetAddress: string): Promise<APYData[]> {
  const collection = await getCollection<APYData>(COLLECTIONS.APY_DATA)
  return collection.find({ 
    assetAddress: assetAddress.toLowerCase() 
  }).sort({ lastUpdate: -1 }).toArray()
}

export async function getBestAPY(assetAddress: string): Promise<APYData | null> {
  const collection = await getCollection<APYData>(COLLECTIONS.APY_DATA)
  return collection.findOne(
    { assetAddress: assetAddress.toLowerCase() },
    { sort: { apy: -1 } }
  )
}

export async function updateAPYData(
  protocolAddress: string, 
  assetAddress: string, 
  apy: number, 
  totalValueLocked: number
): Promise<void> {
  const collection = await getCollection<APYData>(COLLECTIONS.APY_DATA)
  const now = new Date()
  
  await collection.updateOne(
    { 
      protocolAddress: protocolAddress.toLowerCase(),
      assetAddress: assetAddress.toLowerCase() 
    },
    {
      $set: {
        apy,
        totalValueLocked,
        lastUpdate: now,
        updatedAt: now
      },
      $setOnInsert: {
        createdAt: now
      }
    },
    { upsert: true }
  )
}

// User Position operations
export async function getUserPositions(userAddress: string): Promise<UserPosition[]> {
  const collection = await getCollection<UserPosition>(COLLECTIONS.USER_POSITIONS)
  return collection.find({ 
    userAddress: userAddress.toLowerCase() 
  }).sort({ updatedAt: -1 }).toArray()
}

export async function createUserPosition(position: Omit<UserPosition, '_id' | 'createdAt' | 'updatedAt'>): Promise<UserPosition> {
  const collection = await getCollection<UserPosition>(COLLECTIONS.USER_POSITIONS)
  const now = new Date()
  const newPosition: UserPosition = {
    ...position,
    userAddress: position.userAddress.toLowerCase(),
    assetAddress: position.assetAddress.toLowerCase(),
    protocolAddress: position.protocolAddress.toLowerCase(),
    createdAt: now,
    updatedAt: now
  }
  const result = await collection.insertOne(newPosition)
  return { ...newPosition, _id: result.insertedId.toString() }
}

export async function updateUserPosition(
  userAddress: string,
  assetAddress: string,
  updates: Partial<UserPosition>
): Promise<void> {
  const collection = await getCollection<UserPosition>(COLLECTIONS.USER_POSITIONS)
  await collection.updateOne(
    { 
      userAddress: userAddress.toLowerCase(),
      assetAddress: assetAddress.toLowerCase() 
    },
    {
      $set: {
        ...updates,
        updatedAt: new Date()
      }
    }
  )
}

// Transaction operations
export async function createUserTransaction(transaction: Omit<UserTransaction, '_id' | 'createdAt'>): Promise<UserTransaction> {
  const collection = await getCollection<UserTransaction>(COLLECTIONS.USER_TRANSACTIONS)
  const now = new Date()
  const newTransaction: UserTransaction = {
    ...transaction,
    userAddress: transaction.userAddress.toLowerCase(),
    assetAddress: transaction.assetAddress.toLowerCase(),
    protocolAddress: transaction.protocolAddress?.toLowerCase(),
    createdAt: now
  }
  const result = await collection.insertOne(newTransaction)
  return { ...newTransaction, _id: result.insertedId.toString() }
}

export async function getUserTransactions(
  userAddress: string, 
  limit: number = 10
): Promise<UserTransaction[]> {
  const collection = await getCollection<UserTransaction>(COLLECTIONS.USER_TRANSACTIONS)
  return collection.find({ 
    userAddress: userAddress.toLowerCase() 
  }).sort({ executedAt: -1 }).limit(limit).toArray()
}

// Rebalance Event operations
export async function createRebalanceEvent(event: Omit<RebalanceEvent, '_id' | 'createdAt'>): Promise<RebalanceEvent> {
  const collection = await getCollection<RebalanceEvent>(COLLECTIONS.REBALANCE_EVENTS)
  const now = new Date()
  const newEvent: RebalanceEvent = {
    ...event,
    assetAddress: event.assetAddress.toLowerCase(),
    oldProtocol: event.oldProtocol.toLowerCase(),
    newProtocol: event.newProtocol.toLowerCase(),
    createdAt: now
  }
  const result = await collection.insertOne(newEvent)
  return { ...newEvent, _id: result.insertedId.toString() }
}

// System Stats operations
export async function getSystemStats(): Promise<SystemStats | null> {
  const collection = await getCollection<SystemStats>(COLLECTIONS.SYSTEM_STATS)
  return collection.findOne({}, { sort: { updatedAt: -1 } })
}

export async function updateSystemStats(stats: Partial<SystemStats>): Promise<void> {
  const collection = await getCollection<SystemStats>(COLLECTIONS.SYSTEM_STATS)
  const now = new Date()
  
  await collection.updateOne(
    {},
    {
      $set: {
        ...stats,
        updatedAt: now
      },
      $setOnInsert: {
        createdAt: now
      }
    },
    { upsert: true }
  )
}

// Utility functions
export async function getTotalValueLocked(): Promise<number> {
  const collection = await getCollection<APYData>(COLLECTIONS.APY_DATA)
  const result = await collection.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: '$totalValueLocked' }
      }
    }
  ]).toArray()
  
  return result[0]?.total || 0
}

export async function getAverageAPY(): Promise<number> {
  const collection = await getCollection<APYData>(COLLECTIONS.APY_DATA)
  const result = await collection.aggregate([
    {
      $group: {
        _id: null,
        average: { $avg: '$apy' }
      }
    }
  ]).toArray()
  
  return result[0]?.average || 0
}
