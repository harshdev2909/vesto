"use client"

import * as React from "react"
import useSWR from "swr"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

type Asset = {
  symbol: string
  name: string
  apy: number
  totalDeposited: number
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function DepositWithdrawDialog({
  open,
  onOpenChange,
  mode,
  asset,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "deposit" | "withdraw"
  asset?: Asset
}) {
  const { data } = useSWR("/api/mock/assets", fetcher)
  const assets = data?.assets ?? []
  const defaultAsset = asset ?? assets[0]
  const [selected, setSelected] = React.useState<string | undefined>(defaultAsset?.symbol)
  const [amount, setAmount] = React.useState<string>("")
  const [est, setEst] = React.useState<number | null>(null)
  const [gas, setGas] = React.useState<string>("~0.00042 ETH")
  const { toast } = useToast()

  React.useEffect(() => {
    setSelected(defaultAsset?.symbol)
  }, [defaultAsset?.symbol])

  React.useEffect(() => {
    const v = Number.parseFloat(amount)
    if (!selected || !Number.isFinite(v)) {
      setEst(null)
      return
    }
    const run = async () => {
      const res = await fetch(`/api/mock/preview?asset=${selected}&amount=${v}`)
      const j = await res.json()
      setEst(j.estimatedReceiptTokens)
      setGas(j.gasEstimate)
    }
    run()
  }, [selected, amount])

  const submit = async () => {
    toast({ title: "Transaction pending", description: `Submitting ${mode}...` })
    // Simulate tx statuses client-side
    await new Promise((r) => setTimeout(r, 1000))
    toast({ title: "Transaction confirmed", description: `${mode} successful (mock)` })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="capitalize">{mode}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Asset</Label>
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger>
                <SelectValue placeholder="Select asset" />
              </SelectTrigger>
              <SelectContent>
                {assets.map((a: Asset) => (
                  <SelectItem key={a.symbol} value={a.symbol}>
                    {a.symbol} — {(a.apy * 100).toFixed(2)}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Amount</Label>
            <Input placeholder="0.0" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <div className="text-xs text-muted-foreground">Balance: 1000.00 (mock)</div>
          </div>

          <div className="grid gap-1">
            <div className="text-sm">Estimated aYRT: {est ?? "—"}</div>
            <div className="text-sm text-muted-foreground">Gas estimate: {gas}</div>
          </div>

          <div className="flex justify-end">
            <Button onClick={submit} className="capitalize">
              {mode}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
