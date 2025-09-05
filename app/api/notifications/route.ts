import { NextRequest, NextResponse } from 'next/server'
import { 
  createNotification, 
  getNotifications, 
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead 
} from '@/lib/db-operations'

// GET /api/notifications?wallet=0x... - Get notifications for a wallet
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    
    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Fetch notifications
    const notifications = await getNotifications(wallet, unreadOnly)
    
    // Get unread count
    const unreadCount = await getUnreadNotificationCount(wallet)

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Create new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      walletAddress, 
      message, 
      type = 'info', // 'info', 'success', 'warning', 'error'
      data = {} // Additional data for the notification
    } = body

    // Validate required fields
    if (!walletAddress || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create notification
    const notification = await createNotification({
      walletAddress,
      message,
      type,
      data,
      timestamp: new Date(),
      read: false
    })

    return NextResponse.json({
      success: true,
      data: notification
    })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

// PUT /api/notifications - Mark notification as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationId, walletAddress } = body

    if (!notificationId || !walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Mark notification as read
    const success = await markNotificationAsRead(notificationId, walletAddress)

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Notification marked as read'
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Notification not found or already read' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications - Mark all notifications as read for a wallet
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')
    
    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Mark all notifications as read for the wallet
    const modifiedCount = await markAllNotificationsAsRead(wallet)

    return NextResponse.json({
      success: true,
      message: `Marked ${modifiedCount} notifications as read`
    })
  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to mark notifications as read' },
      { status: 500 }
    )
  }
}
