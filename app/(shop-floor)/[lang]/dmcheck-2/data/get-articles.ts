import { useQuery } from '@tanstack/react-query';
import { getArticlesForWorkplace } from '../actions';

export function useGetArticles(workplace: string | null) {
  return useQuery({
    queryFn: async () => {
      if (!workplace) return [];
      return getArticlesForWorkplace(workplace);
    },
    queryKey: ['articles', workplace],
    enabled: !!workplace,
    refetchInterval: 60 * 60 * 1000, // Refresh every hour
    refetchOnMount: true, // Always fetch fresh on mount
  });
}