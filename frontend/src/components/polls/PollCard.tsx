/**
 * PollCard component — displays a poll summary in a grid.
 */

import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Badge } from '../ui/Badge';
import type { Poll } from '../../types/poll';
import { getStatusColor, getStatusLabel, getPollTypeLabel, getPollTypeColor } from '../../utils/pollHelpers';
import { timeAgo } from '../../utils/formatDate';

interface PollCardProps {
  poll: Poll;
}

export function PollCard({ poll }: PollCardProps) {
  const navigate = useNavigate();
  const pollId = poll.id || poll._id;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/polls/${pollId}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div
      id={`poll-card-${pollId}`}
      onClick={() => navigate(`/polls/${pollId}`)}
      className="
        group bg-white rounded-2xl border border-slate-100 p-5
        hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50
        transition-all duration-300 cursor-pointer
        active:scale-[0.99]
      "
    >
      {/* Header badges */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={getStatusColor(poll.status)}>
            {getStatusLabel(poll.status)}
          </Badge>
          <Badge className={getPollTypeColor(poll.poll_type)}>
            {getPollTypeLabel(poll.poll_type)}
          </Badge>
          {poll.visibility === 'private' && (
            <Badge className="bg-orange-50 text-orange-600 border-orange-200">
              🔒 Private
            </Badge>
          )}
        </div>
        
        {/* Always show the share button */}
        <button
          onClick={handleShare}
          className="p-1.5 -m-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Share Poll"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
        {poll.title}
      </h3>

      {/* Description */}
      {poll.description && (
        <p className="text-sm text-slate-500 mb-3 line-clamp-2">
          {poll.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-50">
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {timeAgo(poll.created_at)}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">
            {poll.options.length} options
          </span>
        </div>
      </div>
    </div>
  );
}
