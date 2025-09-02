import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('vesto_yield_aggregator')
    
    // Get rebalancing history, sorted by timestamp (newest first)
    const history = await db.collection('rebalancing_history')
      .find({})
      .sort({ timestamp: -1 })
      .limit(50) // Limit to last 50 transactions
      .toArray()
    
    return NextResponse.json({
      success: true,
      data: history
    })
    
  } catch (error) {
    console.error('Error fetching rebalancing history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rebalancing history' },
      { status: 500 }
    )
  }
}
