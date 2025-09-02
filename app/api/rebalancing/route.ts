import { NextRequest, NextResponse } from 'next/server'
import { 
  getAPYData, 
  getAssets, 
  getProtocols, 
  createRebalanceEvent,
  createUserTransaction
} from '@/lib/db'
import { RebalancingData, RebalanceEvent, APIResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assetAddress = searchParams.get('asset')
    const userAddress = searchParams.get('user')
    
    if (!assetAddress) {
      const response: APIResponse<null> = {
        success: false,
        error: 'Asset address is required'
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    // Get all APY data for this asset
    const apyData = await getAPYData(assetAddress)
    if (apyData.length === 0) {
      const response: APIResponse<null> = {
        success: false,
        error: 'No APY data found for this asset'
      }
      return NextResponse.json(response, { status: 404 })
    }
    
    // Get asset and protocol details
    const [assets, protocols] = await Promise.all([
      getAssets(),
      getProtocols()
    ])
    
    const asset = assets.find(a => a.address === assetAddress)
    if (!asset) {
      const response: APIResponse<null> = {
        success: false,
        error: 'Asset not found'
      }
      return NextResponse.json(response, { status: 404 })
    }
    
    // Find current protocol (assuming first one for now)
    // In a real implementation, this would come from user positions
    const currentProtocolData = apyData[0]
    const currentProtocol = protocols.find(p => p.address === currentProtocolData.protocolAddress)
    
    // Find best protocol by APY
    const bestAPYData = apyData.sort((a, b) => b.apy - a.apy)[0]
    const bestProtocol = protocols.find(p => p.address === bestAPYData.protocolAddress)
    
    if (!currentProtocol || !bestProtocol) {
      const response: APIResponse<null> = {
        success: false,
        error: 'Protocol information not found'
      }
      return NextResponse.json(response, { status: 404 })
    }
    
    const apyDifference = bestAPYData.apy - currentProtocolData.apy
    const canRebalance = apyDifference > 0.01 // 1% threshold
    
    const rebalancingData: RebalancingData = {
      assetAddress,
      currentProtocol,
      bestProtocol,
      currentAPY: currentProtocolData.apy,
      bestAPY: bestAPYData.apy,
      apyDifference,
      estimatedGas: 200000, // Estimated gas for rebalancing
      canRebalance,
      lastRebalance: new Date() // This would come from user positions in real implementation
    }
    
    const response: APIResponse<RebalancingData> = {
      success: true,
      data: rebalancingData
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching rebalancing data:', error)
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to fetch rebalancing data'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      assetAddress, 
      oldProtocol, 
      newProtocol, 
      oldAPY, 
      newAPY, 
      totalValue, 
      gasUsed, 
      transactionHash, 
      blockNumber,
      userAddress 
    } = body
    
    // Validation
    if (!assetAddress || !oldProtocol || !newProtocol || 
        oldAPY === undefined || newAPY === undefined || 
        totalValue === undefined || gasUsed === undefined || 
        transactionHash || blockNumber === undefined) {
      const response: APIResponse<null> = {
        success: false,
        error: 'Missing required fields'
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    // Create rebalance event
    const rebalanceEvent = await createRebalanceEvent({
      assetAddress,
      oldProtocol,
      newProtocol,
      oldAPY,
      newAPY,
      totalValue,
      gasUsed,
      transactionHash,
      blockNumber,
      executedAt: new Date()
    })
    
    // Create user transaction if user address is provided
    if (userAddress) {
      await createUserTransaction({
        userAddress,
        type: 'rebalance',
        assetAddress,
        amount: totalValue,
        protocolAddress: newProtocol,
        transactionHash,
        blockNumber,
        gasUsed,
        executedAt: new Date()
      })
    }
    
    const response: APIResponse<RebalanceEvent> = {
      success: true,
      data: rebalanceEvent,
      message: 'Rebalance event recorded successfully'
    }
    
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error recording rebalance event:', error)
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to record rebalance event'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
