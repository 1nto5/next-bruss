import { useQuery } from '@tanstack/react-query';
import { fetchOvenProcesses } from '../actions';

export function useGetOvenProcesses(oven: string) {
  return useQuery({
    queryFn: async () => fetchOvenProcesses(oven),
    queryKey: ['oven-processes', oven],
    enabled: !!oven,
  });
}
