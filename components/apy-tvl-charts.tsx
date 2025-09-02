"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, BarChart3, Loader2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useSupportedAssets, useCompareYields } from '@/hooks/useOnChainData'

interface APYDataPoint {
  timestamp: string
  apy: number
  protocol: string
}

interface TVLDataPoint {
  timestamp: string
  tvl: number
  protocol: string
}

export function APYTVLCharts() {
  const [selectedAsset, setSelectedAsset] = useState<string>('')
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('7d')
  const [apyData, setApyData] = useState<APYDataPoint[]>([])
  const [tvlData, setTvlData] = useState<TVLDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Hooks
  const { data: supportedAssets, isLoading: assetsLoading } = useSupportedAssets()
  const { data: yieldComparisons, isLoading: comparisonsLoading } = useCompareYields(selectedAsset)

  // Generate mock historical data
  const generateMockData = (timeframe: string) => {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
    const data: APYDataPoint[] = []
    const tvlData: TVLDataPoint[] = []
    
    const protocols = ['Compound', 'Aave', 'Yearn']
    
    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const timestamp = date.toISOString().split('T')[0]
      
      protocols.forEach((protocol, index) => {
        // Generate realistic APY data with some volatility
        const baseAPY = 0.05 + (index * 0.01) // 5%, 6%, 7% base APY
        const volatility = (Math.random() - 0.5) * 0.02 // ±1% volatility
        const apy = Math.max(0, baseAPY + volatility)
        
        data.push({
          timestamp,
          apy: apy * 100, // Convert to percentage
          protocol
        })
        
        // Generate TVL data
        const baseTVL = 1000000 + (index * 500000) // 1M, 1.5M, 2M base TVL
        const tvlVolatility = (Math.random() - 0.5) * 0.1 // ±5% volatility
        const tvl = Math.max(0, baseTVL * (1 + tvlVolatility))
        
        tvlData.push({
          timestamp,
          tvl: tvl / 1000000, // Convert to millions
          protocol
        })
      })
    }
    
    return { apyData: data, tvlData }
  }

  // Update data when timeframe or asset changes
  useEffect(() => {
    if (selectedTimeframe) {
      setIsLoading(true)
      // Simulate API call delay
      setTimeout(() => {
        const { apyData, tvlData } = generateMockData(selectedTimeframe)
        setApyData(apyData)
        setTvlData(tvlData)
        setIsLoading(false)
      }, 500)
    }
  }, [selectedTimeframe, selectedAsset])

  // Group data by timestamp for charts
  const groupedApyData = React.useMemo(() => {
    const grouped: Record<string, any> = {}
    
    apyData.forEach(point => {
      if (!grouped[point.timestamp]) {
        grouped[point.timestamp] = { timestamp: point.timestamp }
      }
      grouped[point.timestamp][point.protocol] = point.apy
    })
    
    return Object.values(grouped).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  }, [apyData])

  const groupedTvlData = React.useMemo(() => {
    const grouped: Record<string, any> = {}
    
    tvlData.forEach(point => {
      if (!grouped[point.timestamp]) {
        grouped[point.timestamp] = { timestamp: point.timestamp }
      }
      grouped[point.timestamp][point.protocol] = point.tvl
    })
    
    return Object.values(grouped).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  }, [tvlData])

  const getProtocolColor = (protocol: string) => {
    switch (protocol) {
      case 'Compound': return '#8884d8'
      case 'Aave': return '#82ca9d'
      case 'Yearn': return '#ffc658'
      default: return '#8884d8'
    }
  }

  if (assetsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading chart data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Asset</label>
          <Select value={selectedAsset} onValueChange={setSelectedAsset}>
            <SelectTrigger>
              <SelectValue placeholder="Select an asset" />
            </SelectTrigger>
            <SelectContent>
              {supportedAssets?.map((asset) => (
                <SelectItem key={asset} value={asset}>
                  <div className="flex items-center gap-2">
                    <span>{asset.slice(0, 6)}...{asset.slice(-4)}</span>
                    <Badge variant="secondary">USDC</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Timeframe</label>
          <Select value={selectedTimeframe} onValueChange={(value: '7d' | '30d' | '90d') => setSelectedTimeframe(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Current Yields */}
      {yieldComparisons && yieldComparisons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Current Yields
            </CardTitle>
            <CardDescription>
              Real-time APY comparison across protocols
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {yieldComparisons.map((comparison, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{comparison.protocolName}</h4>
                    <Badge variant={index === 0 ? "default" : "outline"}>
                      {(parseFloat(comparison.apyFormatted) * 100).toFixed(2)}% APY
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    TVL: ${parseFloat(comparison.tvlFormatted).toLocaleString()}M
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* APY Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            APY Trends
          </CardTitle>
          <CardDescription>
            Historical APY performance across protocols
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading APY data...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={groupedApyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis 
                  label={{ value: 'APY (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number, name: string) => [`${value.toFixed(2)}%`, name]}
                />
                {['Compound', 'Aave', 'Yearn'].map(protocol => (
                  <Line
                    key={protocol}
                    type="monotone"
                    dataKey={protocol}
                    stroke={getProtocolColor(protocol)}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name={protocol}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* TVL Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Total Value Locked
          </CardTitle>
          <CardDescription>
            Historical TVL across protocols
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading TVL data...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={groupedTvlData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis 
                  label={{ value: 'TVL ($M)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number, name: string) => [`$${value.toFixed(2)}M`, name]}
                />
                {['Compound', 'Aave', 'Yearn'].map(protocol => (
                  <Bar
                    key={protocol}
                    dataKey={protocol}
                    fill={getProtocolColor(protocol)}
                    name={protocol}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
