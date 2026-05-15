/**
 * Results-related types matching backend schemas.
 */

export interface OptionResult {
  id: string;
  label: string;
  votes: number;
  percentage: number;
}

export interface ResultsResponse {
  poll_id: string;
  poll_status: string;
  total_respondents: number;
  options: OptionResult[];
  user_has_voted: boolean;
  results_visible: boolean;
}
