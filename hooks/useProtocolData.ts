"use client"

import { useState, useEffect } from 'react'

interface ProtocolData {
  name: string
  apy: number
  tvl: string
  risk: "Low" | "Medium" | "High"
  audited: boolean
  description: string
  color: string
  comingSoon?: boolean
}

export function useProtocolData() {
  const [protocols, setProtocols] = useState<ProtocolData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProtocolData = async () => {
      try {
        // Fetch real APY data from the API
        const response = await fetch('/api/protocols')
        const apyData = await response.json()
        
        if (apyData.success && apyData.data) {
          const protocolMap = new Map()
          apyData.data.forEach((protocol: any) => {
            protocolMap.set(protocol.name, protocol.apyPercentage)
          })

          const protocolsData: ProtocolData[] = [
            {
              name: "Mock Aave",
              apy: protocolMap.get("Aave V3") || 3.2,
              tvl: "$2.1B",
              risk: "Low",
              audited: true,
              description: "Leading DeFi lending protocol with high liquidity",
              color: "bg-blue-500"
            },
            {
              name: "Mock Compound",
              apy: protocolMap.get("Compound V3") || 2.8,
              tvl: "$1.8B",
              risk: "Low",
              audited: true,
              description: "Algorithmic money markets with competitive rates",
              color: "bg-green-500"
            },
            {
              name: "Hyperliquid",
              apy: 8.5,
              tvl: "$450M",
              risk: "Medium",
              audited: false,
              description: "Perpetual DEX with funding rate opportunities",
              color: "bg-purple-500",
              comingSoon: true
            },
            {
              name: "Uniswap V3",
              apy: 4.1,
              tvl: "$3.2B",
              risk: "Medium",
              audited: true,
              description: "Concentrated liquidity for efficient capital use",
              color: "bg-pink-500",
              comingSoon: true
            }
          ]

          setProtocols(protocolsData)
        }
      } catch (error) {
        console.error('Failed to fetch protocol data:', error)
        // Fallback to default data
        setProtocols([
          {
            name: "Mock Aave",
            apy: 3.2,
            tvl: "$2.1B",
            risk: "Low",
            audited: true,
            description: "Leading DeFi lending protocol with high liquidity",
            color: "bg-blue-500"
          },
          {
            name: "Mock Compound",
            apy: 2.8,
            tvl: "$1.8B",
            risk: "Low",
            audited: true,
            description: "Algorithmic money markets with competitive rates",
            color: "bg-green-500"
          },
          {
            name: "Hyperliquid",
            apy: 8.5,
            tvl: "$450M",
            risk: "Medium",
            audited: false,
            description: "Perpetual DEX with funding rate opportunities",
            color: "bg-purple-500",
            comingSoon: true
          },
          {
            name: "Uniswap V3",
            apy: 4.1,
            tvl: "$3.2B",
            risk: "Medium",
            audited: true,
            description: "Concentrated liquidity for efficient capital use",
            color: "bg-pink-500",
            comingSoon: true
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProtocolData()
  }, [])

  return { protocols, isLoading }
}
