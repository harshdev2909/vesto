import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, email, emailNotifications } = body

    if (!walletAddress || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: walletAddress, email' },
        { status: 400 }
      )
    }

    const usersCollection = await getCollection('users')
    
    // Update or create user email preferences
    await usersCollection.updateOne(
      { walletAddress },
      {
        $set: {
          email,
          emailNotifications: emailNotifications ?? true,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Email preferences updated successfully'
    })
  } catch (error) {
    console.error('Error updating email preferences:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('address')

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing wallet address' },
        { status: 400 }
      )
    }

    const usersCollection = await getCollection('users')
    const user = await usersCollection.findOne({ walletAddress })

    return NextResponse.json({
      success: true,
      data: {
        email: user?.email || null,
        emailNotifications: user?.emailNotifications ?? true
      }
    })
  } catch (error) {
    console.error('Error fetching email preferences:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
