/**
 * Polls API functions.
 */

import apiClient from './client';
import type {
  Poll,
  PollCreate,
  PollUpdate,
  PollListResponse,
  FeedParams,
  MyPollsParams,
  PollTemplateResponse,
} from '../types/poll';

const POLLS_BASE = '/api/v1/polls';

export async function createPoll(data: PollCreate): Promise<Poll> {
  const response = await apiClient.post<Poll>(POLLS_BASE, data);
  return response.data;
}

export async function getPollById(id: string): Promise<Poll> {
  const response = await apiClient.get<Poll>(`${POLLS_BASE}/${id}`);
  return response.data;
}

export async function updatePoll(id: string, data: PollUpdate): Promise<Poll> {
  const response = await apiClient.patch<Poll>(`${POLLS_BASE}/${id}`, data);
  return response.data;
}

export async function deletePoll(id: string): Promise<void> {
  await apiClient.delete(`${POLLS_BASE}/${id}`);
}

export async function publishPoll(id: string): Promise<Poll> {
  const response = await apiClient.post<Poll>(`${POLLS_BASE}/${id}/publish`);
  return response.data;
}

export async function closePoll(id: string): Promise<Poll> {
  const response = await apiClient.post<Poll>(`${POLLS_BASE}/${id}/close`);
  return response.data;
}

export async function getTemplates(page: number = 1, limit: number = 20): Promise<PollTemplateResponse> {
  const response = await apiClient.get<PollTemplateResponse>(`${POLLS_BASE}/templates`, {
    params: { page, limit },
  });
  return response.data;
}

export async function duplicatePoll(id: string): Promise<Poll> {
  const response = await apiClient.post<Poll>(`${POLLS_BASE}/${id}/duplicate`);
  return response.data;
}

export async function getFeed(params: FeedParams = {}): Promise<PollListResponse> {
  const response = await apiClient.get<PollListResponse>(`${POLLS_BASE}/feed`, { params });
  return response.data;
}

export async function getMyPolls(params: MyPollsParams = {}): Promise<PollListResponse> {
  const response = await apiClient.get<PollListResponse>(`${POLLS_BASE}/my`, { params });
  return response.data;
}

export async function getSharedPolls(params: { page?: number; limit?: number } = {}): Promise<PollListResponse> {
  const response = await apiClient.get<PollListResponse>(`${POLLS_BASE}/shared`, { params });
  return response.data;
}
