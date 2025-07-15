import { useQuery } from '@tanstack/react-query';
import { fetchOvenLastAvgTemp } from '../actions';

export function useOvenLastAvgTemp(oven: string) {
  return useQuery({
    queryFn: async () => fetchOvenLastAvgTemp(oven),
    queryKey: ['oven-last-avg-temp', oven],
    enabled: !!oven,
    refetchInterval: 15 * 60 * 1000, // 15 minutes
  });
}
