import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { newAPY } = body // New APY for Mock Aave in basis points (e.g., 800 for 8%)
    
    if (!newAPY || typeof newAPY !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid newAPY parameter' },
        { status: 400 }
      )
    }
    
    const client = await clientPromise
    const db = client.db('vesto_yield_aggregator')
    
    // Convert basis points to decimal (800 -> 0.08)
    const apyDecimal = newAPY / 10000
    
    // Update Aave V3 APY
    const result = await db.collection('apy_data').updateOne(
      { 
        assetAddress: '0xE1Db780adF29B405e4642D75b366FDa3909Cf04c',
        protocolAddress: '0xbaf7dd10b229615246a37cbd595fc2fdd2cd8a8e' // Aave V3
      },
      { 
        $set: { 
          apy: apyDecimal,
          lastUpdate: new Date(),
          updatedAt: new Date()
        }
      }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Aave V3 APY record not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: `Aave V3 APY updated to ${(newAPY / 100).toFixed(2)}%`,
      data: {
        protocol: 'Aave V3',
        newAPY: newAPY,
        newAPYPercentage: (newAPY / 100).toFixed(2) + '%',
        currentProtocol: 'Compound V3 (6.00%)',
        improvement: newAPY - 600, // 600 basis points = 6%
        hasOpportunity: newAPY > 600
      }
    })
    
  } catch (error) {
    console.error('Error updating Aave V3 APY:', error)
    return NextResponse.json(
      { error: 'Failed to update Aave V3 APY' },
      { status: 500 }
    )
  }
}
