import { NextRequest, NextResponse } from 'next/server'
import { updateTransactionStatus } from '@/lib/db-operations'

// PUT /api/history/update - Update transaction status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      transactionHash, 
      walletAddress, 
      updates 
    } = body

    // Validate required fields
    if (!transactionHash || !walletAddress || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update transaction status
    const success = await updateTransactionStatus(transactionHash, walletAddress, updates)

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found or update failed' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction updated successfully'
    })
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}

