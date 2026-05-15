/**
 * TanStack Query hooks for voting.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { submitVote, withdrawVote, getMyVote } from '../api/votes';
import type { VoteSubmit } from '../types/vote';
import { handleApiError } from '../utils/errorHandler';
import toast from 'react-hot-toast';

export function useMyVote(pollId: string) {
  return useQuery({
    queryKey: ['votes', pollId],
    queryFn: () => getMyVote(pollId),
    enabled: !!pollId,
  });
}

export function useSubmitVote(pollId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VoteSubmit) => submitVote(pollId, data),
    onSuccess: () => {
      toast.success('Vote submitted!');
      queryClient.invalidateQueries({ queryKey: ['votes', pollId] });
      queryClient.invalidateQueries({ queryKey: ['results', pollId] });
      queryClient.invalidateQueries({ queryKey: ['polls', pollId] });
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
    onError: handleApiError,
  });
}

export function useWithdrawVote(pollId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => withdrawVote(pollId),
    onSuccess: () => {
      toast.success('Vote withdrawn.');
      queryClient.invalidateQueries({ queryKey: ['votes', pollId] });
      queryClient.invalidateQueries({ queryKey: ['results', pollId] });
      queryClient.invalidateQueries({ queryKey: ['polls', pollId] });
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
    onError: handleApiError,
  });
}
