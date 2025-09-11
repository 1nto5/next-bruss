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
import { approveOvertimeRequest as approve } from '../actions';

interface ApproveRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  session: Session | null;
}

export default function ApproveRequestDialog({
  isOpen,
  onOpenChange,
  requestId,
  session,
}: ApproveRequestDialogProps) {
  const handleApprove = async () => {
    // Check if user has plant-manager or admin role
    const isPlantManager = session?.user?.roles?.includes('plant-manager');
    const isAdmin = session?.user?.roles?.includes('admin');

    if (!isPlantManager && !isAdmin) {
      toast.error('Tylko plant manager może zatwierdzać zlecenia!');
      return;
    }

    onOpenChange(false);

    toast.promise(
      approve(requestId).then((res) => {
        if (res.error) {
          throw new Error(res.error);
        }
        return res;
      }),
      {
        loading: 'Zapisuję zmiany...',
        success: 'Zlecenie zatwierdzone!',
        error: (error) => {
          const errorMsg = error.message;
          if (errorMsg === 'unauthorized') return 'Nie masz uprawnień!';
          if (errorMsg === 'not found') return 'Nie znaleziono zlecenia!';
          console.error('handleApprove', errorMsg);
          return 'Skontaktuj się z IT!';
        },
      },
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Zatwierdź zlecenie</AlertDialogTitle>
          <AlertDialogDescription>
            Czy na pewno chcesz zatwierdzić to zlecenie wykonania pracy w
            godzinach nadliczbowych?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Anuluj</AlertDialogCancel>
          <AlertDialogAction onClick={handleApprove}>
            Zatwierdź zlecenie
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
