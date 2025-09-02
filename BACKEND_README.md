# 🚀 Vesto Frontend Backend Integration

This document describes the complete backend integration for the Vesto Yield Aggregator frontend, including MongoDB database setup, API routes, and data management.

## 🏗️ Architecture Overview

The backend is built using **Next.js 13+ App Router** with **MongoDB** as the database. It provides a complete API layer for managing yield aggregator data, user positions, and protocol information.

### Components

1. **Database Layer** (`lib/db.ts`) - MongoDB operations and data management
2. **Type Definitions** (`lib/types.ts`) - TypeScript interfaces for all data models
3. **API Routes** (`app/api/`) - RESTful endpoints for data operations
4. **MongoDB Connection** (`lib/mongodb.ts`) - Database connection management

## 🗄️ Database Schema

### Collections

#### 1. **Assets** (`assets`)
```typescript
interface Asset {
  _id?: string
  symbol: string          // e.g., "mUSDC", "mWETH"
  name: string           // e.g., "Mock USDC", "Mock WETH"
  address: string        // Contract address
  decimals: number       // Token decimals
  logo?: string          // Logo URL
  createdAt: Date
  updatedAt: Date
}
```

#### 2. **Protocols** (`protocols`)
```typescript
interface Protocol {
  _id?: string
  name: string           // e.g., "Mock Aave", "Mock Compound"
  address: string        // Protocol contract address
  vaultAddress: string   // Vault contract address
  description?: string   // Protocol description
  website?: string       // Protocol website
  logo?: string          // Logo URL
  isActive: boolean      // Whether protocol is active
  createdAt: Date
  updatedAt: Date
}
```

#### 3. **APY Data** (`apy_data`)
```typescript
interface APYData {
  _id?: string
  protocolAddress: string    // Protocol contract address
  assetAddress: string       // Asset contract address
  apy: number               // APY as decimal (0.05 = 5%)
  totalValueLocked: number  // TVL in asset units
  lastUpdate: Date          // Last APY update
  createdAt: Date
  updatedAt: Date
}
```

#### 4. **User Positions** (`user_positions`)
```typescript
interface UserPosition {
  _id?: string
  userAddress: string       // User wallet address
  assetAddress: string      // Asset contract address
  protocolAddress: string   // Protocol contract address
  amount: number           // Amount deposited
  receiptTokens: number    // Receipt tokens received
  depositedAt: Date        // When position was opened
  lastRebalance: Date      // Last rebalancing
  createdAt: Date
  updatedAt: Date
}
```

#### 5. **Rebalance Events** (`rebalance_events`)
```typescript
interface RebalanceEvent {
  _id?: string
  assetAddress: string      // Asset involved
  oldProtocol: string       // Previous protocol
  newProtocol: string       // New protocol
  oldAPY: number           // Previous APY
  newAPY: number           // New APY
  totalValue: number       // Total value rebalanced
  gasUsed: number          // Gas used for rebalancing
  transactionHash: string   // Transaction hash
  blockNumber: number      // Block number
  executedAt: Date         // When rebalancing occurred
  createdAt: Date
}
```

#### 6. **User Transactions** (`user_transactions`)
```typescript
interface UserTransaction {
  _id?: string
  userAddress: string       // User wallet address
  type: 'deposit' | 'withdraw' | 'rebalance'
  assetAddress: string      // Asset involved
  amount: number           // Transaction amount
  protocolAddress?: string  // Protocol involved
  transactionHash: string   // Transaction hash
  blockNumber: number      // Block number
  gasUsed: number          // Gas used
  executedAt: Date         // When transaction occurred
  createdAt: Date
}
```

#### 7. **System Stats** (`system_stats`)
```typescript
interface SystemStats {
  _id?: string
  totalValueLocked: number  // Total TVL across all protocols
  totalUsers: number        // Total unique users
  totalTransactions: number // Total transactions
  averageAPY: number        // Average APY across all protocols
  lastUpdate: Date          // Last stats update
  createdAt: Date
  updatedAt: Date
}
```

## 🔌 API Endpoints

### 1. **Assets** (`/api/assets`)
- `GET` - Fetch all assets
- `POST` - Create new asset

### 2. **Protocols** (`/api/protocols`)
- `GET` - Fetch all active protocols
- `POST` - Create new protocol

### 3. **APY Data** (`/api/apy`)
- `GET ?asset=<address>` - Fetch APY data for specific asset
- `POST` - Update APY data for protocol-asset pair

### 4. **Dashboard** (`/api/dashboard`)
- `GET ?user=<address>` - Fetch user dashboard data

### 5. **Rebalancing** (`/api/rebalancing`)
- `GET ?asset=<address>&user=<address>` - Fetch rebalancing data
- `POST` - Record rebalance event

### 6. **Data Seeding** (`/api/seed`)
- `POST` - Seed database with initial mock data (development only)

## 🚀 Quick Start

### 1. **Environment Setup**

Copy the environment template and configure MongoDB:
```bash
cp env.example .env.local
```

Update `.env.local` with your MongoDB connection string:
```bash
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/vesto_yield_aggregator

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vesto_yield_aggregator
```

### 2. **Database Setup**

