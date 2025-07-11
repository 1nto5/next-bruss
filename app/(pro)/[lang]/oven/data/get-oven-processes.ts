import { useQuery } from '@tanstack/react-query';
import { fetchOvenProcesses } from '../actions';

export function useGetOvenProcesses(ovenId: string) {
  return useQuery({
    queryFn: async () => fetchOvenProcesses(ovenId),
    queryKey: ['oven-processes', ovenId],
    enabled: !!ovenId,
  });
}
