import { useQuery } from '@tanstack/react-query';
import { fetchOvenProcessConfig } from '../actions';

export function useOvenProcessConfig(article: string) {
  return useQuery({
    queryFn: async () => fetchOvenProcessConfig(article),
    queryKey: ['oven-process-config', article],
    enabled: !!article,
    staleTime: 8 * 60 * 60 * 1000, // 8 hours - configs don't change often
  });
}
