import { useQuery } from '@tanstack/react-query';
import { getPalletBoxes } from '../actions';

export function useGetPalletBoxes(article: string | undefined) {
  return useQuery({
    queryFn: async () => {
      if (!article) return [];
      return getPalletBoxes(article); // Returns HYDRA batch codes (boxes on pallet)
    },
    queryKey: ['pallet-boxes', article],
    enabled: false, // Disable automatic fetching
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
