import { useQuery } from '@tanstack/react-query';
import { getArticleStatuses } from '../actions';

export function useGetArticleStatus(article: '28067' | '28042') {
  return useQuery({
    queryFn: async () => {
      const statuses = await getArticleStatuses();
      const status = statuses.find((s) => s.article === article);
      return status || null;
    },
    queryKey: ['article-status', article],
    refetchInterval: 60 * 60 * 1000, // 1 hour
  });
}
