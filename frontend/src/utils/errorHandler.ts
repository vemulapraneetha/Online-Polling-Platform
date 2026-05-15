/**
 * Error handling utilities for API responses.
 */

import axios from 'axios';
import toast from 'react-hot-toast';

interface BackendError {
  detail: string;
}

/**
 * Extract a user-friendly error message from an API error.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as BackendError | undefined;
    if (data?.detail) {
      return data.detail;
    }
    if (error.response?.status === 404) {
      return 'Resource not found.';
    }
    if (error.response?.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (error.response?.status === 409) {
      return 'A conflict occurred. The resource may already exist.';
    }
    if (error.response?.status === 422) {
      return 'Invalid data submitted. Please check your input.';
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred.';
}

/**
 * Show an error toast from an API error.
 */
export function handleApiError(error: unknown): void {
  const message = getErrorMessage(error);
  toast.error(message);
}
