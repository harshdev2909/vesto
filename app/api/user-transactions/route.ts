import { NextRequest, NextResponse } from 'next/server'
import { getUserTransactions, createUserTransaction } from '@/lib/db'
import { APIResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('user')
    const type = searchParams.get('type') // Optional filter by transaction type
    const limit = parseInt(searchParams.get('limit') || '20')
    
    if (!userAddress) {
      const response: APIResponse<null> = {
        success: false,
        error: 'User address is required'
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    const transactions = await getUserTransactions(userAddress, limit)
    
    // Filter by type if specified
    const filteredTransactions = type 
      ? transactions.filter(tx => tx.type === type)
      : transactions
    
    const response: APIResponse<any> = {
      success: true,
      data: filteredTransactions
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching user transactions:', error)
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to fetch user transactions'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userAddress, type, assetAddress, amount, transactionHash, blockNumber, gasUsed, executedAt } = body
    
    if (!userAddress || !type || !assetAddress || !amount || !transactionHash) {
      const response: APIResponse<null> = {
        success: false,
        error: 'Missing required fields'
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    const newTransaction = await createUserTransaction({
      userAddress,
      type,
      assetAddress,
      amount: Number(amount),
      transactionHash,
      blockNumber: Number(blockNumber) || 0,
      gasUsed: Number(gasUsed) || 0,
      executedAt: executedAt ? new Date(executedAt) : new Date()
    })
    
    const response: APIResponse<any> = {
      success: true,
      data: newTransaction,
      message: 'User transaction created successfully'
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating user transaction:', error)
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to create user transaction'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
