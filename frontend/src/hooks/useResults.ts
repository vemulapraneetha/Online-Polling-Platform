/**
 * TanStack Query hook for poll results.
 */

import { useQuery } from '@tanstack/react-query';
import { getPollResults } from '../api/results';

export function useResults(pollId: string) {
  return useQuery({
    queryKey: ['results', pollId],
    queryFn: () => getPollResults(pollId),
    enabled: !!pollId,
  });
}
