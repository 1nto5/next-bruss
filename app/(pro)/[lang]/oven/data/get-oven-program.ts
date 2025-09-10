import { useQuery } from '@tanstack/react-query';
import { fetchOvenProgram } from '../actions';

export function useOvenProgram() {
  return useQuery({
    queryFn: async () => fetchOvenProgram(),
    queryKey: ['oven-program'],
    staleTime: 1 * 60 * 60 * 1000, // 1 hour - programs don't change often
  });
}