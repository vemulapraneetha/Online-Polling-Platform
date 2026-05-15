import { useNavigate } from 'react-router-dom';
import { PollForm } from '../../components/polls/PollForm';
import { useCreatePoll } from '../../hooks/usePollMutations';
import type { PollCreate } from '../../types/poll';

export function CreatePollPage() {
  const navigate = useNavigate();
  const createPoll = useCreatePoll();

  function handleSubmit(data: PollCreate) {
    createPoll.mutate(data, {
      onSuccess: (poll) => {
        const pollId = poll.id || poll._id;
        navigate(`/polls/${pollId}`);
      },
    });
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create a New Poll</h1>
        <p className="text-sm text-slate-500 mt-1">
          Your poll will be saved as a draft. You can publish it when ready.
        </p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8">
        <PollForm onSubmit={handleSubmit} isLoading={createPoll.isPending} />
      </div>
    </div>
  );
}
