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
import { markAsAccountedOvertimeSubmission as markAsAccounted } from '../actions';

interface MarkAsAccountedDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  submissionId: string;
  session: Session | null;
}

export default function MarkAsAccountedDialog({
  isOpen,
  onOpenChange,
  submissionId,
  session,
}: MarkAsAccountedDialogProps) {
  const handleMarkAsAccounted = async () => {
    // Check if user has HR role
    const isHR = session?.user?.roles?.includes('hr');

    if (!isHR) {
      toast.error(
        'Tylko pracownicy HR mogą oznaczać zgłoszenia jako rozliczone!',
      );
      return;
    }

    onOpenChange(false);

    toast.promise(
      markAsAccounted(submissionId).then((res) => {
        if (res.error) {
          throw new Error(res.error);
        }
        return res;
      }),
      {
        loading: 'Oznaczanie jako rozliczone...',
        success: 'Zgłoszenie oznaczone jako rozliczone!',
        error: (error) => {
          const errorMsg = error.message;
          if (errorMsg === 'unauthorized') return 'Nie masz uprawnień!';
          if (errorMsg === 'not found') return 'Nie znaleziono zgłoszenia!';
          if (errorMsg === 'invalid status')
            return 'Nieprawidłowy status zgłoszenia!';
          console.error('handleMarkAsAccounted', errorMsg);
          return 'Skontaktuj się z IT!';
        },
      },
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Oznacz jako rozliczone</AlertDialogTitle>
          <AlertDialogDescription>
            Czy na pewno chcesz oznaczyć to zgłoszenie jako rozliczone? Ta akcja
            jest nieodwracalna i oznacza, że wszystkie nadgodziny zostały
            rozliczone w systemie płacowym.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Anuluj</AlertDialogCancel>
          <AlertDialogAction onClick={handleMarkAsAccounted}>
            Oznacz jako rozliczone
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
