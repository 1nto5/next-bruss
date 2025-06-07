import { useQuery } from '@tanstack/react-query';
import { fetchOvenConfigs } from '../actions';

export function useGetOvenConfigs(configFiltr: string, openDialog: boolean) {
  return useQuery({
    queryFn: () => fetchOvenConfigs(configFiltr),
    queryKey: ['ovenConfigs'],
    staleTime: 8 * 60 * 60 * 1000, // 8 hours
    refetchInterval: 8 * 60 * 60 * 1000, // 8 hours
    enabled: openDialog,
  });
}
