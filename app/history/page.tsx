"use client"

import React from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArbiscanButton } from '@/components/arbiscan-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, History, TrendingUp, TrendingDown, RotateCcw, Wallet, AlertCircle } from 'lucide-react'
import { useTransactionHistory } from '@/hooks/useOnChainData'
import { formatDistanceToNow } from 'date-fns'

export default function HistoryPage() {
  const { address } = useAccount()
  const { data: historyEntries, isLoading, error } = useTransactionHistory(address || '')

  if (!address) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Transaction History
              </CardTitle>
              <CardDescription>
                View your deposit, withdrawal, and rebalancing history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Please connect your wallet to view transaction history</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load transaction history. Please try again.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'withdraw':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'rebalance':
        return <RotateCcw className="h-4 w-4 text-blue-600" />
      default:
        return <History className="h-4 w-4 text-gray-600" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'bg-green-50 border-green-200'
      case 'withdraw':
        return 'bg-red-50 border-red-200'
      case 'rebalance':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const formatAmount = (amount: number, type: string) => {
    if (type === 'deposit' || type === 'withdraw') {
      return `${amount.toFixed(6)} USDC`
    }
    return amount.toString()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Transaction History
            </CardTitle>
            <CardDescription>
              Your complete transaction history on Vesto
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!historyEntries || historyEntries.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No transactions found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start by making your first deposit to see transaction history here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {historyEntries.map((entry: any) => (
                  <div
                    key={entry._id}
                    className={`p-4 border rounded-lg ${getTransactionColor(entry.type)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(entry.type)}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium capitalize">{entry.type}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {entry.type === 'deposit' ? 'Deposit' : 
                               entry.type === 'withdraw' ? 'Withdrawal' : 
                               'Rebalance'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatAmount(entry.amount, entry.type)}
                          </p>
                          {entry.transactionHash && (
                            <p className="text-xs text-muted-foreground font-mono">
                              {entry.transactionHash.slice(0, 10)}...{entry.transactionHash.slice(-8)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                        </p>
                        {entry.oldAPY && entry.newAPY && (
                          <div className="text-xs text-muted-foreground">
                            APY: {entry.oldAPY.toFixed(2)}% → {entry.newAPY.toFixed(2)}%
                          </div>
                        )}
                        {entry.transactionHash && (
                          <ArbiscanButton 
                            txHash={entry.transactionHash}
                            size="sm"
                            variant="outline"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
