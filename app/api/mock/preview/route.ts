export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const amount = Number(searchParams.get("amount") ?? 0)
  const estimatedReceiptTokens = Number.isFinite(amount) ? amount * 0.998 : 0
  const gasEstimate = "~0.00042 ETH"
  return Response.json({ estimatedReceiptTokens, gasEstimate })
}
