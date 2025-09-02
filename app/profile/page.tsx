"use client"

import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, User, Mail, Wallet, Calendar, AlertCircle, CheckCircle } from 'lucide-react'
import { useAppStore } from '@/store/use-app-store'
import { useTransactionHistory } from '@/hooks/useOnChainData'
import { formatDistanceToNow } from 'date-fns'

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const { user, setUser } = useAppStore()
  const [email, setEmail] = useState(user.email || '')
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [isSavingEmail, setIsSavingEmail] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailSuccess, setEmailSuccess] = useState('')

  // Fetch transaction history
  const { data: transactionHistory, isLoading: historyLoading } = useTransactionHistory(address || '')

  // Update user connection status
  useEffect(() => {
    if (isConnected && address) {
      setUser({ 
        walletAddress: address, 
        isConnected: true 
      })
    } else {
      setUser({ 
        walletAddress: null, 
        isConnected: false 
      })
    }
  }, [isConnected, address, setUser])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setEmailError('Please enter a valid email address')
      return
    }

    setIsSavingEmail(true)
    setEmailError('')
    setEmailSuccess('')

    try {
      // TODO: Implement API call to save email to MongoDB
      // const response = await fetch('/api/users', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ walletAddress: address, email })
      // })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setUser({ email })
      setEmailSuccess('Email updated successfully!')
      setIsEditingEmail(false)
    } catch (error) {
      setEmailError('Failed to update email. Please try again.')
    } finally {
      setIsSavingEmail(false)
    }
  }

  const handleEmailCancel = () => {
    setEmail(user.email || '')
    setIsEditingEmail(false)
    setEmailError('')
    setEmailSuccess('')
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Profile
              </CardTitle>
              <CardDescription>
                Connect your wallet to view your profile
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Profile
            </CardTitle>
            <CardDescription>
              Manage your account information and view your activity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Wallet Information */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Connected Wallet
              </Label>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {address}
                </code>
                <Badge variant="default">Connected</Badge>
              </div>
            </div>

            <Separator />

            {/* Email Management */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              
              {!isEditingEmail ? (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    {user.email ? (
                      <p className="text-sm">{user.email}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">No email address set</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingEmail(true)}
                  >
                    {user.email ? 'Edit' : 'Add Email'}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSavingEmail}
                    />
                    {emailError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{emailError}</AlertDescription>
                      </Alert>
                    )}
                    {emailSuccess && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>{emailSuccess}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isSavingEmail}
                      size="sm"
                    >
                      {isSavingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleEmailCancel}
                      disabled={isSavingEmail}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>

            <Separator />

            {/* Account Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{transactionHistory?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">
                  {transactionHistory?.filter(t => t.type === 'deposit').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Deposits</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">
                  {transactionHistory?.filter(t => t.type === 'withdraw').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Withdrawals</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">
                  {transactionHistory?.filter(t => t.type === 'rebalance').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Rebalances</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Transaction History
            </CardTitle>
            <CardDescription>
              Your recent deposits, withdrawals, and rebalances
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading transaction history...</span>
              </div>
            ) : transactionHistory && transactionHistory.length > 0 ? (
              <div className="space-y-3">
                {transactionHistory.slice(0, 10).map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        {transaction.type === 'deposit' && '📥'}
                        {transaction.type === 'withdraw' && '📤'}
                        {transaction.type === 'rebalance' && '🔄'}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{transaction.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.assetAddress && (
                            <span>{transaction.assetAddress.slice(0, 6)}...{transaction.assetAddress.slice(-4)}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {transaction.amount && (
                        <p className="font-medium">{transaction.amount} USDC</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground">Start by making your first deposit</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
