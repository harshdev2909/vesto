import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Generate random funding rate between -5% to +20% APY
    const rate = (Math.random() - 0.2) * 0.25 // -5% to +20%
    
    const fundingRate = {
      rate: Number(rate.toFixed(4)),
      timestamp: Date.now(),
      protocol: 'hyperliquid',
      asset: 'ETH-USD', // Mock asset
      isPositive: rate > 0
    }

    return NextResponse.json({
      success: true,
      data: fundingRate
    })
  } catch (error) {
    console.error('Error fetching funding rate:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch funding rate' },
      { status: 500 }
    )
  }
}
