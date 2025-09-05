"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface ArbiscanButtonProps {
  txHash: string
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export function ArbiscanButton({ 
  txHash, 
  className = "",
  variant = "outline",
  size = "sm"
}: ArbiscanButtonProps) {
  const handleViewOnArbiscan = () => {
    const arbiscanUrl = `https://sepolia.arbiscan.io/tx/${txHash}`
    window.open(arbiscanUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <Button
      onClick={handleViewOnArbiscan}
      variant={variant}
      size={size}
      className={className}
    >
      <ExternalLink className="h-3 w-3 mr-1" />
      Verify
    </Button>
  )
}
