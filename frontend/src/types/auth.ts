/**
 * Auth-related types matching backend schemas.
 */

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  user_id: string;
  email: string;
  username: string;
  created_at: string;
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface MeResponse {
  user_id: string;
  email: string;
  username: string;
  created_at: string;
  is_active: boolean;
}
