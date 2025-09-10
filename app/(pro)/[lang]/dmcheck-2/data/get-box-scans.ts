import { useQuery } from '@tanstack/react-query';
import { getBoxScans } from '../actions';

export function useGetBoxScans(articleId: string | undefined) {
  return useQuery({
    queryFn: async () => {
      if (!articleId) return [];
      return getBoxScans(articleId);
    },
    queryKey: ['box-scans', articleId],
    enabled: false, // Disable automatic fetching
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}