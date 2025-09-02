"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ConnectWalletButton } from "./connect-wallet-button"
import { ThemeToggle } from "./theme-toggle"
import { NotificationBell } from "./notification-bell"
import { useAccount } from "wagmi"
import { User } from "lucide-react"

const nav = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "History" },
  { href: "/profile", label: "Profile" },
  { href: "/admin", label: "Admin" },
  { href: "/about", label: "About" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { isConnected } = useAccount()
  
  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          Vesto
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {nav.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === i.href && "bg-accent text-accent-foreground",
              )}
            >
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isConnected && <NotificationBell />}
          {isConnected && (
            <Link
              href="/profile"
              className={cn(
                "p-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === "/profile" && "bg-accent text-accent-foreground",
              )}
            >
              <User className="h-4 w-4" />
            </Link>
          )}
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  )
}
