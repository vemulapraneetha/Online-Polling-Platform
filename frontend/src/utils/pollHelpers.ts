/**
 * Poll helper utilities.
 */

import type { PollStatus, PollType, PollVisibility } from '../types/poll';

export function getStatusColor(status: PollStatus): string {
  switch (status) {
    case 'draft':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'open':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'closed':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

export function getStatusLabel(status: PollStatus): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'open':
      return 'Open';
    case 'closed':
      return 'Closed';
    default:
      return status;
  }
}

export function getPollTypeLabel(type: PollType): string {
  switch (type) {
    case 'single_choice':
      return 'Single Choice';
    case 'multi_choice':
      return 'Multiple Choice';
    default:
      return type;
  }
}

export function getPollTypeColor(type: PollType): string {
  switch (type) {
    case 'single_choice':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'multi_choice':
      return 'bg-violet-100 text-violet-700 border-violet-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

export function getVisibilityLabel(visibility: PollVisibility): string {
  switch (visibility) {
    case 'public':
      return 'Public';
    case 'private':
      return 'Private';
    default:
      return visibility;
  }
}

export function getVisibilityIcon(visibility: PollVisibility): string {
  return visibility === 'public' ? '🌐' : '🔒';
}
