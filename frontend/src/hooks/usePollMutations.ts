/**
 * TanStack Query mutation hooks for poll CRUD and lifecycle.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPoll, updatePoll, deletePoll, publishPoll, closePoll } from '../api/polls';
import type { PollCreate, PollUpdate } from '../types/poll';
import { handleApiError } from '../utils/errorHandler';
import toast from 'react-hot-toast';

export function useCreatePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PollCreate) => createPoll(data),
    onSuccess: () => {
      toast.success('Poll created successfully!');
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
    onError: handleApiError,
  });
}

export function useUpdatePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PollUpdate }) => updatePoll(id, data),
    onSuccess: (_data, variables) => {
      toast.success('Poll updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['polls', variables.id] });
    },
    onError: handleApiError,
  });
}

export function useDeletePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePoll(id),
    onSuccess: () => {
      toast.success('Poll deleted.');
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
    onError: handleApiError,
  });
}

export function usePublishPoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => publishPoll(id),
    onSuccess: (_data, id) => {
      toast.success('Poll published!');
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['polls', id] });
    },
    onError: handleApiError,
  });
}

export function useClosePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => closePoll(id),
    onSuccess: (_data, id) => {
      toast.success('Poll closed.');
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['polls', id] });
    },
    onError: handleApiError,
  });
}
