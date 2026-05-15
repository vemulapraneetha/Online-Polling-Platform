/**
 * Results API functions.
 */

import apiClient from './client';
import type { ResultsResponse } from '../types/results';

const POLLS_BASE = '/api/v1/polls';

export async function getPollResults(pollId: string): Promise<ResultsResponse> {
  const response = await apiClient.get<ResultsResponse>(`${POLLS_BASE}/${pollId}/results`);
  return response.data;
}
