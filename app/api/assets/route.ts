import { NextRequest, NextResponse } from 'next/server'
import { getAssets, createAsset } from '@/lib/db'
import { Asset, APIResponse } from '@/lib/types'

export async function GET() {
  try {
    const assets = await getAssets()
    
    const response: APIResponse<Asset[]> = {
      success: true,
      data: assets
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching assets:', error)
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to fetch assets'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { symbol, name, address, decimals, logo } = body
    
    // Validation
    if (!symbol || !name || !address || decimals === undefined) {
      const response: APIResponse<null> = {
        success: false,
        error: 'Missing required fields: symbol, name, address, decimals'
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    // Check if asset already exists
    const existingAsset = await getAssets()
    const assetExists = existingAsset.some(asset => 
      asset.address.toLowerCase() === address.toLowerCase() || 
      asset.symbol.toLowerCase() === symbol.toLowerCase()
    )
    
    if (assetExists) {
      const response: APIResponse<null> = {
        success: false,
        error: 'Asset already exists with this address or symbol'
      }
      return NextResponse.json(response, { status: 409 })
    }
    
    const newAsset = await createAsset({
      symbol,
      name,
      address,
      decimals: Number(decimals),
      logo
    })
    
    const response: APIResponse<Asset> = {
      success: true,
      data: newAsset,
      message: 'Asset created successfully'
    }
    
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating asset:', error)
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to create asset'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
