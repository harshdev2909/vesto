import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { WalletProvider } from "@/providers/wallet-provider"
import { QueryProvider } from "@/providers/query-provider"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "Vesto — Yield Aggregator",
  description: "Deposit once, earn the best yield automatically.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/@rainbow-me/rainbowkit@2.2.1/dist/index.css" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <QueryProvider>
              <WalletProvider>{children}</WalletProvider>
            </QueryProvider>
            <Toaster />
            <SiteFooter />
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
