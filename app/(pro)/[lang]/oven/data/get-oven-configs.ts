import { useQuery } from '@tanstack/react-query';
import { fetchOvenConfigs } from '../actions';

export function useGetOvenConfigs() {
  return useQuery({
    queryFn: async () => fetchOvenConfigs(),
    queryKey: ['ovenConfigs'],
  });
}
