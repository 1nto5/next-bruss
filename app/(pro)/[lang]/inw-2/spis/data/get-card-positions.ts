import { useQuery } from '@tanstack/react-query';
import { fetchCardPositions } from '../actions';

export function useGetCardPositions(persons: string[], card: number) {
  return useQuery({
    queryFn: async () => fetchCardPositions(persons, card),
    queryKey: ['positions'],
  });
}
