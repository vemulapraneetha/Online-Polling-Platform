/**
 * Hooks for poll templates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTemplates, duplicatePoll } from '../api/polls';
import { handleApiError } from '../utils/errorHandler';
import toast from 'react-hot-toast';
import type { Poll } from '../types/poll';

export function useTemplates(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['templates', { page, limit }],
    queryFn: () => getTemplates(page, limit),
  });
}

export function useDuplicatePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pollId: string) => duplicatePoll(pollId),
    onSuccess: (newPoll: Poll) => {
      toast.success('Poll duplicated successfully!');
      // Invalidate queries where the new poll might show up
      queryClient.invalidateQueries({ queryKey: ['my_polls'] });
      // Optionally update the cache for the newly created poll
      queryClient.setQueryData(['poll', newPoll.id || newPoll._id], newPoll);
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
}
