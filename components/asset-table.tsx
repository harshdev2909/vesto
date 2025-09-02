"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DepositWithdrawDialog } from "./deposit-withdraw-dialog"

type Asset = {
  symbol: string
  name: string
  apy: number
  totalDeposited: number
}

export function AssetTable({ assets }: { assets: Asset[] }) {
  const [dialog, setDialog] = useState<{ mode: "deposit" | "withdraw"; asset?: Asset } | null>(null)
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="p-2">Asset</th>
              <th className="p-2">APY</th>
              <th className="p-2">Total Deposited</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.symbol} className="border-t">
                <td className="p-2">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/abstract-geometric-shapes.png?height=24&width=24&query=${a.symbol}%20logo`}
                      alt={`${a.symbol} logo`}
                      className="size-6 rounded"
                    />
                    <div className="font-medium">{a.symbol}</div>
                    <div className="text-muted-foreground">· {a.name}</div>
                  </div>
                </td>
                <td className="p-2">{(a.apy * 100).toFixed(2)}%</td>
                <td className="p-2">${a.totalDeposited.toLocaleString()}</td>
                <td className="p-2">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" onClick={() => setDialog({ mode: "deposit", asset: a })}>
                      Deposit
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setDialog({ mode: "withdraw", asset: a })}>
                      Withdraw
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {assets.length === 0 && <Card className="p-4 mt-3">No assets.</Card>}
      </div>

      <DepositWithdrawDialog
        open={!!dialog}
        onOpenChange={(o) => !o && setDialog(null)}
        mode={dialog?.mode ?? "deposit"}
        asset={dialog?.asset}
      />
    </>
  )
}
