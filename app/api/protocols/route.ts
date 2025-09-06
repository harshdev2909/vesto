import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Return mock protocol data for now
    const protocols = [
      {
        name: "Aave V3",
        apyPercentage: 3.2,
        protocolName: "Aave V3"
      },
      {
        name: "Compound V3", 
        apyPercentage: 2.8,
        protocolName: "Compound V3"
      }
    ]

    return NextResponse.json({
      success: true,
      data: protocols
    })
  } catch (error) {
    console.error('Error fetching protocols:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch protocols'
    }, { status: 500 })
  }
}