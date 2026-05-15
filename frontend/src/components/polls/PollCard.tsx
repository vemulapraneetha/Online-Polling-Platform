/**
 * PollCard component — displays a poll summary in a grid.
 */

import { useNavigate } from 'react-router-dom';
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
      <div className="flex items-center gap-2 mb-3">
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
