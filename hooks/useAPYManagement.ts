"use client"

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'

interface APYData {
  _id?: string
  assetAddress: string
  protocolAddress: string
  currentAPY: number
  lastUpdated: string
}

interface APYManagementData {
  success: boolean
  data: APYData[]
  error?: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useAPYManagement() {
  const { data, error, isLoading, mutate } = useSWR<APYManagementData>(
    '/api/admin/apy',
    fetcher,
    {
      refreshInterval: 10000, // Refresh every 10 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  )

  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const updateAPY = useCallback(async (assetAddress: string, protocolAddress: string, currentAPY: number) => {
    setIsUpdating(true)
    try {
      console.log('Updating APY:', { assetAddress, protocolAddress, currentAPY })
      
      const response = await fetch('/api/admin/apy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetAddress,
          protocolAddress,
          currentAPY
        })
      })

      const result = await response.json()
      console.log('APY update response:', { status: response.status, result })

      if (!response.ok) {
        console.error('APY update failed:', result)
        throw new Error(result.error || `Failed to update APY (${response.status})`)
      }

      // Refresh the data
      mutate()

      return result
    } catch (error) {
      console.error('Error updating APY:', error)
      throw error
    } finally {
      setIsUpdating(false)
    }
  }, [mutate])

  const deleteAPY = useCallback(async (assetAddress: string, protocolAddress: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/apy?assetAddress=${assetAddress}&protocolAddress=${protocolAddress}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete APY')
      }

      // Refresh the data
      mutate()

      return result
    } catch (error) {
      console.error('Error deleting APY:', error)
      throw error
    } finally {
      setIsDeleting(false)
    }
  }, [mutate])

  const refreshAPYData = useCallback(() => {
    mutate()
  }, [mutate])

  return {
    apyData: data?.data || [],
    isLoading,
    error,
    isUpdating,
    isDeleting,
    updateAPY,
    deleteAPY,
    refreshAPYData
  }
}
