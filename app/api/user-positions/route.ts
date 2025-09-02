import { NextRequest, NextResponse } from 'next/server'
import { getUserPositions, createUserPosition, updateUserPosition } from '@/lib/db'
import { APIResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('user')
    
    if (!userAddress) {
      const response: APIResponse<null> = {
        success: false,
        error: 'User address is required'
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    const userPositions = await getUserPositions(userAddress)
    
    const response: APIResponse<any> = {
      success: true,
      data: userPositions
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching user positions:', error)
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to fetch user positions'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userAddress, assetAddress, protocolAddress, amount, receiptTokens, transactionHash, blockNumber } = body
    
    if (!userAddress || !assetAddress || !protocolAddress || !amount || !receiptTokens) {
      const response: APIResponse<null> = {
        success: false,
        error: 'Missing required fields'
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    const newPosition = await createUserPosition({
      userAddress,
      assetAddress,
      protocolAddress,
      amount,
      receiptTokens,
      depositedAt: new Date(),
      lastRebalance: new Date()
    })
    
    const response: APIResponse<any> = {
      success: true,
      data: newPosition,
      message: 'User position created successfully'
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating user position:', error)
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to create user position'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userAddress, assetAddress, amount, receiptTokens } = body
    
    if (!userAddress || !assetAddress || amount === undefined || receiptTokens === undefined) {
      const response: APIResponse<null> = {
        success: false,
        error: 'Missing required fields'
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    await updateUserPosition(userAddress, assetAddress, {
      amount,
      receiptTokens
    })
    
    const response: APIResponse<any> = {
      success: true,
      message: 'User position updated successfully'
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating user position:', error)
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to update user position'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
