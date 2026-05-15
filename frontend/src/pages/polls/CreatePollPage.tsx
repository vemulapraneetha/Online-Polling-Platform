import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PollForm } from '../../components/polls/PollForm';
import { TemplateSelectorModal } from '../../components/polls/TemplateSelectorModal';
import { Button } from '../../components/ui/Button';
import { useCreatePoll } from '../../hooks/usePollMutations';
import type { PollCreate } from '../../types/poll';

export function CreatePollPage() {
  const navigate = useNavigate();
  const createPoll = useCreatePoll();
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

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
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create a New Poll</h1>
          <p className="text-sm text-slate-500 mt-1">
            Your poll will be saved as a draft. You can publish it when ready.
          </p>
        </div>
        <Button 
          variant="secondary" 
          onClick={() => setIsTemplateModalOpen(true)}
        >
          <svg className="w-4 h-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
          Use Existing Poll
        </Button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8">
        <PollForm onSubmit={handleSubmit} isLoading={createPoll.isPending} />
      </div>

      <TemplateSelectorModal 
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
      />
    </div>
  );
}
