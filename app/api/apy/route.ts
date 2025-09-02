import { NextRequest, NextResponse } from 'next/server'
import { getAPYData, getBestAPY, updateAPYData } from '@/lib/db'
import { APYData, APIResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assetAddress = searchParams.get('asset')
    
    if (!assetAddress) {
      const response: APIResponse<null> = {
        success: false,
        error: 'Asset address is required'
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    const apyData = await getAPYData(assetAddress)
    
    const response: APIResponse<APYData[]> = {
      success: true,
      data: apyData
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching APY data:', error)
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to fetch APY data'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { protocolAddress, assetAddress, apy, totalValueLocked } = body
    
    // Validation
    if (!protocolAddress || !assetAddress || apy === undefined || totalValueLocked === undefined) {
      const response: APIResponse<null> = {
        success: false,
        error: 'Missing required fields: protocolAddress, assetAddress, apy, totalValueLocked'
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    // Validate APY is between 0 and 1 (0% to 100%)
    if (apy < 0 || apy > 1) {
      const response: APIResponse<null> = {
        success: false,
        error: 'APY must be between 0 and 1 (0% to 100%)'
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    // Validate totalValueLocked is positive
    if (totalValueLocked <= 0) {
      const response: APIResponse<null> = {
        success: false,
        error: 'Total value locked must be positive'
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    await updateAPYData(protocolAddress, assetAddress, apy, totalValueLocked)
    
    const response: APIResponse<null> = {
      success: true,
      message: 'APY data updated successfully'
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating APY data:', error)
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to update APY data'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
