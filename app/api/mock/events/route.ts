export async function GET() {
  const events = [
    { type: "Deposit", description: "Deposited 1,000 USDC", time: "2h ago" },
    { type: "Rebalance", description: "Moved from Compound to Aave", time: "1d ago" },
    { type: "Withdraw", description: "Withdrew 250 DAI", time: "3d ago" },
    { type: "Deposit", description: "Deposited 0.5 ETH", time: "5d ago" },
    { type: "Rebalance", description: "Optimized to best yield", time: "7d ago" },
  ]
  return Response.json({ events })
}
