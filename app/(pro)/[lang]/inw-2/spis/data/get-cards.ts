import { useQuery } from '@tanstack/react-query';
import { fetchCards } from '../actions';

export function useGetCards(persons: string[]) {
  return useQuery({
    queryFn: async () => fetchCards(persons),
    queryKey: ['cards'],
  });
}
