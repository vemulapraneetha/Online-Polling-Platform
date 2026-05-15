/**
 * Invitations API functions.
 */

import apiClient from './client';
import type { InviteRequest, InvitationResponse, InvitationListResponse } from '../types/invitation';

const POLLS_BASE = '/api/v1/polls';

export async function createInvitation(pollId: string, data: InviteRequest): Promise<InvitationResponse> {
  const response = await apiClient.post<InvitationResponse>(`${POLLS_BASE}/${pollId}/invitations`, data);
  return response.data;
}

export async function revokeInvitation(pollId: string, inviteeId: string): Promise<InvitationResponse> {
  const response = await apiClient.delete<InvitationResponse>(
    `${POLLS_BASE}/${pollId}/invitations/${inviteeId}`,
  );
  return response.data;
}

export async function getInvitations(pollId: string): Promise<InvitationListResponse> {
  const response = await apiClient.get<InvitationListResponse>(`${POLLS_BASE}/${pollId}/invitations`);
  return response.data;
}
