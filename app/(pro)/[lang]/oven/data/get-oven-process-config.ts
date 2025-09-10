import { useQuery } from '@tanstack/react-query';
import { fetchOvenProcessConfig } from '../actions';

export function useOvenProcessConfig(article: string) {
  return useQuery({
    queryFn: async () => fetchOvenProcessConfig(article),
    queryKey: ['oven-process-config', article],
    enabled: !!article,
    staleTime: 1 * 60 * 60 * 1000, // 1 hour - configs don't change often
  });
}
