import { useQuery } from '@tanstack/react-query';
import { fetchOvenProcesses } from '../actions';

export function useGetOvenProcesses(oven: string, includeConfig = false) {
  return useQuery({
    queryFn: async () => fetchOvenProcesses(oven, includeConfig),
    queryKey: ['oven-processes', oven, includeConfig],
    enabled: !!oven,
    refetchInterval: 1000 * 60 * 60, // 60 minutes
  });
}
