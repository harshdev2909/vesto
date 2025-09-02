import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

// Contract ABI for YieldRouter
const YIELD_ROUTER_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "asset",
        "type": "address"
      }
    ],
    "name": "rebalance",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "assets",
        "type": "address[]"
      }
    ],
    "name": "batchRebalance",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

const YIELD_ROUTER_ADDRESS = process.env.YIELD_ROUTER_ADDRESS || '0x1234567890123456789012345678901234567890'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assetAddress, userAddress, privateKey } = body

    if (!assetAddress) {
      return NextResponse.json(
        { error: 'Asset address is required' },
        { status: 400 }
      )
    }

    if (!userAddress || !privateKey) {
      return NextResponse.json(
        { error: 'User address and private key are required for execution' },
        { status: 400 }
      )
    }

    // Check if RPC URL is configured
    if (!process.env.ARBITRUM_SEPOLIA_RPC_URL) {
      return NextResponse.json(
        { error: 'RPC URL not configured. Please set ARBITRUM_SEPOLIA_RPC_URL environment variable.' },
        { status: 500 }
      )
    }

    // Create wallet and provider
    const provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_SEPOLIA_RPC_URL)
    
    // Test connection
    try {
      await provider.getNetwork()
    } catch (networkError) {
      console.error('Network connection failed:', networkError)
      return NextResponse.json(
        { error: 'Failed to connect to Arbitrum Sepolia network. Please check your RPC URL.' },
        { status: 500 }
      )
    }

    const wallet = new ethers.Wallet(privateKey, provider)
    const router = new ethers.Contract(YIELD_ROUTER_ADDRESS, YIELD_ROUTER_ABI, wallet)

    // Execute rebalancing
    const tx = await router.rebalance(assetAddress, {
      gasLimit: 500000 // Set appropriate gas limit
    })

    // Wait for transaction confirmation
    const receipt = await tx.wait()

    return NextResponse.json({
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      message: 'Rebalancing executed successfully'
    })

  } catch (error) {
    console.error('Error executing rebalancing:', error)
    return NextResponse.json(
      { error: 'Failed to execute rebalancing', details: error.message },
      { status: 500 }
    )
  }
}
