import { NextRequest, NextResponse } from 'next/server'
import { 
  createAsset, 
  createProtocol, 
  updateAPYData,
  createUserPosition,
  createUserTransaction
} from '@/lib/db'
import { APIResponse } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    // Check if this is a development environment
    if (process.env.NODE_ENV === 'production') {
      const response: APIResponse<null> = {
        success: false,
        error: 'Seeding is not allowed in production'
      }
      return NextResponse.json(response, { status: 403 })
    }
    
    // Create mock assets
    const mockAssets = [
      {
        symbol: 'mUSDC',
        name: 'Mock USDC',
        address: '0x64345f22A2D6d31802861B20C21d0e2C4628dE99',
        decimals: 6,
        logo: '/abstract-geometric-shapes.png'
      },
      {
        symbol: 'mWETH',
        name: 'Mock WETH',
        address: '0x1234567890123456789012345678901234567890',
        decimals: 18,
        logo: '/abstract-geometric-shapes.png'
      },
      {
        symbol: 'mUSDT',
        name: 'Mock USDT',
        address: '0x0987654321098765432109876543210987654321',
        decimals: 6,
        logo: '/abstract-geometric-shapes.png'
      },
      {
        symbol: 'mAave',
        name: 'Mock Aave',
        address: '0xa4b86b26c5c4d1c3d3d8c2c3d4e5f6a7b8c9d0e1f',
        decimals: 18,
        logo: '/abstract-geometric-shapes.png'
      },
      {
        symbol: 'Mcomp',
        name: 'Mock Compound',
        address: '0xb5c86b26c5c4d1c3d3d8c2c3d4e5f6a7b8c9d0e1f',
        decimals: 18,
        logo: '/abstract-geometric-shapes.png'
      }
    ]
    
    // Create mock protocols
    const mockProtocols = [
      {
        name: 'Mock Aave',
        address: '0xAEeA2bCdd633b9A31fc98316244C9C39DFA26CCc',
        vaultAddress: '0xAEeA2bCdd633b9A31fc98316244C9C39DFA26CCc',
        description: 'Mock Aave lending protocol',
        website: 'https://aave.com',
        logo: '/abstract-geometric-shapes.png',
        isActive: true
      },
      {
        name: 'Mock Compound',
        address: '0xFE890ed1ea3E62e96830075882C696Bb1af9bC79',
        vaultAddress: '0xFE890ed1ea3E62e96830075882C696Bb1af9bC79',
        description: 'Mock Compound lending protocol',
        website: 'https://compound.finance',
        logo: '/abstract-geometric-shapes.png',
        isActive: true
      },
      {
        name: 'Mock Lido',
        address: '0x1111111111111111111111111111111111111111',
        vaultAddress: '0x1111111111111111111111111111111111111111',
        description: 'Mock Lido staking protocol',
        website: 'https://lido.fi',
        logo: '/abstract-geometric-shapes.png',
        isActive: true
      }
    ]
    
    // Create assets
    for (const asset of mockAssets) {
      try {
        await createAsset(asset)
      } catch (error) {
        console.log(`Asset ${asset.symbol} already exists or error:`, error)
      }
    }
    
    // Create protocols
    for (const protocol of mockProtocols) {
      try {
        await createProtocol(protocol)
      } catch (error) {
        console.log(`Protocol ${protocol.name} already exists or error:`, error)
      }
    }
    
    // Set initial APY data
    const apyData = [
      // Mock USDC APYs
      { protocol: '0xAEeA2bCdd633b9A31fc98316244C9C39DFA26CCc', asset: '0x64345f22A2D6d31802861B20C21d0e2C4628dE99', apy: 0.05, tvl: 1000000 },
      { protocol: '0xFE890ed1ea3E62e96830075882C696Bb1af9bC79', asset: '0x64345f22A2D6d31802861B20C21d0e2C4628dE99', apy: 0.07, tvl: 2000000 },
      { protocol: '0x1111111111111111111111111111111111111111', asset: '0x64345f22A2D6d31802861B20C21d0e2C4628dE99', apy: 0.03, tvl: 500000 },
      
      // Mock WETH APYs
      { protocol: '0xBaf7Dd10B229615246a37CBD595fc2fdD2CD8a8e', asset: '0x1234567890123456789012345678901234567890', apy: 0.08, tvl: 500000 },
      { protocol: '0x54FA761eB183feD9809cf06A97cd273b39ACE25c', asset: '0x1234567890123456789012345678901234567890', apy: 0.06, tvl: 300000 },
      { protocol: '0x1111111111111111111111111111111111111111', asset: '0x1234567890123456789012345678901234567890', apy: 0.12, tvl: 800000 },
      
      // Mock USDT APYs
      { protocol: '0xBaf7Dd10B229615246a37CBD595fc2fdD2CD8a8e', asset: '0x0987654321098765432109876543210987654321', apy: 0.04, tvl: 1500000 },
      { protocol: '0x54FA761eB183feD9809cf06A97cd273b39ACE25c', asset: '0x0987654321098765432109876543210987654321', apy: 0.09, tvl: 1000000 },
      { protocol: '0x1111111111111111111111111111111111111111', asset: '0x0987654321098765432109876543210987654321', apy: 0.02, tvl: 400000 },
      
      // Mock mAave APYs
      { protocol: '0xBaf7Dd10B229615246a37CBD595fc2fdD2CD8a8e', asset: '0xa4b86b26c5c4d1c3d3d8c2c3d4e5f6a7b8c9d0e1f', apy: 0.09, tvl: 300000 },
      { protocol: '0x54FA761eB183feD9809cf06A97cd273b39ACE25c', asset: '0xa4b86b26c5c4d1c3d3d8c2c3d4e5f6a7b8c9d0e1f', apy: 0.11, tvl: 200000 },
      { protocol: '0x1111111111111111111111111111111111111111', asset: '0xa4b86b26c5c4d1c3d3d8c2c3d4e5f6a7b8c9d0e1f', apy: 0.07, tvl: 100000 },
      
      // Mock Mcomp APYs
      { protocol: '0xBaf7Dd10B229615246a37CBD595fc2fdD2CD8a8e', asset: '0xb5c86b26c5c4d1c3d3d8c2c3d4e5f6a7b8c9d0e1f', apy: 0.06, tvl: 400000 },
      { protocol: '0x54FA761eB183feD9809cf06A97cd273b39ACE25c', asset: '0xb5c86b26c5c4d1c3d3d8c2c3d4e5f6a7b8c9d0e1f', apy: 0.08, tvl: 300000 },
      { protocol: '0x1111111111111111111111111111111111111111', asset: '0xb5c86b26c5c4d1c3d3d8c2c3d4e5f6a7b8c9d0e1f', apy: 0.05, tvl: 150000 }
    ]
    
    for (const apy of apyData) {
      try {
        await updateAPYData(apy.protocol, apy.asset, apy.apy, apy.tvl)
      } catch (error) {
        console.log(`Error setting APY for ${apy.protocol} - ${apy.asset}:`, error)
      }
    }
    
    // Create some mock user positions
    const mockUserAddress = '0xBe8A37E111BCf8c2a8BD9d85047683e3ffE0C914'
    const mockPositions = [
      {
        userAddress: mockUserAddress,
        assetAddress: '0x64345f22A2D6d31802861B20C21d0e2C4628dE99',
        protocolAddress: '0xAEeA2bCdd633b9A31fc98316244C9C39DFA26CCc',
        amount: 5000000, // 5 USDC
        receiptTokens: 5000000,
        depositedAt: new Date(),
        lastRebalance: new Date()
      }
    ]
    
    for (const position of mockPositions) {
      try {
        await createUserPosition(position)
      } catch (error) {
        console.log(`Error creating user position:`, error)
      }
    }
    
    // Create some mock transactions
    const mockTransactions = [
      {
        userAddress: mockUserAddress,
        type: 'deposit' as const,
        assetAddress: '0x64345f22A2D6d31802861B20C21d0e2C4628dE99',
        amount: 5000000,
        protocolAddress: '0xAEeA2bCdd633b9A31fc98316244C9C39DFA26CCc',
        transactionHash: '0x1234567890123456789012345678901234567890123456789012345678901234',
        blockNumber: 189400178,
        gasUsed: 18107620,
        executedAt: new Date()
      }
    ]
    
    for (const transaction of mockTransactions) {
      try {
        await createUserTransaction(transaction)
      } catch (error) {
        console.log(`Error creating user transaction:`, error)
      }
    }
    
    const response: APIResponse<null> = {
      success: true,
      message: 'Database seeded successfully with mock data'
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error seeding database:', error)
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to seed database'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
