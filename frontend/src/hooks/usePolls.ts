/**
 * TanStack Query hooks for fetching polls.
 */

import { useQuery } from '@tanstack/react-query';
import { getFeed, getMyPolls, getSharedPolls, getPollById } from '../api/polls';
import type { FeedParams, MyPollsParams } from '../types/poll';

export function useFeed(params: FeedParams = {}) {
  return useQuery({
    queryKey: ['polls', 'feed', params],
    queryFn: () => getFeed(params),
  });
}

export function useMyPolls(params: MyPollsParams = {}) {
  return useQuery({
    queryKey: ['polls', 'my', params],
    queryFn: () => getMyPolls(params),
  });
}

export function useSharedPolls(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['polls', 'shared', params],
    queryFn: () => getSharedPolls(params),
  });
}

export function usePoll(id: string) {
  return useQuery({
    queryKey: ['polls', id],
    queryFn: () => getPollById(id),
    enabled: !!id,
  });
}
