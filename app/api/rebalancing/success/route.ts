import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assetAddress, fromProtocol, toProtocol, transactionHash } = body

    if (!assetAddress || !fromProtocol || !toProtocol) {
      return NextResponse.json(
        { error: 'Missing required fields: assetAddress, fromProtocol, toProtocol' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('vesto_yield_aggregator')
    
    // Get current APY data for this asset
    const apyData = await db.collection('apy_data').find({
      assetAddress: assetAddress.toLowerCase()
    }).toArray()

    if (apyData.length === 0) {
      return NextResponse.json(
        { error: 'No APY data found for this asset' },
        { status: 404 }
      )
    }

    // Find the APY entries for the protocols involved
    const fromAPY = apyData.find(apy => 
      apy.protocolAddress.toLowerCase() === fromProtocol.toLowerCase()
    )
    const toAPY = apyData.find(apy => 
      apy.protocolAddress.toLowerCase() === toProtocol.toLowerCase()
    )

    if (!fromAPY || !toAPY) {
      return NextResponse.json(
        { error: 'APY data not found for one or both protocols' },
        { status: 404 }
      )
    }

    // Simulate the rebalancing by swapping the APY values
    // In a real scenario, the APY values would be updated based on actual protocol performance
    const tempAPY = fromAPY.currentAPY
    fromAPY.currentAPY = toAPY.currentAPY
    toAPY.currentAPY = tempAPY

    // Update the database with new APY values
    await db.collection('apy_data').updateOne(
      { 
        assetAddress: fromAPY.assetAddress,
        protocolAddress: fromAPY.protocolAddress
      },
      { 
        $set: { 
          currentAPY: fromAPY.currentAPY,
          lastUpdated: new Date()
        }
      }
    )

    await db.collection('apy_data').updateOne(
      { 
        assetAddress: toAPY.assetAddress,
        protocolAddress: toAPY.protocolAddress
      },
      { 
        $set: { 
          currentAPY: toAPY.currentAPY,
          lastUpdated: new Date()
        }
      }
    )

    // Create a rebalancing record for history
    await db.collection('rebalancing_history').insertOne({
      assetAddress: assetAddress.toLowerCase(),
      fromProtocol: fromProtocol.toLowerCase(),
      toProtocol: toProtocol.toLowerCase(),
      transactionHash: transactionHash || null,
      executedAt: new Date(),
      fromAPY: fromAPY.currentAPY,
      toAPY: toAPY.currentAPY
    })

    return NextResponse.json({
      success: true,
      message: 'Rebalancing success recorded and APY data updated',
      data: {
        assetAddress: assetAddress.toLowerCase(),
        fromProtocol: fromProtocol.toLowerCase(),
        toProtocol: toProtocol.toLowerCase(),
        newFromAPY: fromAPY.currentAPY,
        newToAPY: toAPY.currentAPY,
        transactionHash
      }
    })

  } catch (error) {
    console.error('Error processing rebalancing success:', error)
    return NextResponse.json(
      { error: 'Failed to process rebalancing success' },
      { status: 500 }
    )
  }
}
