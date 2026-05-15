import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyPolls } from '../../hooks/usePolls';
import { useDeletePoll, usePublishPoll, useClosePoll } from '../../hooks/usePollMutations';
import { PageSpinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import type { Poll, PollStatus } from '../../types/poll';
import { getStatusColor, getStatusLabel } from '../../utils/pollHelpers';

type TabType = 'all' | PollStatus;
const tabs: { key: TabType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Drafts' },
  { key: 'open', label: 'Open' },
  { key: 'closed', label: 'Closed' },
];

export function MyPollsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [publishTarget, setPublishTarget] = useState<string | null>(null);
  const [closeTarget, setCloseTarget] = useState<string | null>(null);

  const statusParam = activeTab === 'all' ? undefined : activeTab;
  const { data, isLoading } = useMyPolls({ status: statusParam, page, limit: 20 });
  const deleteMut = useDeletePoll();
  const publishMut = usePublishPoll();
  const closeMut = useClosePoll();

  function renderActions(poll: Poll) {
    const pid = poll.id || poll._id;
    return (
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50">
        {poll.status === 'draft' && (
          <>
            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/polls/${pid}`); }}>Edit</Button>
            <Button size="sm" onClick={(e) => { e.stopPropagation(); setPublishTarget(pid ?? null); }}>Publish</Button>
            <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); setDeleteTarget(pid ?? null); }}>Delete</Button>
          </>
        )}
        {poll.status === 'open' && (
          <>
            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/polls/${pid}`); }}>View</Button>
            <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setCloseTarget(pid ?? null); }}>Close</Button>
          </>
        )}
        {poll.status === 'closed' && (
          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/polls/${pid}`); }}>View Results</Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Polls</h1>
          <p className="text-sm text-slate-500 mt-1">Manage polls you've created</p>
        </div>
        <Button onClick={() => navigate('/polls/create')}>+ New Poll</Button>
      </div>

      <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-100 w-fit">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => { setActiveTab(t.key); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === t.key ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? <PageSpinner /> : !data || data.polls.length === 0 ? (
        <EmptyState title="No polls found" description={activeTab === 'all' ? 'Create your first poll!' : `No ${activeTab} polls.`}
          action={<Button onClick={() => navigate('/polls/create')}>Create Poll</Button>} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.polls.map((poll) => {
              const pid = poll.id || poll._id;
              return (
                <div key={pid} className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={getStatusColor(poll.status)}>{getStatusLabel(poll.status)}</Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1 cursor-pointer hover:text-blue-700" onClick={() => navigate(`/polls/${pid}`)}>{poll.title}</h3>
                  {poll.description && <p className="text-sm text-slate-500 line-clamp-2">{poll.description}</p>}
                  {renderActions(poll)}
                </div>
              );
            })}
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

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget) deleteMut.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(null) }); }}
        title="Delete Poll" message="This action cannot be undone." confirmLabel="Delete" isLoading={deleteMut.isPending} />
      <ConfirmDialog isOpen={!!publishTarget} onClose={() => setPublishTarget(null)} onConfirm={() => { if (publishTarget) publishMut.mutate(publishTarget, { onSuccess: () => setPublishTarget(null) }); }}
        title="Publish Poll" message="Once published, title/options/type become immutable." confirmLabel="Publish" isLoading={publishMut.isPending} />
      <ConfirmDialog isOpen={!!closeTarget} onClose={() => setCloseTarget(null)} onConfirm={() => { if (closeTarget) closeMut.mutate(closeTarget, { onSuccess: () => setCloseTarget(null) }); }}
        title="Close Poll" message="No new votes will be accepted." confirmLabel="Close" isLoading={closeMut.isPending} />
    </div>
  );
}
