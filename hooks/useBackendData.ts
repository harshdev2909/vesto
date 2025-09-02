import useSWR from 'swr'
import { 
  Asset, 
  Protocol, 
  APYData, 
  UserPosition, 
  RebalanceEvent, 
  UserTransaction,
  DashboardData,
  RebalancingData 
} from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// Assets
export function useAssets() {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: Asset[] }>('/api/assets', fetcher)
  return {
    assets: data?.data ?? [],
    error,
    isLoading,
    mutate
  }
}

// Protocols
export function useProtocols() {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: Protocol[] }>('/api/protocols', fetcher)
  return {
    protocols: data?.data ?? [],
    error,
    isLoading,
    mutate
  }
}

// APY Data for specific asset
export function useAPYData(assetAddress: string) {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: APYData[] }>(
    assetAddress ? `/api/apy?asset=${assetAddress}` : null,
    fetcher
  )
  return {
    apyData: data?.data ?? [],
    error,
    isLoading,
    mutate
  }
}

// Dashboard data for specific user
export function useDashboardData(userAddress: string) {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: DashboardData }>(
    userAddress ? `/api/dashboard?user=${userAddress}` : null,
    fetcher
  )
  return {
    dashboardData: data?.data,
    error,
    isLoading,
    mutate
  }
}

// Rebalancing data for specific asset and user
export function useRebalancingData(assetAddress: string, userAddress?: string) {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: RebalancingData }>(
    assetAddress ? `/api/rebalancing?asset=${assetAddress}${userAddress ? `&user=${userAddress}` : ''}` : null,
    fetcher
  )
  return {
    rebalancingData: data?.data,
    error,
    isLoading,
    mutate
  }
}

// Best APY for specific asset
export function useBestAPY(assetAddress: string) {
  const { apyData, error, isLoading } = useAPYData(assetAddress)
  
  const bestAPY = apyData.length > 0 
    ? apyData.reduce((best, current) => current.apy > best.apy ? current : best)
    : null

  return {
    bestAPY,
    error,
    isLoading
  }
}

// All APY data across all assets
export function useAllAPYData() {
  const { assets, isLoading: assetsLoading } = useAssets()
  const { protocols, isLoading: protocolsLoading } = useProtocols()
  
  // Get APY data for all assets in parallel
  const assetAddresses = assets.map(asset => asset.address)
  const { data: allAPYData, isLoading: apyLoading } = useSWR<{ success: boolean; data: APYData[] }>(
    assetAddresses.length > 0 ? `/api/apy/all?assets=${assetAddresses.join(',')}` : null,
    fetcher
  )
  
  // Create a map of asset -> all APY data
  const apyMap = new Map<string, { asset: Asset; allAPYData: APYData[]; bestAPY: APYData | null; protocols: Protocol[] }>()
  
  assets.forEach(asset => {
    const assetAPYData = allAPYData?.data?.filter(apy => apy.assetAddress === asset.address) || []
    const bestAPY = assetAPYData.length > 0 
      ? assetAPYData.reduce((best, current) => current.apy > best.apy ? current : best)
      : null
    
    const assetProtocols = protocols.filter(p => 
      assetAPYData.some(apy => apy.protocolAddress === p.address)
    )
    
    apyMap.set(asset.address, { asset, allAPYData: assetAPYData, bestAPY, protocols: assetProtocols })
  })
  
  return {
    apyMap,
    assets,
    protocols,
    isLoading: assetsLoading || protocolsLoading || apyLoading
  }
}

// Mock user data for development (fallback)
export function useMockUser() {
  const { data, error, isLoading } = useSWR('/api/mock/user', fetcher)
  return {
    user: data,
    error,
    isLoading
  }
}

// Mock portfolio data for development (fallback)
export function useMockPortfolio() {
  const { data, error, isLoading } = useSWR('/api/mock/portfolio', fetcher)
  return {
    portfolio: data,
    error,
    isLoading
  }
}
