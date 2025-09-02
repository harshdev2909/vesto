export async function GET() {
  const assets = [
    { symbol: "USDC", name: "USD Coin", apy: 0.0625, totalDeposited: 1250000 },
    { symbol: "DAI", name: "Dai", apy: 0.058, totalDeposited: 830000 },
    { symbol: "USDT", name: "Tether", apy: 0.061, totalDeposited: 970000 },
    { symbol: "ETH", name: "Ether", apy: 0.024, totalDeposited: 5400 },
    { symbol: "WBTC", name: "Wrapped Bitcoin", apy: 0.015, totalDeposited: 210 },
  ]
  return Response.json({ assets })
}
