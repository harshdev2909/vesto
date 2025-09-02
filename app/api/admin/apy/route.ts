import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// APY data structure
interface APYData {
  assetAddress: string
  protocolAddress: string
  currentAPY: number // in basis points
  lastUpdated: Date
}

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('vesto_yield_aggregator')
    const rawApyData = await db.collection('apy_data').find({}).toArray()
    
    // Transform the data to match frontend expectations
    const apyData = rawApyData.map(item => ({
      _id: item._id,
      assetAddress: item.assetAddress,
      protocolAddress: item.protocolAddress,
      currentAPY: Math.round((item.apy || 0) * 10000), // Convert decimal to basis points (0.05 -> 500)
      lastUpdated: item.lastUpdate || item.updatedAt || new Date(),
      createdAt: item.createdAt,
      totalValueLocked: item.totalValueLocked,
      isCurrent: item.isCurrent // Include the isCurrent flag
    }))
    
    return NextResponse.json({
      success: true,
      data: apyData
    })
  } catch (error) {
    console.error('Error fetching APY data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch APY data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assetAddress, protocolAddress, currentAPY } = body

    console.log('APY POST request body:', { assetAddress, protocolAddress, currentAPY })

    if (!assetAddress || !protocolAddress || currentAPY === undefined) {
      console.error('Missing required fields:', { assetAddress, protocolAddress, currentAPY })
      return NextResponse.json(
        { error: 'Missing required fields: assetAddress, protocolAddress, currentAPY' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('vesto_yield_aggregator')
    console.log('Database connected successfully')
    
    // Convert basis points to decimal for storage (500 -> 0.05)
    const apyDecimal = currentAPY / 10000
    
    // Upsert APY data (update if exists, insert if not)
    const result = await db.collection('apy_data').updateOne(
      { 
        assetAddress: assetAddress.toLowerCase(),
        protocolAddress: protocolAddress.toLowerCase()
      },
      { 
        $set: { 
          assetAddress: assetAddress.toLowerCase(),
          protocolAddress: protocolAddress.toLowerCase(),
          apy: apyDecimal, // Store as decimal in database
          lastUpdate: new Date(),
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date(),
          totalValueLocked: 0 // Default value
        }
      },
      { upsert: true }
    )

    console.log('APY data upsert result:', result)

    return NextResponse.json({
      success: true,
      message: 'APY data updated successfully',
      data: {
        assetAddress: assetAddress.toLowerCase(),
        protocolAddress: protocolAddress.toLowerCase(),
        currentAPY: Number(currentAPY),
        lastUpdated: new Date()
      }
    })
  } catch (error) {
    console.error('Error updating APY data:', error)
    return NextResponse.json(
      { error: 'Failed to update APY data' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assetAddress = searchParams.get('assetAddress')
    const protocolAddress = searchParams.get('protocolAddress')

    if (!assetAddress || !protocolAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters: assetAddress, protocolAddress' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('vesto_yield_aggregator')
    
    const result = await db.collection('apy_data').deleteOne({
      assetAddress: assetAddress.toLowerCase(),
      protocolAddress: protocolAddress.toLowerCase()
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'APY data not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'APY data deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting APY data:', error)
    return NextResponse.json(
      { error: 'Failed to delete APY data' },
      { status: 500 }
    )
  }
}
