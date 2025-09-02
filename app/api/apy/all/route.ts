import { NextRequest, NextResponse } from 'next/server'
import { getAPYData } from '@/lib/db'
import { APYData, APIResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assetsParam = searchParams.get('assets')
    
    if (!assetsParam) {
      const response: APIResponse<null> = {
        success: false,
        error: 'Assets parameter is required'
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    const assetAddresses = assetsParam.split(',').filter(addr => addr.trim() !== '')
    
    if (assetAddresses.length === 0) {
      const response: APIResponse<null> = {
        success: false,
        error: 'No valid asset addresses provided'
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    // Get APY data for all assets in parallel
    const allAPYData = await Promise.all(
      assetAddresses.map(async (assetAddress) => {
        try {
          return await getAPYData(assetAddress.trim())
        } catch (error) {
          console.error(`Error fetching APY data for ${assetAddress}:`, error)
          return []
        }
      })
    )
    
    // Flatten the results
    const flattenedAPYData = allAPYData.flat()
    
    const response: APIResponse<APYData[]> = {
      success: true,
      data: flattenedAPYData
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching all APY data:', error)
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to fetch APY data'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
