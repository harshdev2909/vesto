export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <p className="text-sm text-muted-foreground">built by harsh sharma</p>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">powered by</span>
          {/* MUST use the Source URL as requested */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-pPE3yFlVET1TfkAFNrSaoLcd2gV5VT.png"
            alt="Arbitrum logo"
            className="h-6 w-auto"
          />
        </div>
      </div>
    </footer>
  )
}
