"use client"

import { useState, useEffect } from 'react'

interface PlatformStats {
  totalDeposited: number
  activeUsers: number
  avgAPY: number
  maxAPY: number
}

export function usePlatformStats() {
  const [stats, setStats] = useState<PlatformStats>({
    totalDeposited: 12450,
    activeUsers: 5,
    avgAPY: 7.3,
    maxAPY: 8.5
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        // Fetch real platform data from the new API
        const response = await fetch('/api/platform-stats')
        const data = await response.json()

        if (data.success && data.data) {
          setStats(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch platform stats:', error)
        // Keep default values
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlatformStats()
    
    // Update stats every 30 seconds
    const interval = setInterval(fetchPlatformStats, 30000)
    return () => clearInterval(interval)
  }, [])

  return { stats, isLoading }
}
