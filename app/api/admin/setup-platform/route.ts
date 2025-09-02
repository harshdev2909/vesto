import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST() {
  try {
    const client = await clientPromise
    const db = client.db('vesto_yield_aggregator')
    
    // Clear all collections
    await db.collection('apy_data').deleteMany({})
    await db.collection('assets').deleteMany({})
    await db.collection('protocols').deleteMany({})
    
    // Add platform asset
    const asset = {
      symbol: 'mUSDC',
      name: 'Mock USDC',
      address: '0xE1Db780adF29B405e4642D75b366FDa3909Cf04c',
      decimals: 6,
      logo: '/abstract-geometric-shapes.png',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    await db.collection('assets').insertOne(asset)
    
    // Add only two real protocols (remove Mock Lido)
    const protocols = [
      {
        name: 'Aave V3',
        address: '0xBaf7Dd10B229615246a37CBD595fc2fdD2CD8a8e',
        vaultAddress: '0xBaf7Dd10B229615246a37CBD595fc2fdD2CD8a8e',
        description: 'Aave V3 lending protocol',
        website: 'https://aave.com',
        logo: '/abstract-geometric-shapes.png',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Compound V3',
        address: '0x54FA761eB183feD9809cf06A97cd273b39ACE25c',
        vaultAddress: '0x54FA761eB183feD9809cf06A97cd273b39ACE25c',
        description: 'Compound V3 lending protocol',
        website: 'https://compound.finance',
        logo: '/abstract-geometric-shapes.png',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
    await db.collection('protocols').insertMany(protocols)
    
    // Add APY data with Compound V3 as current and Aave V3 as potential
    const apyData = [
      {
        assetAddress: '0xE1Db780adF29B405e4642D75b366FDa3909Cf04c',
        protocolAddress: '0x54FA761eB183feD9809cf06A97cd273b39ACE25c', // Compound V3 (current)
        apy: 0.06, // 6% APY (current protocol)
        totalValueLocked: 1000000,
        isCurrent: true, // Mark as current protocol
        createdAt: new Date(),
        lastUpdate: new Date(),
        updatedAt: new Date()
      },
      {
        assetAddress: '0xE1Db780adF29B405e4642D75b366FDa3909Cf04c',
        protocolAddress: '0xBaf7Dd10B229615246a37CBD595fc2fdD2CD8a8e', // Aave V3 (potential)
        apy: 0.05, // 5% APY (lower than current, no opportunity yet)
        totalValueLocked: 500000,
        isCurrent: false, // Mark as potential protocol
        createdAt: new Date(),
        lastUpdate: new Date(),
        updatedAt: new Date()
      }
    ]
    await db.collection('apy_data').insertMany(apyData)
    
    return NextResponse.json({
      success: true,
      message: 'Platform setup completed with Aave V3 and Compound V3 protocols',
      data: {
        assets: 1,
        protocols: 2,
        apyRecords: 2,
        currentProtocol: 'Compound V3 (6% APY)',
        potentialProtocol: 'Aave V3 (5% APY)',
        note: 'Admin can increase Aave V3 APY to create rebalancing opportunities'
      }
    })
    
  } catch (error) {
    console.error('Error setting up platform:', error)
    return NextResponse.json(
      { error: 'Failed to setup platform' },
      { status: 500 }
    )
  }
}
