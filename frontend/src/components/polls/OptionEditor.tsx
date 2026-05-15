/**
 * OptionEditor — dynamic option list for creating/editing polls.
 */

import { Button } from '../ui/Button';

interface OptionEditorProps {
  options: { label: string }[];
  onChange: (options: { label: string }[]) => void;
  error?: string;
}

export function OptionEditor({ options, onChange, error }: OptionEditorProps) {
  function addOption() {
    if (options.length >= 10) return;
    onChange([...options, { label: '' }]);
  }

  function removeOption(index: number) {
    if (options.length <= 2) return;
    const updated = options.filter((_, i) => i !== index);
    onChange(updated);
  }

  function updateOption(index: number, value: string) {
    const updated = options.map((opt, i) => (i === index ? { label: value } : opt));
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">
        Options <span className="text-slate-400 font-normal">(2–10 required)</span>
      </label>

      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-600 text-xs font-bold shrink-0">
              {index + 1}
            </div>
            <input
              type="text"
              value={option.label}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              maxLength={200}
              className="
                flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900
                placeholder:text-slate-400 hover:border-slate-300
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-all duration-200
              "
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="
                  p-2 text-slate-300 hover:text-red-500 hover:bg-red-50
                  rounded-lg transition-colors opacity-0 group-hover:opacity-100
                "
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {options.length < 10 && (
        <Button type="button" variant="ghost" size="sm" onClick={addOption}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Option
        </Button>
      )}

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
