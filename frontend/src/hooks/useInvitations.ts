/**
 * TanStack Query hooks for invitations.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createInvitation, revokeInvitation, getInvitations } from '../api/invitations';
import type { InviteRequest } from '../types/invitation';
import { handleApiError } from '../utils/errorHandler';
import toast from 'react-hot-toast';

export function useInvitations(pollId: string) {
  return useQuery({
    queryKey: ['invitations', pollId],
    queryFn: () => getInvitations(pollId),
    enabled: !!pollId,
  });
}

export function useCreateInvitation(pollId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteRequest) => createInvitation(pollId, data),
    onSuccess: () => {
      toast.success('Invitation sent!');
      queryClient.invalidateQueries({ queryKey: ['invitations', pollId] });
    },
    onError: handleApiError,
  });
}

export function useRevokeInvitation(pollId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteeId: string) => revokeInvitation(pollId, inviteeId),
    onSuccess: () => {
      toast.success('Invitation revoked.');
      queryClient.invalidateQueries({ queryKey: ['invitations', pollId] });
    },
    onError: handleApiError,
  });
}
