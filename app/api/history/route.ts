import { NextRequest, NextResponse } from 'next/server'
import { createHistoryEntry, getHistoryEntries } from '@/lib/db-operations'

// GET /api/history?wallet=0x... - Get transaction history for a wallet
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')
    
    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Fetch all transactions for the wallet
    const transactions = await getHistoryEntries(wallet)

    return NextResponse.json({
      success: true,
      data: transactions
    })
  } catch (error) {
    console.error('Error fetching history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transaction history' },
      { status: 500 }
    )
  }
}

// POST /api/history - Save new transaction event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      walletAddress, 
      type, 
      assetAddress, 
      amount, 
      transactionHash, 
      blockNumber,
      gasUsed,
      protocolAddress,
      oldAPY,
      newAPY
    } = body

    // Validate required fields
    if (!walletAddress || !type || !transactionHash) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create history entry
    const historyEntry = await createHistoryEntry({
      walletAddress,
      type, // 'deposit', 'withdraw', 'rebalance'
      assetAddress: assetAddress || undefined,
      amount: amount || 0,
      transactionHash,
      blockNumber: blockNumber || 0,
      gasUsed: gasUsed || 0,
      protocolAddress: protocolAddress || undefined,
      oldAPY: oldAPY || undefined,
      newAPY: newAPY || undefined
    })

    return NextResponse.json({
      success: true,
      data: historyEntry
    })
  } catch (error) {
    console.error('Error saving history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save transaction history' },
      { status: 500 }
    )
  }
}
