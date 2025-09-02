export async function GET() {
  // Mock portfolio summary and rebalance metadata
  return Response.json({
    totalDepositedUsd: 2084500,
    receiptTokens: 20845.23,
    currentApy: 0.078,
    lastApy: 0.061,
    currentProtocol: "Aave v3",
    lastRebalance: "2025-08-20 14:03 UTC",
    nextEligible: "2025-09-01 00:00 UTC",
  })
}
