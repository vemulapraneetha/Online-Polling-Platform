/**
 * InvitationManager — invite users by email, revoke invitations, and list statuses.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Spinner } from '../ui/Spinner';
import { useInvitations, useCreateInvitation, useRevokeInvitation } from '../../hooks/useInvitations';
import { formatDate } from '../../utils/formatDate';
import { ConfirmDialog } from '../ui/ConfirmDialog';

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InvitationManagerProps {
  pollId: string;
}

export function InvitationManager({ pollId }: InvitationManagerProps) {
  const { data, isLoading } = useInvitations(pollId);
  const createInvitation = useCreateInvitation(pollId);
  const revokeInvitation = useRevokeInvitation(pollId);
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
  });

  function onInvite(formData: InviteFormData) {
    createInvitation.mutate(
      { email: formData.email },
      { onSuccess: () => reset() },
    );
  }

  function onRevoke() {
    if (!revokeTarget) return;
    revokeInvitation.mutate(revokeTarget, {
      onSuccess: () => setRevokeTarget(null),
    });
  }

  return (
    <div className="space-y-5">
      <h3 className="text-base font-bold text-slate-900">Manage Invitations</h3>

      {/* Invite form */}
      <form onSubmit={handleSubmit(onInvite)} className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Enter email to invite..."
            error={errors.email?.message}
            {...register('email')}
          />
        </div>
        <Button
          type="submit"
          isLoading={createInvitation.isPending}
          size="md"
        >
          Invite
        </Button>
      </form>

      {/* Invitations list */}
      {isLoading ? (
        <Spinner />
      ) : data?.invitations.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">No invitations yet.</p>
      ) : (
        <div className="space-y-2">
          {data?.invitations.map((inv) => (
            <div
              key={inv.invitation_id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 text-xs font-bold shrink-0">
                  {inv.invitee_username.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {inv.invitee_username}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{inv.invitee_email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  className={
                    inv.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }
                >
                  {inv.status}
                </Badge>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  {formatDate(inv.created_at)}
                </span>
                {inv.status === 'active' && (
                  <button
                    onClick={() => setRevokeTarget(inv.invitee_id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Revoke invitation"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={onRevoke}
        title="Revoke Invitation"
        message="Are you sure? The user will lose access to this private poll."
        confirmLabel="Revoke"
        isLoading={revokeInvitation.isPending}
      />
    </div>
  );
}
