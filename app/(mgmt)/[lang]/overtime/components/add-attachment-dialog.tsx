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

interface AddAttachmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  submissionId: string;
}

export default function AddAttachmentDialog({
  isOpen,
  onOpenChange,
  submissionId,
}: AddAttachmentDialogProps) {
  const handleAddAttachment = async () => {
    // For now, just close the dialog and show a message
    // This feature can be implemented later if needed
    onOpenChange(false);
    toast.info('Funkcja dodawania załączników będzie dostępna wkrótce.');
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Dodaj załącznik</AlertDialogTitle>
          <AlertDialogDescription>
            Dodaj załącznik do zgłoszenia godzin nadliczbowych.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Anuluj</AlertDialogCancel>
          <AlertDialogAction onClick={handleAddAttachment}>
            Dodaj załącznik
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
