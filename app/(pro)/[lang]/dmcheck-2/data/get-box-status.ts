import { useQuery } from '@tanstack/react-query';
import { getInBoxTableData } from '../actions';

export function useGetBoxStatus(articleId: string | undefined) {
  return useQuery({
    queryFn: async () => {
      if (!articleId) return { piecesInBox: 0, boxIsFull: false };
      return getInBoxTableData(articleId);
    },
    queryKey: ['box-status', articleId],
    enabled: !!articleId,
    refetchInterval: 60 * 60 * 1000, // 1 hour
  });
}
