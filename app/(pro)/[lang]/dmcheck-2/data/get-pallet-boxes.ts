import { useQuery } from '@tanstack/react-query';
import { getPalletBoxes } from '../actions';

export function useGetPalletBoxes(articleId: string | undefined) {
  return useQuery({
    queryFn: async () => {
      if (!articleId) return [];
      return getPalletBoxes(articleId); // Returns HYDRA batch codes (boxes on pallet)
    },
    queryKey: ['pallet-boxes', articleId],
    enabled: false, // Disable automatic fetching
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}