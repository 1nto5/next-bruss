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
import { Button } from '@/components/ui/button';
import { Square } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { terminateOvenProcess } from '../actions';
import { processType } from '../lib/types';

interface TerminateProcessDialogProps {
  process: processType;
  onTerminated?: () => void;
}

export function TerminateProcessDialog({
  process,
  onTerminated,
}: TerminateProcessDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);

  const handleTerminate = async () => {
    setIsTerminating(true);
    try {
      const result = await terminateOvenProcess(process._id);

      if (result.success) {
        toast.success('Prozess erfolgreich beendet!');
        onTerminated?.();
      } else if (result.error) {
        console.error(result.error);
        toast.error(
          'Fehler beim Beenden des Prozesses. Kontaktieren Sie den IT-Support!',
        );
      }
    } catch (error) {
      console.error('handleTerminate', error);
      toast.error('Kontaktieren Sie den IT-Support!');
    } finally {
      setIsTerminating(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        variant='destructive'
        size='sm'
        onClick={() => setIsOpen(true)}
        disabled={!!process.terminatedAt}
      >
        <Square className='h-4 w-4' />
        Beenden
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Prozess beenden</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie den Annealing-Prozess für Artikel{' '}
              <span className='font-semibold'>{process.articleNumber}</span> in
              Ofen <span className='font-semibold'>{process.ovenNumber}</span>{' '}
              beenden möchten?
              <br />
              <br />
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isTerminating}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTerminate}
              disabled={isTerminating}
              className='bg-red-600 hover:bg-red-700'
            >
              {isTerminating ? 'Beende...' : 'Prozess beenden'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
