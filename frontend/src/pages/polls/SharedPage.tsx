import { useState } from 'react';
import { useSharedPolls } from '../../hooks/usePolls';
import { PollCard } from '../../components/polls/PollCard';
import { PageSpinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';

export function SharedPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSharedPolls({ page, limit: 12 });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Shared With Me</h1>
        <p className="text-sm text-slate-500 mt-1">Private polls you've been invited to</p>
      </div>

      {isLoading ? <PageSpinner /> : !data || data.polls.length === 0 ? (
        <EmptyState title="No shared polls" description="When someone invites you to a private poll, it will appear here." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.polls.map((poll) => <PollCard key={poll.id || poll._id} poll={poll} />)}
          </div>
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <span className="text-sm text-slate-500 px-3">Page {data.page} of {data.pages}</span>
              <Button variant="secondary" size="sm" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
