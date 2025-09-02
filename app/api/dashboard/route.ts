import { NextRequest, NextResponse } from 'next/server'
import { 
  getUserPositions, 
  getUserTransactions, 
  getAssets, 
  getProtocols, 
  getAPYData,
  getTotalValueLocked,
  getAverageAPY
} from '@/lib/db'
import { DashboardData, APIResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('user')
    
    if (!userAddress) {
      const response: APIResponse<null> = {
        success: false,
        error: 'User address is required'
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    // Fetch all required data in parallel
    const [
      userPositions,
      recentTransactions,
      availableAssets,
      protocols,
      totalValueLocked,
      averageAPY
    ] = await Promise.all([
      getUserPositions(userAddress),
      getUserTransactions(userAddress, 10),
      getAssets(),
      getProtocols(),
      getTotalValueLocked(),
      getAverageAPY()
    ])
    
    // Get top protocols by APY for each asset
    const topProtocols = []
    for (const asset of availableAssets) {
      const apyData = await getAPYData(asset.address)
      if (apyData.length > 0) {
        // Sort by APY and get the best one
        const bestAPY = apyData.sort((a, b) => b.apy - a.apy)[0]
        const protocol = protocols.find(p => p.address === bestAPY.protocolAddress)
        if (protocol) {
          topProtocols.push({
            protocol,
            apy: bestAPY.apy,
            tvl: bestAPY.totalValueLocked
          })
        }
      }
    }
    
    // Sort top protocols by APY
    topProtocols.sort((a, b) => b.apy - a.apy)
    
    const dashboardData: DashboardData = {
      userPositions,
      totalValueLocked,
      averageAPY,
      recentTransactions,
      availableAssets,
      topProtocols: topProtocols.slice(0, 5) // Top 5 protocols
    }
    
    const response: APIResponse<DashboardData> = {
      success: true,
      data: dashboardData
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to fetch dashboard data'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
