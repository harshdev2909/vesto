"use client"

import React from 'react'
import { useAccount } from 'wagmi'
import { DashboardV2 } from '@/components/dashboard-v2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Wallet, AlertCircle } from 'lucide-react'

export default function DashboardPage() {
  const { address, isConnected } = useAccount()

  if (!isConnected || !address) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Dashboard
              </CardTitle>
              <CardDescription>
                Connect your wallet to access the Vesto dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Please connect your wallet to continue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardV2 />
    </div>
  )
}