#### Option A: Local MongoDB
```bash
# Install MongoDB locally
brew install mongodb-community  # macOS
sudo apt-get install mongodb   # Ubuntu

# Start MongoDB service
brew services start mongodb-community  # macOS
sudo systemctl start mongodb          # Ubuntu
```

#### Option B: MongoDB Atlas
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create new cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env.local`

### 3. **Seed Database**

Populate the database with initial data:
```bash
# Development only - seeds mock data
curl -X POST http://localhost:3000/api/seed
```

### 4. **Start Development Server**

```bash
npm run dev
```

## 📊 Data Management

### **Adding New Assets**
```typescript
// Via API
POST /api/assets
{
  "symbol": "mDAI",
  "name": "Mock DAI",
  "address": "0x...",
  "decimals": 18,
  "logo": "/path/to/logo.png"
}

// Via code
import { createAsset } from '@/lib/db'

await createAsset({
  symbol: 'mDAI',
  name: 'Mock DAI',
  address: '0x...',
  decimals: 18,
  logo: '/path/to/logo.png'
})
```

### **Adding New Protocols**
```typescript
// Via API
POST /api/protocols
{
  "name": "Mock Yearn",
  "address": "0x...",
  "vaultAddress": "0x...",
  "description": "Mock Yearn Finance vaults",
  "website": "https://yearn.finance",
  "logo": "/path/to/logo.png"
}

// Via code
import { createProtocol } from '@/lib/db'

await createProtocol({
  name: 'Mock Yearn',
  address: '0x...',
  vaultAddress: '0x...',
  description: 'Mock Yearn Finance vaults',
  website: 'https://yearn.finance',
  logo: '/path/to/logo.png'
})
```

### **Updating APY Data**
```typescript
// Via API
POST /api/apy
{
  "protocolAddress": "0x...",
  "assetAddress": "0x...",
  "apy": 0.08,        // 8%
  "totalValueLocked": 1000000
}

// Via code
import { updateAPYData } from '@/lib/db'

await updateAPYData(
  '0x...',    // protocol address
  '0x...',    // asset address
  0.08,       // 8% APY
  1000000     // TVL
)
```

## 🔄 Integration with Smart Contracts

The backend integrates with the deployed smart contracts on Arbitrum Sepolia:

- **YieldAggregator**: `0x4029d4e11e6C13e6Af93602475B505e32CA5B4E6`
- **YieldRouter**: `0xE7cbBF5098997e6eD3c62d39f975086fc064798b`
- **ReceiptToken**: `0xAA465854a489e012096995332916CAe98E02ba0c`

### **Data Flow**
1. Smart contracts emit events (deposits, withdrawals, rebalancing)
2. Backend API routes fetch and store this data
3. Frontend components consume the API data
4. Real-time updates via SWR for data fetching

## 🧪 Testing

### **API Testing**
```bash
# Test assets endpoint
curl http://localhost:3000/api/assets

# Test protocols endpoint
curl http://localhost:3000/api/protocols

# Test APY data
curl "http://localhost:3000/api/apy?asset=0x68f72646Cbf2ECF4c0d270Ced126aF13ed93584B"

# Test dashboard
curl "http://localhost:3000/api/dashboard?user=0xBe8A37E111BCf8c2a8BD9d85047683e3ffE0C914"
```

### **Database Testing**
```bash
# Connect to MongoDB
mongosh "mongodb://localhost:27017/vesto_yield_aggregator"

# View collections
show collections

# Query data
db.assets.find()
db.protocols.find()
db.apy_data.find()
```

## 🚀 Production Deployment

### **Environment Variables**
```bash
# Production MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vesto_yield_aggregator

# Disable seeding
NODE_ENV=production
```

### **Database Indexes**
```javascript
// Create indexes for performance
db.assets.createIndex({ "address": 1 })
db.protocols.createIndex({ "address": 1 })
db.apy_data.createIndex({ "assetAddress": 1, "protocolAddress": 1 })
db.user_positions.createIndex({ "userAddress": 1, "assetAddress": 1 })
db.user_transactions.createIndex({ "userAddress": 1, "executedAt": -1 })
```

### **Monitoring**
- Monitor MongoDB connection pool
- Track API response times
- Monitor database query performance
- Set up alerts for database errors

## 🔧 Troubleshooting

### **Common Issues**

1. **MongoDB Connection Failed**
   - Check `MONGODB_URI` in `.env.local`
   - Verify MongoDB service is running
   - Check network connectivity

2. **API Routes Not Working**
   - Ensure MongoDB is connected
   - Check console for error messages
   - Verify API route files are in correct location

3. **Data Not Loading**
   - Check if database is seeded
   - Verify API responses in browser dev tools
   - Check MongoDB collections for data

### **Debug Commands**
```bash
# Check MongoDB status
brew services list | grep mongodb

# View MongoDB logs
tail -f /usr/local/var/log/mongodb/mongo.log

# Test MongoDB connection
mongosh "mongodb://localhost:27017/vesto_yield_aggregator"
```

## 📚 Additional Resources

- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [MongoDB Node.js Driver](https://mongodb.github.io/node-mongodb-native/)
- [TypeScript with MongoDB](https://docs.mongodb.com/drivers/node/current/fundamentals/typescript/)
- [SWR Data Fetching](https://swr.vercel.app/)

---

**🚀 Your backend is now ready for production use!**
