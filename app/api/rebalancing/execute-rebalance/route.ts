import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ethers } from 'ethers'

// Real YieldRouter ABI
const YIELD_ROUTER_ABI = [
  {
    "inputs": [{ "name": "asset", "type": "address" }],
    "name": "rebalance",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "asset", "type": "address" }],
    "name": "rebalanceForce",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

const YIELD_ROUTER_ADDRESS = process.env.NEXT_PUBLIC_YIELD_ROUTER_ADDRESS || '0xE7cbBF5098997e6eD3c62d39f975086fc064798b'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assetAddress, fromProtocol, toProtocol, transactionHash } = body
    
    if (!assetAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: assetAddress' },
        { status: 400 }
      )
    }

    // If transactionHash is provided, it means the smart contract call was already made
    // We just need to record it in the database
    if (transactionHash) {
      const client = await clientPromise
      const db = client.db('vesto_yield_aggregator')

      // Record the rebalancing event in rebalancing_history
      const rebalancingRecord = {
        assetAddress: assetAddress.toLowerCase(),
        fromProtocol: fromProtocol || 'unknown',
        toProtocol: toProtocol || 'unknown',
        transactionHash,
        timestamp: new Date(),
        status: 'completed',
        createdAt: new Date()
      }

      await db.collection('rebalancing_history').insertOne(rebalancingRecord)

      console.log('Rebalancing recorded successfully:', rebalancingRecord)

      return NextResponse.json({
        success: true,
        message: 'Rebalancing recorded successfully',
        data: rebalancingRecord
      })
    }

    // If no transactionHash, this is a direct smart contract call
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL
    const privateKey = process.env.PRIVATE_KEY

    if (!rpcUrl || !privateKey) {
      return NextResponse.json(
        { error: 'RPC URL or private key not configured for direct smart contract calls' },
        { status: 500 }
      )
    }

    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const wallet = new ethers.Wallet(privateKey, provider)

    // Create contract instance
    const yieldRouter = new ethers.Contract(YIELD_ROUTER_ADDRESS, YIELD_ROUTER_ABI, wallet)

    // Execute rebalancing transaction
    console.log('Executing rebalancing transaction...')
    const tx = await yieldRouter.rebalance(assetAddress)
    console.log('Transaction sent:', tx.hash)

    // Wait for transaction confirmation
    const receipt = await tx.wait()
    console.log('Transaction confirmed:', receipt)

    // Record the rebalancing event
    const client = await clientPromise
    const db = client.db('vesto_yield_aggregator')

    const rebalancingRecord = {
      assetAddress: assetAddress.toLowerCase(),
      fromProtocol: fromProtocol || 'unknown',
      toProtocol: toProtocol || 'unknown',
      transactionHash: tx.hash,
      timestamp: new Date(),
      status: 'completed',
      createdAt: new Date(),
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    }

    await db.collection('rebalancing_history').insertOne(rebalancingRecord)

    console.log('Rebalancing executed and recorded successfully:', rebalancingRecord)

    return NextResponse.json({
      success: true,
      message: 'Rebalancing executed successfully',
      data: rebalancingRecord
    })
    
  } catch (error) {
    console.error('Error executing rebalancing:', error)
    return NextResponse.json(
      { error: 'Failed to execute rebalancing' },
      { status: 500 }
    )
  }
}
