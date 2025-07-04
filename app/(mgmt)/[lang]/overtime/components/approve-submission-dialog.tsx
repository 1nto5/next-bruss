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
  const handleApprove = async () => {
    toast.promise(
      approveOvertimeSubmission(submissionId).then((res) => {
        if (res.error) {
          throw new Error(res.error);
        }
        return res;
      }),
      {
        loading: 'Zatwierdzanie zgłoszenia...',
        success: 'Zgłoszenie zostało zatwierdzone!',
        error: (error) => {
          const errorMsg = error.message;
          if (errorMsg === 'unauthorized')
            return 'Nie masz uprawnień do zatwierdzania!';
          if (errorMsg === 'not found') return 'Nie znaleziono zgłoszenia!';
          console.error('handleApprove', errorMsg);
          return 'Skontaktuj się z IT!';
        },
      },
    );
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Zatwierdź zgłoszenie</AlertDialogTitle>
          <AlertDialogDescription>
            Czy na pewno chcesz zatwierdzić to zgłoszenie nadgodzin?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Anuluj</AlertDialogCancel>
          <AlertDialogAction onClick={handleApprove}>
            Zatwierdź
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
