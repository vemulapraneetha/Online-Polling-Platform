/**
 * Invitation-related types matching backend schemas.
 */

export interface InviteRequest {
  email: string;
}

export interface InvitationResponse {
  invitation_id: string;
  poll_id: string;
  inviter_id: string;
  invitee_id: string;
  invitee_email: string;
  invitee_username: string;
  status: 'active' | 'revoked';
  created_at: string;
  revoked_at: string | null;
}

export interface InvitationListResponse {
  invitations: InvitationResponse[];
  total: number;
}
