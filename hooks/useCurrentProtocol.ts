import { useQuery } from '@tanstack/react-query';
import { readContract } from '@wagmi/core';
import { config } from '@/lib/wagmi';
import { YIELD_ROUTER_ABI, CONTRACT_ADDRESSES } from '@/lib/contracts';

export function useCurrentProtocol(assetAddress: string, userAddress?: string) {
  return useQuery({
    queryKey: ['current-protocol', assetAddress, userAddress],
    queryFn: async () => {
      if (!userAddress) {
        throw new Error('User address is required');
      }

      console.log('🔍 Fetching current protocol for:', { assetAddress, userAddress });

      // Use assetPositions mapping to get current protocol
      const assetPosition = await readContract(config, {
        address: CONTRACT_ADDRESSES.YIELD_ROUTER as `0x${string}`,
        abi: YIELD_ROUTER_ABI,
        functionName: 'assetPositions',
        args: [assetAddress as `0x${string}`]
      });

      console.log('📊 Asset position data:', assetPosition);

      return { 
        protocolAddress: (assetPosition as any).currentProtocol, 
        method: 'assetPositions',
        assetPosition: assetPosition as any
      };
    },
    enabled: !!assetAddress && !!userAddress,
    refetchInterval: 30000, // refresh every 30 sec
    staleTime: 10000, // 10 seconds
  });
}
