import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { APIResponse } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    // Check if this is a development environment
    if (process.env.NODE_ENV === 'production') {
      const response: APIResponse<null> = {
        success: false,
        error: 'Cleanup is not allowed in production'
      }
      return NextResponse.json(response, { status: 403 })
    }
    
    const client = await clientPromise
    const db = client.db('vesto_yield_aggregator')
    
    // Clean up duplicate assets
    const assetsCollection = db.collection('assets')
    const assets = await assetsCollection.find({}).toArray()
    
    // Group by symbol and keep only the latest one
    const assetGroups = new Map()
    assets.forEach(asset => {
      if (!assetGroups.has(asset.symbol) || 
          new Date(asset.createdAt) > new Date(assetGroups.get(asset.symbol).createdAt)) {
        assetGroups.set(asset.symbol, asset)
      }
    })
    
    // Remove duplicates and keep only mUSDC
    const assetIdsToKeep = Array.from(assetGroups.values())
      .filter(a => a.symbol === 'mUSDC')
      .map(a => a._id)
    const assetDeleteResult = await assetsCollection.deleteMany({
      _id: { $nin: assetIdsToKeep }
    })
    
    // Clean up duplicate user positions (keep only real ones)
    const positionsCollection = db.collection('user_positions')
    const positions = await positionsCollection.find({}).toArray()
    
    // Remove all seed data positions (they don't have real transaction hashes)
    // Keep only positions that have real transaction hashes
    const positionDeleteResult = await positionsCollection.deleteMany({
      $or: [
        { transactionHash: { $exists: false } },
        { transactionHash: { $in: [
          '0x1234567890123456789012345678901234567890123456789012345678901234'
        ]}},
        { transactionHash: null }
      ]
    })
    
    // Clean up duplicate transactions
    const transactionsCollection = db.collection('user_transactions')
    const transactions = await transactionsCollection.find({}).toArray()
    
    // Remove transactions with fake hashes
    const fakeTxHashes = [
      '0x1234567890123456789012345678901234567890123456789012345678901234'
    ]
    const txDeleteResult = await transactionsCollection.deleteMany({
      transactionHash: { $in: fakeTxHashes }
    })
    
    const response: APIResponse<any> = {
      success: true,
      message: 'Database cleaned successfully',
      data: {
        assetsRemoved: assetDeleteResult.deletedCount,
        positionsRemoved: positionDeleteResult.deletedCount,
        transactionsRemoved: txDeleteResult.deletedCount
      }
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error cleaning database:', error)
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to clean database'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
