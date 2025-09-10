import { useQuery } from '@tanstack/react-query';
import { fetchPosition } from '../actions';

export function useGetPosition(
  persons: string[],
  card: number,
  position: number,
) {
  return useQuery({
    queryFn: async () => fetchPosition(persons, card, position),
    queryKey: ['position'],
    refetchInterval: false,
  });
}
