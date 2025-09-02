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
    
    // Add clean platform data
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
    
    const protocols = [
      {
        name: 'Mock Aave',
        address: '0xbaf7dd10b229615246a37cbd595fc2fdd2cd8a8e',
        vaultAddress: '0xbaf7dd10b229615246a37cbd595fc2fdd2cd8a8e',
        description: 'Mock Aave lending protocol',
        website: 'https://aave.com',
        logo: '/abstract-geometric-shapes.png',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mock Compound',
        address: '0x54fa761eb183fed9809cf06a97cd273b39ace25c',
        vaultAddress: '0x54fa761eb183fed9809cf06a97cd273b39ace25c',
        description: 'Mock Compound lending protocol',
        website: 'https://compound.finance',
        logo: '/abstract-geometric-shapes.png',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mock Lido',
        address: '0x1111111111111111111111111111111111111111',
        vaultAddress: '0x1111111111111111111111111111111111111111',
        description: 'Mock Lido staking protocol',
        website: 'https://lido.fi',
        logo: '/abstract-geometric-shapes.png',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
    await db.collection('protocols').insertMany(protocols)
    
    const apyData = [
      {
        assetAddress: '0xE1Db780adF29B405e4642D75b366FDa3909Cf04c',
        protocolAddress: '0xbaf7dd10b229615246a37cbd595fc2fdd2cd8a8e',
        apy: 0.05, // 5% APY
        totalValueLocked: 1000000,
        createdAt: new Date(),
        lastUpdate: new Date(),
        updatedAt: new Date()
      },
      {
        assetAddress: '0xE1Db780adF29B405e4642D75b366FDa3909Cf04c',
        protocolAddress: '0x54fa761eb183fed9809cf06a97cd273b39ace25c',
        apy: 0.08, // 8% APY
        totalValueLocked: 2000000,
        createdAt: new Date(),
        lastUpdate: new Date(),
        updatedAt: new Date()
      },
      {
        assetAddress: '0xE1Db780adF29B405e4642D75b366FDa3909Cf04c',
        protocolAddress: '0x1111111111111111111111111111111111111111',
        apy: 0.03, // 3% APY
        totalValueLocked: 500000,
        createdAt: new Date(),
        lastUpdate: new Date(),
        updatedAt: new Date()
      }
    ]
    await db.collection('apy_data').insertMany(apyData)
    
    return NextResponse.json({
      success: true,
      message: 'Database cleared and seeded with clean platform data',
      data: {
        assets: 1,
        protocols: 3,
        apyRecords: 3
      }
    })
    
  } catch (error) {
    console.error('Error clearing database:', error)
    return NextResponse.json(
      { error: 'Failed to clear database' },
      { status: 500 }
    )
  }
}
