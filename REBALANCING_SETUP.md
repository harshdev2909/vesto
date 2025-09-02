# Rebalancing Dashboard Setup

## Environment Variables Required

To use the rebalancing dashboard with real data, you need to set up the following environment variables:

### 1. RPC URL Configuration

Add to your `.env.local` file:

```bash
# Arbitrum Sepolia RPC URL
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc

# Or use a service like Alchemy/Infura
ARBITRUM_SEPOLIA_RPC_URL=https://arb-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

### 2. Contract Address

```bash
# Your deployed YieldRouter contract address
YIELD_ROUTER_ADDRESS=0xYourDeployedContractAddress
```

## Development Mode

If the RPC URL is not configured or the network connection fails, the dashboard will automatically fall back to **mock data** for development purposes. You'll see a warning banner indicating that mock data is being used.

## Mock Data Features

When using mock data, the dashboard will show:
- 2 sample assets with different APY scenarios
- 1 rebalancing opportunity (above threshold)
- 1 asset below threshold (no action needed)
- All UI functionality works normally

## Testing the Dashboard

1. **With Real Data**: Set up the environment variables and deploy your contracts
2. **With Mock Data**: Just run the frontend - it will automatically use mock data

## Network Connection Issues

If you see `JsonRpcProvider failed to detect network` errors:
1. Check your RPC URL is correct
2. Ensure the Arbitrum Sepolia network is accessible
3. Verify your API key (if using Alchemy/Infura)
4. The dashboard will still work with mock data

## Manual Rebalancing

Currently, manual rebalancing requires wallet integration. The button will show a message about wallet signing requirements. This can be enhanced with proper wallet connection integration.

## Features Available

✅ **Real-time APY monitoring** (when connected to network)
✅ **Mock data fallback** (for development)
✅ **Opportunity detection** with visual indicators
✅ **Manual rebalancing triggers** (UI ready)
✅ **Transaction tracking** and history
✅ **Responsive design** for all devices
✅ **Error handling** and retry mechanisms
