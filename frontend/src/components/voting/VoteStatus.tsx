/**
 * VoteStatus — shows current vote status and withdraw option.
 */

import { Button } from '../ui/Button';
import type { MyVoteResponse } from '../../types/vote';
import type { PollOption } from '../../types/poll';
import { formatDateTime } from '../../utils/formatDate';

interface VoteStatusProps {
  vote: MyVoteResponse;
  options: PollOption[];
  onWithdraw: () => void;
  isWithdrawing?: boolean;
  canWithdraw?: boolean;
}

export function VoteStatus({ vote, options, onWithdraw, isWithdrawing = false, canWithdraw = true }: VoteStatusProps) {
  if (!vote.has_voted) return null;

  const selectedLabels = options
    .filter((opt) => vote.selected_options?.includes(opt.id))
    .map((opt) => opt.label);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-800">You voted!</p>
          {vote.voted_at && (
            <p className="text-xs text-blue-600">{formatDateTime(vote.voted_at)}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-blue-700">Your selection:</p>
        <div className="flex flex-wrap gap-1.5">
          {selectedLabels.map((label) => (
            <span
              key={label}
              className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {canWithdraw && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onWithdraw}
          isLoading={isWithdrawing}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Withdraw Vote
        </Button>
      )}
    </div>
  );
}
