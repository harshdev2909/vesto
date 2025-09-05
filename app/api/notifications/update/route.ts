import { NextRequest, NextResponse } from 'next/server'
import { updateNotificationByTransactionHash } from '@/lib/db-operations'

// PUT /api/notifications/update - Update notification by transaction hash
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

    // Update notification
    const success = await updateNotificationByTransactionHash(transactionHash, walletAddress, updates)

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Notification not found or update failed' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notification updated successfully'
    })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

