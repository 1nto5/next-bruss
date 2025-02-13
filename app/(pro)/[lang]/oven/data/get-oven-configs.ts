import { useQuery } from '@tanstack/react-query';
import { fetchOvenConfigs } from '../actions';

export function useGetOvenConfigs(configFiltr: string, openDialog: boolean) {
  return useQuery({
    queryFn: () => fetchOvenConfigs(configFiltr),
    queryKey: ['ovenConfigs'],
    staleTime: 1 * 60 * 60 * 1000, // 1 hour
    refetchInterval: 1 * 60 * 60 * 1000, // 1 hour
    enabled: openDialog,
  });
}
