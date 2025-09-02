import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'
import clientPromise from '@/lib/mongodb'

// Real YieldRouter ABI with actual functions
const YIELD_ROUTER_ABI = [
  {
    "inputs": [],
    "name": "getSupportedAssets",
    "outputs": [{ "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "checkData", "type": "bytes" }
    ],
    "name": "checkUpkeep",
    "outputs": [
      { "name": "upkeepNeeded", "type": "bool" },
      { "name": "performData", "type": "bytes" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "minDeltaBps",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "asset", "type": "address" }],
    "name": "assetPositions",
    "outputs": [
      { "name": "asset", "type": "address" },
      { "name": "totalDeposited", "type": "uint256" },
      { "name": "currentProtocol", "type": "address" },
      { "name": "protocolShares", "type": "uint256" },
      { "name": "lastRebalance", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Real YieldAggregator ABI
const YIELD_AGGREGATOR_ABI = [
  {
    "inputs": [{ "name": "asset", "type": "address" }],
    "name": "getBestYield",
    "outputs": [
      { "name": "protocol", "type": "address" },
      { "name": "apy", "type": "uint256" },
      { "name": "protocolName", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "asset", "type": "address" }],
    "name": "compareYields",
    "outputs": [
      {
        "name": "comparisons",
        "type": "tuple[]",
        "components": [
          { "name": "protocol", "type": "address" },
          { "name": "protocolName", "type": "string" },
          { "name": "apy", "type": "uint256" },
          { "name": "totalValueLocked", "type": "uint256" }
        ]
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

const YIELD_ROUTER_ADDRESS = process.env.NEXT_PUBLIC_YIELD_ROUTER_ADDRESS || '0xa706f8DA7934F6d8c08BC80B3B9cc30bb6c96878'
const YIELD_AGGREGATOR_ADDRESS = process.env.NEXT_PUBLIC_YIELD_AGGREGATOR_ADDRESS || '0xd7394A378d03c09Fb6357681da0Eae43Bd1A772a'

export async function GET() {
  try {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL
    
    if (!rpcUrl) {
      console.error('RPC URL not configured')
      return NextResponse.json({
        success: false,
        error: 'RPC URL not configured',
        opportunities: [],
        minDeltaBps: 50,
        totalAssets: 0,
        opportunitiesCount: 0,
        isDynamic: false,
        dataSource: 'error'
      })
    }

    // Create provider
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    
    // Test connection
    try {
      await provider.getBlockNumber()
    } catch (error) {
      console.error('Failed to connect to RPC:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to blockchain',
        opportunities: [],
        minDeltaBps: 50,
        totalAssets: 0,
        opportunitiesCount: 0,
        isDynamic: false,
        dataSource: 'error'
      })
    }

    // Create contract instances
    const yieldRouter = new ethers.Contract(YIELD_ROUTER_ADDRESS, YIELD_ROUTER_ABI, provider)
    const yieldAggregator = new ethers.Contract(YIELD_AGGREGATOR_ADDRESS, YIELD_AGGREGATOR_ABI, provider)

    // Get supported assets from smart contract
    const supportedAssets = await yieldRouter.getSupportedAssets()
    console.log('Supported assets from contract:', supportedAssets)

    // Get minimum delta from contract
    const minDeltaBps = await yieldRouter.minDeltaBps()
    console.log('Min delta from contract:', minDeltaBps.toString())

    // Check if upkeep is needed
    const upkeepCheck = await yieldRouter.checkUpkeep('0x')
    console.log('Upkeep check:', upkeepCheck)

    const opportunities = []

    // For each supported asset, check for rebalancing opportunities
    for (const assetAddress of supportedAssets) {
      try {
        // Get yield comparison from YieldAggregator
        const yieldComparisons = await yieldAggregator.compareYields(assetAddress)
        console.log(`Yield comparisons for ${assetAddress}:`, yieldComparisons)

        if (yieldComparisons.length < 2) {
          continue // Need at least 2 protocols to compare
        }

        // Sort by APY (highest first) - create a copy first since the original is read-only
        const sortedComparisons = [...yieldComparisons].sort((a: any, b: any) => Number(b.apy) - Number(a.apy))
        
        const bestProtocol = sortedComparisons[0]
        
        // Get the actual current protocol from the vault
        const assetPosition = await yieldRouter.assetPositions(assetAddress)
        const currentProtocolAddress = assetPosition.currentProtocol
        
        // Find the current protocol in the yield comparisons
        const currentProtocolData = yieldComparisons.find((comp: any) => 
          comp.protocol.toLowerCase() === currentProtocolAddress.toLowerCase()
        )
        
        if (!currentProtocolData) {
          console.log(`Current protocol ${currentProtocolAddress} not found in yield comparisons`)
          continue
        }
        
        // Calculate improvement in basis points
        // Convert raw APY values to basis points (divide by 1e14)
        const bestAPYInBps = Number(bestProtocol.apy) / 1e14
        const currentAPYInBps = Number(currentProtocolData.apy) / 1e14
        const improvement = bestAPYInBps - currentAPYInBps
        const isOpportunity = improvement >= Number(minDeltaBps)
        
        console.log(`Asset ${assetAddress}:`)
        console.log(`  Best APY: ${bestAPYInBps} bps (${bestProtocol.protocolName})`)
        console.log(`  Current APY: ${currentAPYInBps} bps (${currentProtocolData.protocolName})`)
        console.log(`  Improvement: ${improvement} bps`)
        console.log(`  Min Delta Required: ${Number(minDeltaBps)} bps`)
        console.log(`  Is Opportunity: ${isOpportunity}`)

        if (isOpportunity) {
          opportunities.push({
            assetAddress,
            assetSymbol: 'mUSDC', // TODO: Get from asset registry
            assetName: 'Mock USDC',
            currentAPY: currentAPYInBps, // Already converted to basis points
            bestAPY: bestAPYInBps, // Already converted to basis points
            improvement,
            bestProtocol: bestProtocol.protocol,
            bestProtocolName: bestProtocol.protocolName,
            currentProtocol: currentProtocolData.protocol,
            currentProtocolName: currentProtocolData.protocolName,
            isOpportunity: true,
            minDeltaBps: Number(minDeltaBps),
            protocolCount: yieldComparisons.length
          })
        }
      } catch (error) {
        console.error(`Error processing asset ${assetAddress}:`, error)
        continue
      }
    }

    return NextResponse.json({
      success: true,
      opportunities,
      minDeltaBps: Number(minDeltaBps),
      totalAssets: supportedAssets.length,
      opportunitiesCount: opportunities.length,
      isDynamic: true,
      dataSource: 'smart_contract',
      upkeepNeeded: upkeepCheck.upkeepNeeded,
      performData: upkeepCheck.performData
    })

  } catch (error) {
    console.error('Error fetching real rebalancing opportunities:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch rebalancing opportunities',
      opportunities: [],
      minDeltaBps: 50,
      totalAssets: 0,
      opportunitiesCount: 0,
      isDynamic: false,
      dataSource: 'error'
    })
  }
}
