"use client"

import { Button } from "@/components/ui/button"
import { useMintUSDC } from "@/hooks/useMintUSDC"
import { Coins, Loader2 } from "lucide-react"

interface MintUSDCButtonProps {
  amount?: string
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export function MintUSDCButton({ 
  amount = "1000", 
  className = "",
  variant = "outline",
  size = "default"
}: MintUSDCButtonProps) {
  const { mintUSDC, isMinting } = useMintUSDC()

  const handleMint = async () => {
    await mintUSDC(amount)
  }

  return (
    <Button
      onClick={handleMint}
      disabled={isMinting}
      variant={variant}
      size={size}
      className={className}
    >
      {isMinting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Minting...
        </>
      ) : (
        <>
          <Coins className="h-4 w-4 mr-2" />
          Mint {amount} USDC
        </>
      )}
    </Button>
  )
}
