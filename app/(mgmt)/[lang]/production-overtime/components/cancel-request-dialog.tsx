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
        loading: 'Anulowanie zlecenia...',
        success: 'Zlecenie zostało anulowane!',
        error: (error) => {
          const errorMsg = error.message;
          if (errorMsg === 'unauthorized') return 'Nie masz uprawnień!';
          if (errorMsg === 'not found') return 'Nie znaleziono zlecenia!';
          if (errorMsg === 'cannot cancel')
            return 'Nie można anulować tego zlecenia!';
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
          <AlertDialogTitle>Anulować zlecenie?</AlertDialogTitle>
          <AlertDialogDescription>
            Czy na pewno chcesz anulować to zlecenie wykonania pracy w godzinach
            nadliczbowych? Tej akcji nie można cofnąć.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Nie, zachowaj</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel}>
            Tak, anuluj zlecenie
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
