/**
 * Auth API functions.
 */

import apiClient from './client';
import type { RegisterRequest, LoginRequest, TokenResponse, UserResponse, MeResponse } from '../types/auth';

const AUTH_BASE = '/api/v1/auth';

export async function registerUser(data: RegisterRequest): Promise<UserResponse> {
  const response = await apiClient.post<UserResponse>(`${AUTH_BASE}/register`, data);
  return response.data;
}

export async function loginUser(data: LoginRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>(`${AUTH_BASE}/login`, data);
  return response.data;
}

export async function getMe(): Promise<MeResponse> {
  const response = await apiClient.get<MeResponse>(`${AUTH_BASE}/me`);
  return response.data;
}
