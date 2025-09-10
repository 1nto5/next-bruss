import { useQuery } from '@tanstack/react-query';
import { getBoxesOnPalletTableData } from '../actions';

export function useGetPalletStatus(
  articleId: string | undefined,
  hasPallet: boolean,
) {
  return useQuery({
    queryFn: async () => {
      if (!articleId || !hasPallet)
        return { boxesOnPallet: 0, palletIsFull: false };
      return getBoxesOnPalletTableData(articleId);
    },
    queryKey: ['pallet-status', articleId],
    enabled: !!articleId && hasPallet,
    refetchInterval: 60 * 60 * 1000, // 1 hour
  });
}
