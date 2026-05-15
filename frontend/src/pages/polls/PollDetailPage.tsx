import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePoll } from '../../hooks/usePolls';
import { useMyVote, useSubmitVote, useWithdrawVote } from '../../hooks/useVote';
import { useResults } from '../../hooks/useResults';
import { usePublishPoll, useClosePoll, useDeletePoll, useUpdatePoll } from '../../hooks/usePollMutations';
import { useAuth } from '../../hooks/useAuth';
import { PageSpinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { VoteForm } from '../../components/voting/VoteForm';
import { VoteStatus } from '../../components/voting/VoteStatus';
import { ResultBars } from '../../components/polls/ResultBars';
import { PollForm } from '../../components/polls/PollForm';
import { InvitationManager } from '../../components/invitations/InvitationManager';
import { getStatusColor, getStatusLabel, getPollTypeLabel, getPollTypeColor, getVisibilityIcon } from '../../utils/pollHelpers';
import { formatDateTime } from '../../utils/formatDate';
import type { PollCreate } from '../../types/poll';

export function PollDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: poll, isLoading, isError } = usePoll(id!);
  const { data: myVote } = useMyVote(id!);
  const { data: results } = useResults(id!);
  const submitVote = useSubmitVote(id!);
  const withdrawVote = useWithdrawVote(id!);
  const publishMut = usePublishPoll();
  const closeMut = useClosePoll();
  const deleteMut = useDeletePoll();
  const updateMut = useUpdatePoll();

  const [showPublish, setShowPublish] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) return <PageSpinner />;
  if (isError || !poll) return <EmptyState title="Poll not found" description="This poll may have been deleted or you don't have access." action={<Button onClick={() => navigate('/feed')}>Back to Feed</Button>} />;

  const pollId = poll.id || poll._id;
  const isCreator = user?.user_id === poll.creator_id;
  const isDraft = poll.status === 'draft';
  const isOpen = poll.status === 'open';
  const hasVoted = myVote?.has_voted || false;
  const showResults = results?.results_visible || false;

  function handleVote(selectedOptions: string[]) {
    submitVote.mutate({ selected_options: selectedOptions });
  }

  function handleUpdate(data: PollCreate) {
    if (pollId) {
      updateMut.mutate({ id: pollId, data }, { onSuccess: () => setIsEditing(false) });
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Back
      </button>

      {/* Poll header card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge className={getStatusColor(poll.status)}>{getStatusLabel(poll.status)}</Badge>
          <Badge className={getPollTypeColor(poll.poll_type)}>{getPollTypeLabel(poll.poll_type)}</Badge>
          <Badge className="bg-slate-50 text-slate-600 border-slate-200">{getVisibilityIcon(poll.visibility)} {poll.visibility}</Badge>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">{poll.title}</h1>
        {poll.description && <p className="text-slate-600 mb-4">{poll.description}</p>}

        <div className="flex flex-wrap gap-4 text-xs text-slate-400">
          <span>Created {formatDateTime(poll.created_at)}</span>
          {poll.published_at && <span>Published {formatDateTime(poll.published_at)}</span>}
          {poll.closed_at && <span>Closed {formatDateTime(poll.closed_at)}</span>}
          {poll.expires_at && <span>Expires {formatDateTime(poll.expires_at)}</span>}
        </div>

        {/* Creator actions */}
        {isCreator && (
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-100">
            {isDraft && (
              <>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(!isEditing)}>{isEditing ? 'Cancel Edit' : 'Edit'}</Button>
                <Button size="sm" onClick={() => setShowPublish(true)}>Publish</Button>
                <Button size="sm" variant="danger" onClick={() => setShowDelete(true)}>Delete</Button>
              </>
            )}
            {isOpen && <Button size="sm" variant="secondary" onClick={() => setShowClose(true)}>Close Poll</Button>}
          </div>
        )}
      </div>

      {/* Edit form (draft only) */}
      {isDraft && isCreator && isEditing && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Edit Poll</h2>
          <PollForm defaultValues={{ title: poll.title, description: poll.description || '', poll_type: poll.poll_type, visibility: poll.visibility, results_visibility: poll.results_visibility, options: poll.options.map(o => ({ label: o.label })), expires_at: poll.expires_at || undefined }}
            onSubmit={handleUpdate} isLoading={updateMut.isPending} submitLabel="Save Changes" />
        </div>
      )}

      {/* Voting section */}
      {isOpen && !isCreator && !hasVoted && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Cast Your Vote</h2>
          <VoteForm options={poll.options} pollType={poll.poll_type} onSubmit={handleVote} isLoading={submitVote.isPending} />
        </div>
      )}

      {/* Vote status */}
      {isOpen && hasVoted && myVote && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <VoteStatus vote={myVote} options={poll.options} onWithdraw={() => withdrawVote.mutate()} isWithdrawing={withdrawVote.isPending} canWithdraw={isOpen} />
        </div>
      )}

      {/* Results */}
      {showResults && results && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Results</h2>
          <ResultBars options={results.options} totalRespondents={results.total_respondents} votedOptionIds={myVote?.selected_options} />
        </div>
      )}

      {/* Draft options preview */}
      {isDraft && !isEditing && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Options Preview</h2>
          <div className="space-y-2">
            {poll.options.map((opt, i) => (
              <div key={opt.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">{i+1}</span>
                <span className="text-sm text-slate-700">{opt.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invitation manager for private polls */}
      {isCreator && poll.visibility === 'private' && pollId && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8">
          <InvitationManager pollId={pollId} />
        </div>
      )}

      {/* Confirm dialogs */}
      <ConfirmDialog isOpen={showPublish} onClose={() => setShowPublish(false)} onConfirm={() => pollId && publishMut.mutate(pollId, { onSuccess: () => setShowPublish(false) })}
        title="Publish Poll" message="Title, options, type, and visibility become immutable." confirmLabel="Publish" isLoading={publishMut.isPending} />
      <ConfirmDialog isOpen={showClose} onClose={() => setShowClose(false)} onConfirm={() => pollId && closeMut.mutate(pollId, { onSuccess: () => setShowClose(false) })}
        title="Close Poll" message="No new votes will be accepted." confirmLabel="Close" isLoading={closeMut.isPending} />
      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={() => pollId && deleteMut.mutate(pollId, { onSuccess: () => { setShowDelete(false); navigate('/my-polls'); } })}
        title="Delete Poll" message="Permanently delete this poll and all data." confirmLabel="Delete" isLoading={deleteMut.isPending} />
    </div>
  );
}
