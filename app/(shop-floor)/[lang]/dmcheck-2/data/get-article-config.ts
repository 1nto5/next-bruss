import { useQuery } from '@tanstack/react-query';
import { getArticleConfigById } from '../actions';

export function useGetArticleConfig(articleId: string | undefined) {
  return useQuery({
    queryFn: async () => {
      if (!articleId) return null;
      return getArticleConfigById(articleId);
    },
    queryKey: ['article-config', articleId],
    enabled: !!articleId,
    refetchInterval: 60 * 60 * 1000, // Refresh every hour
    refetchOnMount: true, // Always fetch fresh on mount
  });
}