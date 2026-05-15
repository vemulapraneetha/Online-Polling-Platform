/**
 * Poll-related types matching backend schemas.
 */

export type PollType = 'single_choice' | 'multi_choice';
export type PollStatus = 'draft' | 'open' | 'closed';
export type PollVisibility = 'public' | 'private';
export type ResultsVisibility = 'always' | 'after_voting' | 'creator_only';

export interface PollOption {
  id: string;
  label: string;
}

export interface PollOptionCreate {
  label: string;
}

export interface PollCreate {
  title: string;
  description?: string;
  poll_type: PollType;
  visibility: PollVisibility;
  options: PollOptionCreate[];
  results_visibility: ResultsVisibility;
  expires_at?: string | null;
}

export interface PollUpdate {
  title?: string;
  description?: string;
  poll_type?: PollType;
  visibility?: PollVisibility;
  options?: PollOptionCreate[];
  results_visibility?: ResultsVisibility;
  expires_at?: string | null;
}

export interface Poll {
  id: string;
  _id?: string;
  creator_id: string;
  title: string;
  description?: string | null;
  poll_type: PollType;
  status: PollStatus;
  visibility: PollVisibility;
  options: PollOption[];
  results_visibility: ResultsVisibility;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  closed_at?: string | null;
}

export interface PollListResponse {
  polls: Poll[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PollTemplateItem {
  _id: string;
  title: string;
  poll_type: PollType;
  visibility: PollVisibility;
  created_at: string;
  options_count: number;
}

export interface PollTemplateResponse {
  items: PollTemplateItem[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
}

export interface FeedParams {
  poll_type?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  limit?: number;
}

export interface MyPollsParams {
  status?: string;
  page?: number;
  limit?: number;
}
