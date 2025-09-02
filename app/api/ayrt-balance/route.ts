import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, formatEther } from 'viem'
import { arbitrumSepolia } from 'viem/chains'

const RECEIPT_TOKEN_ADDRESS = '0xB5B13D115aaAECb30Bb344352B3967d647556E28'

const ERC20_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('user')
    
    if (!userAddress) {
      return NextResponse.json({
        success: false,
        error: 'User address is required'
      }, { status: 400 })
    }

    // Create a public client for Arbitrum Sepolia
    const publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http()
    })

    // Get aYRT balance from smart contract
    const balanceWei = await publicClient.readContract({
      address: RECEIPT_TOKEN_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [userAddress as `0x${string}`]
    })

    // Get token decimals (should be 18 for aYRT)
    const decimals = await publicClient.readContract({
      address: RECEIPT_TOKEN_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'decimals'
    })

    // Format balance to human readable format
    const balanceFormatted = formatEther(balanceWei)

    return NextResponse.json({
      success: true,
      data: {
        balance: balanceFormatted,
        balanceWei: balanceWei.toString(),
        decimals: Number(decimals),
        tokenAddress: RECEIPT_TOKEN_ADDRESS
      }
    })

  } catch (error) {
    console.error('Error fetching aYRT balance:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch aYRT balance'
    }, { status: 500 })
  }
}