import { useQuery } from '@tanstack/react-query';
import { fetchOvenProcesses } from '../actions';

export function useGetOvenProcesses(oven: string, includeConfig = false) {
  return useQuery({
    queryFn: async () => fetchOvenProcesses(oven),
    queryKey: ['oven-processes', oven, includeConfig],
    enabled: !!oven,
    refetchInterval: 30000, // 30 seconds - automatically refreshes data and time calculations
  });
}
