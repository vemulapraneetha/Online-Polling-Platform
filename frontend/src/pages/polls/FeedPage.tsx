/**
 * FeedPage — paginated public polls with filters + sorting.
 */

import { useState } from 'react';
import { useFeed } from '../../hooks/usePolls';
import { PollCard } from '../../components/polls/PollCard';
import { PageSpinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function FeedPage() {
  const navigate = useNavigate();
  const [pollType, setPollType] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useFeed({
    poll_type: pollType,
    sort_by: sortBy,
    sort_order: sortOrder,
    page,
    limit: 12,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Public Feed</h1>
          <p className="text-sm text-slate-500 mt-1">Discover and vote on polls from the community</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-2xl border border-slate-100">
        {/* Poll type filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Type</label>
          <select
            value={pollType}
            onChange={(e) => { setPollType(e.target.value); setPage(1); }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="single_choice">Single Choice</option>
            <option value="multi_choice">Multi Choice</option>
          </select>
        </div>

        <div className="w-px h-6 bg-slate-200 hidden sm:block" />

        {/* Sort */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Sort</label>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="created_at">Created</option>
            <option value="expires_at">Expires</option>
          </select>
          <button
            onClick={() => { setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc'); setPage(1); }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            title={`Sort ${sortOrder === 'desc' ? 'ascending' : 'descending'}`}
          >
            <svg className={`w-4 h-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {data && (
          <>
            <div className="w-px h-6 bg-slate-200 hidden sm:block" />
            <span className="text-xs text-slate-400">{data.total} polls</span>
          </>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <PageSpinner />
      ) : isError ? (
        <EmptyState
          title="Failed to load feed"
          description="Something went wrong. Please try again."
        />
      ) : (data?.polls?.length ?? 0) === 0 ? (
        <EmptyState
          title="No polls yet"
          description="Be the first to create a poll!"
          action={
            <Button onClick={() => navigate('/polls/create')}>
              Create Poll
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data?.polls ?? []).map((poll) => (
              <PollCard key={poll.id || poll._id} poll={poll} />
            ))}
          </div>

          {/* Pagination */}
          {(data?.pages ?? 0) > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-slate-500 px-3">
                Page {data?.page} of {data?.pages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= (data?.pages ?? 1)}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
