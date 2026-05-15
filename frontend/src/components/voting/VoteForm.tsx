/**
 * VoteForm — radio buttons for single choice, checkboxes for multi choice.
 */

import { useState } from 'react';
import { Button } from '../ui/Button';
import type { PollOption, PollType } from '../../types/poll';

interface VoteFormProps {
  options: PollOption[];
  pollType: PollType;
  onSubmit: (selectedOptions: string[]) => void;
  isLoading?: boolean;
  initialSelected?: string[];
}

export function VoteForm({
  options,
  pollType,
  onSubmit,
  isLoading = false,
  initialSelected = [],
}: VoteFormProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected);

  function handleToggle(optionId: string) {
    if (pollType === 'single_choice') {
      setSelected([optionId]);
    } else {
      setSelected((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId],
      );
    }
  }

  function handleSubmit() {
    if (selected.length === 0) return;
    onSubmit(selected);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 mb-2">
        {pollType === 'single_choice'
          ? 'Select one option'
          : 'Select one or more options'}
      </p>

      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.id);
          return (
            <label
              key={option.id}
              className={`
                flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer
                transition-all duration-200
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-sm shadow-blue-100'
                  : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                }
              `}
            >
              <input
                type={pollType === 'single_choice' ? 'radio' : 'checkbox'}
                name="vote-option"
                checked={isSelected}
                onChange={() => handleToggle(option.id)}
                className="
                  w-4 h-4 text-blue-600 border-slate-300
                  focus:ring-blue-500 focus:ring-2
                "
              />
              <span className={`text-sm font-medium ${isSelected ? 'text-blue-800' : 'text-slate-700'}`}>
                {option.label}
              </span>
            </label>
          );
        })}
      </div>

      <div className="pt-2">
        <Button
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={selected.length === 0}
          className="w-full"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Cast Vote
        </Button>
      </div>
    </div>
  );
}
