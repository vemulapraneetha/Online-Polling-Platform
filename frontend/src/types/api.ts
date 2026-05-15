/**
 * Generic API response types used across the application.
 */

export interface ApiError {
  detail: string;
  status_code?: number;
}

export interface PaginatedParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  polls: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
