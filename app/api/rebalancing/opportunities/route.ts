import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'
import clientPromise from '@/lib/mongodb'

// Contract ABI for YieldRouter
const YIELD_ROUTER_ABI = [
  {
    "inputs": [],
    "name": "getSupportedAssets",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "asset",
        "type": "address"
      }
    ],
    "name": "getCurrentAPY",
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
    "inputs": [
      {
        "internalType": "address",
        "name": "asset",
        "type": "address"
      }
    ],
    "name": "findBestProtocol",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "asset",
        "type": "address"
      }
    ],
    "name": "getBestAPY",
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
    "name": "minDeltaBps",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

const YIELD_ROUTER_ADDRESS = process.env.YIELD_ROUTER_ADDRESS || '0x1234567890123456789012345678901234567890'

export async function GET(request: NextRequest) {
  try {
    // First, try to get APY data from database
    const client = await clientPromise
    const db = client.db('vesto_yield_aggregator')
    const apyData = await db.collection('apy_data').find({}).toArray()
    
    // If we have APY data in database, use it for dynamic rebalancing
    if (apyData.length > 0) {
      const minDeltaBps = 50 // Default minimum threshold in basis points
      const opportunities = []
      
      // Get asset and protocol information
      const assets = await db.collection('assets').find({}).toArray()
      const protocols = await db.collection('protocols').find({}).toArray()
      
      // Transform APY data to match expected format (convert decimal to basis points)
      const transformedApyData = apyData.map(item => ({
        ...item,
        currentAPY: Math.round((item.apy || 0) * 10000) // Convert decimal to basis points (0.05 -> 500)
      }))
      
      // Group APY data by asset
      const assetAPYMap = new Map()
      transformedApyData.forEach(apy => {
        if (!assetAPYMap.has(apy.assetAddress)) {
          assetAPYMap.set(apy.assetAddress, [])
        }
        assetAPYMap.get(apy.assetAddress).push(apy)
      })
      
      // Process each asset
      for (const [assetAddress, apyList] of assetAPYMap) {
        if (apyList.length < 2) continue // Need at least 2 protocols to compare
        
        // Find current protocol (marked as isCurrent: true) and best available protocol
        const currentProtocolData = apyList.find(apy => apy.isCurrent === true)
        const otherProtocols = apyList.filter(apy => apy.isCurrent !== true)
        
        if (!currentProtocolData || otherProtocols.length === 0) continue
        
        // Find the best alternative protocol
        const bestAlternative = otherProtocols.reduce((best, current) => 
          current.currentAPY > best.currentAPY ? current : best
        )
        
        const currentAPY = currentProtocolData.currentAPY
        const bestAPY = bestAlternative.currentAPY
        const bestProtocol = bestAlternative.protocolAddress
        const currentProtocol = currentProtocolData.protocolAddress
        
        // Calculate improvement in basis points
        const improvement = bestAPY - currentAPY
        
        // Check if improvement meets minimum threshold
        const isOpportunity = improvement >= minDeltaBps
        
        // Find asset and protocol information
        const asset = assets.find(a => a.address.toLowerCase() === assetAddress.toLowerCase())
        const bestProtocolInfo = protocols.find(p => p.address.toLowerCase() === bestProtocol.toLowerCase())
        const currentProtocolInfo = protocols.find(p => p.address.toLowerCase() === currentProtocol.toLowerCase())
        
        // Map lowercase addresses back to correct case-sensitive addresses for smart contract
        const correctCaseMapping: { [key: string]: string } = {
          '0x54fa761eb183fed9809cf06a97cd273b39ace25c': '0x54FA761eB183feD9809cf06A97cd273b39ACE25c', // Mock Compound
          '0xbaf7dd10b229615246a37cbd595fc2fdd2cd8a8e': '0xBaf7Dd10B229615246a37CBD595fc2fdD2CD8a8e'  // Mock Aave
        }
        
        const correctBestProtocol = correctCaseMapping[bestProtocol.toLowerCase()] || bestProtocol
        const correctCurrentProtocol = correctCaseMapping[currentProtocol.toLowerCase()] || currentProtocol
        
        opportunities.push({
          assetAddress,
          assetSymbol: asset?.symbol || 'Unknown',
          assetName: asset?.name || 'Unknown Asset',
          currentAPY,
          bestAPY,
          improvement,
          bestProtocol: correctBestProtocol,
          bestProtocolName: bestProtocolInfo?.name || 'Unknown Protocol',
          currentProtocol: correctCurrentProtocol,
          currentProtocolName: currentProtocolInfo?.name || 'Unknown Protocol',
          isOpportunity,
          minDeltaBps,
          protocolCount: apyList.length
        })
      }

      return NextResponse.json({
        opportunities,
        minDeltaBps,
        totalAssets: assetAPYMap.size,
        opportunitiesCount: opportunities.filter(op => op.isOpportunity).length,
        isDynamic: true,
        dataSource: 'database'
      })
    }

    // Fallback to smart contract data if no database APY data
    // Check if RPC URL is configured
    if (!process.env.ARBITRUM_SEPOLIA_RPC_URL) {
      return NextResponse.json(
        { error: 'RPC URL not configured. Please set ARBITRUM_SEPOLIA_RPC_URL environment variable.' },
        { status: 500 }
      )
    }

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

    const router = new ethers.Contract(YIELD_ROUTER_ADDRESS, YIELD_ROUTER_ABI, provider)

    // Get supported assets
    const supportedAssets = await router.getSupportedAssets()
    
    // Get minimum delta for rebalancing
    const minDeltaBps = await router.minDeltaBps()
    
    const opportunities = []
    
    for (const asset of supportedAssets) {
      try {
        // Get current APY and best APY
        const currentAPY = await router.getCurrentAPY(asset)
        const bestAPY = await router.getBestAPY(asset)
        const bestProtocol = await router.findBestProtocol(asset)
        
        // Calculate improvement in basis points
        const improvement = bestAPY - currentAPY
        
        // Check if improvement meets minimum threshold
        const isOpportunity = improvement >= minDeltaBps
        
        opportunities.push({
          assetAddress: asset,
          currentAPY: Number(currentAPY),
          bestAPY: Number(bestAPY),
          improvement: Number(improvement),
          bestProtocol,
          isOpportunity,
          minDeltaBps: Number(minDeltaBps)
        })
      } catch (error) {
        console.error(`Error fetching data for asset ${asset}:`, error)
        // Continue with other assets even if one fails
      }
    }

    return NextResponse.json({
      opportunities,
      minDeltaBps: Number(minDeltaBps),
      totalAssets: supportedAssets.length,
      opportunitiesCount: opportunities.filter(op => op.isOpportunity).length,
      isDynamic: false,
      dataSource: 'smart_contract'
    })

  } catch (error) {
    console.error('Error fetching rebalancing opportunities:', error)
    
    // Return mock data for development when network connection fails
    const mockOpportunities = [
      {
        assetAddress: '0x1234567890123456789012345678901234567890',
        currentAPY: 500, // 5.00%
        bestAPY: 750, // 7.50%
        improvement: 250, // 2.50%
        bestProtocol: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        isOpportunity: true,
        minDeltaBps: 50 // 0.50%
      },
      {
        assetAddress: '0x2345678901234567890123456789012345678901',
        currentAPY: 600, // 6.00%
        bestAPY: 620, // 6.20%
        improvement: 20, // 0.20%
        bestProtocol: '0xbcdefabcdefabcdefabcdefabcdefabcdefabcde',
        isOpportunity: false,
        minDeltaBps: 50 // 0.50%
      }
    ]

    return NextResponse.json({
      opportunities: mockOpportunities,
      minDeltaBps: 50,
      totalAssets: 2,
      opportunitiesCount: 1,
      isMockData: true,
      error: 'Using mock data due to network connection issues'
    })
  }
}
