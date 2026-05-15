/**
 * Votes API functions.
 */

import apiClient from './client';
import type { VoteSubmit, VoteResponse, MyVoteResponse } from '../types/vote';

const POLLS_BASE = '/api/v1/polls';

export async function submitVote(pollId: string, data: VoteSubmit): Promise<VoteResponse> {
  const response = await apiClient.post<VoteResponse>(`${POLLS_BASE}/${pollId}/vote`, data);
  return response.data;
}

export async function withdrawVote(pollId: string): Promise<void> {
  await apiClient.delete(`${POLLS_BASE}/${pollId}/vote`);
}

export async function getMyVote(pollId: string): Promise<MyVoteResponse> {
  const response = await apiClient.get<MyVoteResponse>(`${POLLS_BASE}/${pollId}/my-vote`);
  return response.data;
}
