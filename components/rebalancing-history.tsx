"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, RefreshCw, Clock, TrendingUp } from "lucide-react"
import { toast } from "sonner"

interface RebalancingEvent {
  _id: string
  assetAddress: string
  fromProtocol: string
  toProtocol: string
  fromAPY: number
  toAPY: number
  improvement: number
  transactionHash: string
  timestamp: string
  status: 'completed' | 'failed' | 'pending'
}

export function RebalancingHistory() {
  const [history, setHistory] = useState<RebalancingEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const fetchHistory = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/rebalancing/history')
      const result = await response.json()
      
      if (result.success) {
        setHistory(result.data)
      } else {
        setError(result.error || 'Failed to fetch rebalancing history')
      }
    } catch (error) {
      console.error('Error fetching rebalancing history:', error)
      setError('Failed to fetch rebalancing history')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const formatAPY = (apy: number) => (apy * 100).toFixed(2) + '%'
  const formatDate = (timestamp: string) => new Date(timestamp).toLocaleString()
  const formatImprovement = (improvement: number) => {
    const value = improvement / 100
    return value > 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getProtocolName = (address: string) => {
    // Map protocol addresses to names
    const protocolMap: { [key: string]: string } = {
      '0xBaf7Dd10B229615246a37CBD595fc2fdD2CD8a8e': 'Aave V3',
      '0x54FA761eB183feD9809cf06A97cd273b39ACE25c': 'Compound V3',
      '0x1111111111111111111111111111111111111111': 'Mock Lido'
    }
    return protocolMap[address.toLowerCase()] || 'Unknown Protocol'
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Rebalancing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Loading history...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Rebalancing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchHistory} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Rebalancing History
          </div>
          <Button onClick={fetchHistory} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No rebalancing history found</p>
            <p className="text-sm">Rebalancing transactions will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((event) => (
              <div key={event._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {formatDate(event.timestamp)}
                    </span>
                  </div>
                  {getStatusBadge(event.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">From Protocol</div>
                    <div className="font-medium">{getProtocolName(event.fromProtocol)}</div>
                    <div className="text-sm text-gray-600">{formatAPY(event.fromAPY)}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500 mb-1">To Protocol</div>
                    <div className="font-medium text-green-600">{getProtocolName(event.toProtocol)}</div>
                    <div className="text-sm text-green-600">{formatAPY(event.toAPY)}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Improvement</div>
                    <div className={`font-medium ${event.improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatImprovement(event.improvement)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Transaction:</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {event.transactionHash.slice(0, 10)}...{event.transactionHash.slice(-8)}
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://sepolia.arbiscan.io/tx/${event.transactionHash}`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
