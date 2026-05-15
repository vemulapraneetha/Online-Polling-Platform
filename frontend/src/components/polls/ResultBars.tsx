/**
 * ResultBars — animated percentage bars for poll results.
 */

import type { OptionResult } from '../../types/results';

interface ResultBarsProps {
  options: OptionResult[];
  totalRespondents: number;
  votedOptionIds?: string[] | null;
}

export function ResultBars({ options, totalRespondents, votedOptionIds }: ResultBarsProps) {
  const maxVotes = Math.max(...options.map((o) => o.votes), 1);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
        <span>{totalRespondents} {totalRespondents === 1 ? 'respondent' : 'respondents'}</span>
      </div>

      {options.map((option) => {
        const isVoted = votedOptionIds?.includes(option.id);
        const barWidth = totalRespondents > 0 ? option.percentage : 0;

        return (
          <div key={option.id} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className={`font-medium ${isVoted ? 'text-blue-700' : 'text-slate-700'}`}>
                {isVoted && (
                  <span className="inline-flex items-center mr-1.5">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
                {option.label}
              </span>
              <span className={`text-xs font-semibold ${isVoted ? 'text-blue-600' : 'text-slate-500'}`}>
                {option.votes} ({option.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`
                  absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out
                  ${isVoted
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                    : option.votes === maxVotes && totalRespondents > 0
                      ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                      : 'bg-gradient-to-r from-slate-300 to-slate-400'
                  }
                `}
                style={{
                  width: `${barWidth}%`,
                  ['--bar-width' as string]: `${barWidth}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
