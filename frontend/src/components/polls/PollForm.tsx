/**
 * PollForm — create/edit poll form with Zod validation.
 */

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { OptionEditor } from './OptionEditor';
import type { PollCreate } from '../../types/poll';

const pollSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional().or(z.literal('')),
  poll_type: z.enum(['single_choice', 'multi_choice']),
  visibility: z.enum(['public', 'private']),
  results_visibility: z.enum(['always', 'after_voting', 'creator_only']),
  options: z
    .array(z.object({ label: z.string().min(1, 'Option label is required').max(200) }))
    .min(2, 'At least 2 options required')
    .max(10, 'Maximum 10 options'),
  expires_at: z.string().optional().or(z.literal('')),
});

type PollFormData = z.infer<typeof pollSchema>;

interface PollFormProps {
  defaultValues?: Partial<PollCreate>;
  onSubmit: (data: PollCreate) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function PollForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = 'Create Poll',
}: PollFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PollFormData>({
    resolver: zodResolver(pollSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      poll_type: defaultValues?.poll_type || 'single_choice',
      visibility: defaultValues?.visibility || 'public',
      results_visibility: defaultValues?.results_visibility || 'always',
      options: defaultValues?.options?.length
        ? defaultValues.options
        : [{ label: '' }, { label: '' }],
      expires_at: defaultValues?.expires_at || '',
    },
  });

  function handleFormSubmit(data: PollFormData) {
    const payload: PollCreate = {
      title: data.title,
      description: data.description || undefined,
      poll_type: data.poll_type,
      visibility: data.visibility,
      results_visibility: data.results_visibility,
      options: data.options,
      expires_at: data.expires_at || null,
    };
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Title */}
      <Input
        label="Poll Title"
        placeholder="What do you want to ask?"
        error={errors.title?.message}
        {...register('title')}
      />

      {/* Description */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Description <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          placeholder="Add more context to your poll..."
          rows={3}
          maxLength={2000}
          className="
            w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900
            placeholder:text-slate-400 hover:border-slate-300
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-200 resize-none
          "
          {...register('description')}
        />
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Poll Type + Visibility row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Poll Type</label>
          <select
            className="
              w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              transition-all duration-200
            "
            {...register('poll_type')}
          >
            <option value="single_choice">Single Choice</option>
            <option value="multi_choice">Multiple Choice</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Visibility</label>
          <select
            className="
              w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              transition-all duration-200
            "
            {...register('visibility')}
          >
            <option value="public">🌐 Public</option>
            <option value="private">🔒 Private</option>
          </select>
        </div>
      </div>

      {/* Results Visibility */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">Results Visibility</label>
        <select
          className="
            w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-200
          "
          {...register('results_visibility')}
        >
          <option value="always">Always visible</option>
          <option value="after_voting">After voting</option>
          <option value="creator_only">Creator only</option>
        </select>
      </div>

      {/* Options */}
      <Controller
        control={control}
        name="options"
        render={({ field }) => (
          <OptionEditor
            options={field.value}
            onChange={field.onChange}
            error={errors.options?.message || errors.options?.root?.message}
          />
        )}
      />

      {/* Expiry */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Expiry Date <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <input
          type="datetime-local"
          className="
            w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-200
          "
          {...register('expires_at')}
        />
      </div>

      {/* Submit */}
      <div className="pt-4">
        <Button type="submit" isLoading={isLoading} className="w-full">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
