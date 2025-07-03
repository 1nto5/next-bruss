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
import { toast } from 'sonner';
import { cancelOvertimeRequest } from '../actions';

interface CancelRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
}

export default function CancelRequestDialog({
  isOpen,
  onOpenChange,
  requestId,
}: CancelRequestDialogProps) {
  const handleCancel = async () => {
    toast.promise(
      cancelOvertimeRequest(requestId).then((res) => {
        if (res.error) {
          throw new Error(res.error);
        }
        return res;
      }),
      {
        loading: 'Anulowanie zgłoszenia...',
        success: 'Zgłoszenie zostało anulowane!',
        error: (error) => {
          const errorMsg = error.message;
          if (errorMsg === 'unauthorized') return 'Nie masz uprawnień!';
          if (errorMsg === 'not found') return 'Nie znaleziono zgłoszenia!';
          if (errorMsg === 'cannot cancel')
            return 'Nie można anulować tego zgłoszenia!';
          console.error('handleCancel', errorMsg);
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
          <AlertDialogTitle>Anulować zgłoszenie?</AlertDialogTitle>
          <AlertDialogDescription>
            Czy na pewno chcesz anulować to zgłoszenie godzin nadliczbowych? Tej
            akcji nie można cofnąć. Możesz anulować tylko zgłoszenia o statusie
            "Oczekuje".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Nie, zachowaj</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel}>
            Tak, anuluj zgłoszenie
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
