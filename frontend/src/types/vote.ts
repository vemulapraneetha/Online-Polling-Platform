/**
 * Vote-related types matching backend schemas.
 */

export interface VoteSubmit {
  selected_options: string[];
}

export interface VoteResponse {
  vote_id: string;
  poll_id: string;
  user_id: string;
  selected_options: string[];
  voted_at: string;
  updated_at: string;
}

export interface MyVoteResponse {
  vote_id: string | null;
  poll_id: string | null;
  user_id: string | null;
  selected_options: string[] | null;
  voted_at: string | null;
  updated_at: string | null;
  has_voted: boolean;
}
