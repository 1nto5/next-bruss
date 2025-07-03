'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Session } from 'next-auth';
import { useState } from 'react';
import { toast } from 'sonner';
import { approveOvertimeSubmission } from '../actions';

type ApproveSubmissionDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  submissionId: string;
  session: Session | null;
};

export default function ApproveSubmissionDialog({
  isOpen,
  onOpenChange,
  submissionId,
  session,
}: ApproveSubmissionDialogProps) {
  const [isPending, setIsPending] = useState(false);

  const handleApprove = async () => {
    setIsPending(true);
    try {
      const res = await approveOvertimeSubmission(submissionId);
      if ('success' in res) {
        toast.success('Zgłoszenie zostało zatwierdzone!');
        onOpenChange(false);
      } else if ('error' in res) {
        console.error(res.error);
        toast.error('Wystąpił błąd podczas zatwierdzania!');
      }
    } catch (error) {
      console.error('Approve submission error:', error);
      toast.error('Wystąpił błąd podczas zatwierdzania!');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Zatwierdź zgłoszenie</AlertDialogTitle>
          <AlertDialogDescription>
            Czy na pewno chcesz zatwierdzić to zgłoszenie godzin nadliczbowych?
            Ta akcja nie może zostać cofnięta.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Anuluj</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={handleApprove}>
            {isPending ? 'Zatwierdzanie...' : 'Zatwierdź'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
