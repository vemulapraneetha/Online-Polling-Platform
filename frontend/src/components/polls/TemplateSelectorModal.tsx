/**
 * TemplateSelectorModal — lets the user select an existing poll to duplicate.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { PageSpinner } from '../ui/Spinner';
import { EmptyState } from '../ui/EmptyState';
import { Badge } from '../ui/Badge';
import { useTemplates, useDuplicatePoll } from '../../hooks/useTemplates';
import { formatDate } from '../../utils/formatDate';
import { getPollTypeLabel, getPollTypeColor, getVisibilityIcon } from '../../utils/pollHelpers';

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TemplateSelectorModal({ isOpen, onClose }: TemplateSelectorModalProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useTemplates(page, 50);
  const duplicateMut = useDuplicatePoll();

  const handleSelectTemplate = (pollId: string) => {
    duplicateMut.mutate(pollId, {
      onSuccess: (newPoll) => {
        onClose();
        const newId = newPoll.id || newPoll._id;
        navigate(`/polls/${newId}`);
      },
    });
  };

  // Optional local search filter
  const filteredItems = data?.items.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Use Existing Poll">
      <div className="space-y-4">
        {/* Search Input */}
        <div>
          <input
            type="text"
            placeholder="Search your polls..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-700"
          />
        </div>

        {/* List Content */}
        <div className="max-h-[60vh] overflow-y-auto space-y-3 -mx-2 px-2 pb-2">
          {isLoading ? (
            <div className="py-8"><PageSpinner /></div>
          ) : isError ? (
            <EmptyState title="Failed to load templates" description="There was an error fetching your polls." />
          ) : data?.items.length === 0 ? (
            <EmptyState title="No previous polls available" description="You haven't created any polls yet." />
          ) : filteredItems.length === 0 ? (
            <EmptyState title="No results" description="Try a different search term." />
          ) : (
            filteredItems.map(item => (
              <div 
                key={item._id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50 hover:bg-white hover:border-blue-200 transition-colors"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge className={getPollTypeColor(item.poll_type)}>
                      {getPollTypeLabel(item.poll_type)}
                    </Badge>
                    <Badge className="bg-white text-slate-600 border-slate-200">
                      {getVisibilityIcon(item.visibility)} {item.visibility}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 flex gap-3">
                    <span>Created {formatDate(item.created_at)}</span>
                    <span>{item.options_count} options</span>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleSelectTemplate(item._id)}
                  isLoading={duplicateMut.isPending}
                  disabled={duplicateMut.isPending}
                >
                  Use Template
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {data && (page > 1 || data.has_next) && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              Previous
            </Button>
            <span className="text-xs text-slate-500">
              Page {page}
            </span>
            <Button variant="outline" size="sm" disabled={!data.has_next} onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
