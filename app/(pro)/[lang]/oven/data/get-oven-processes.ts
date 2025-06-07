import { useQuery } from '@tanstack/react-query';
import { fetchOvenProcesses } from '../actions';

export function useGetOvenProcesses() {
  return useQuery({
    queryFn: async () => fetchOvenProcesses(),
    queryKey: ['ovenProcesses'],
    staleTime: 1000 * 60 * 5, // data is fresh for 5 minutes
    refetchOnWindowFocus: false, // do not refetch on window focus
  });
}
