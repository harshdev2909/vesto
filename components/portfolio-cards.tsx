"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEmailStore } from "@/store/use-email-store"
// Removed unused imports - now using smart contract data

function Summary({ dashboardData }: { dashboardData?: any }) {
  // Use smart contract data if available
  const totalDeposited = dashboardData?.formattedTotalDeposits ? parseFloat(dashboardData.formattedTotalDeposits) : 0
  const totalReceiptTokens = dashboardData?.formattedAYRTBalance ? parseFloat(dashboardData.formattedAYRTBalance) : 0
  // Use smart contract APY data
  const currentAPY = dashboardData?.currentAPYPercentage || 0
  
  // Loading state is now handled by the parent component

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Total Deposited</div>
          <div className="text-2xl font-semibold">${totalDeposited.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Receipt Tokens (aYRT)</div>
          <div className="text-2xl font-semibold">
            {totalReceiptTokens.toFixed(15)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Current APY</div>
          <div className="text-2xl font-semibold">{currentAPY.toFixed(2)}%</div>
        </CardContent>
      </Card>
    </div>
  )
}

function EmailField() {
  const { email, setEmail } = useEmailStore()
  return (
    <div className="flex gap-2">
      <Input
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="max-w-xs"
      />
      <Button
        onClick={() => {
          // saved to localStorage via store
        }}
      >
        Save
      </Button>
    </div>
  )
}

export const PortfolioCards = { Summary, EmailField }
