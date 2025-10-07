'use client';

import { ThemeModeToggle } from '@/components/theme-mode-toggle';
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
import { SquarePen, StickyNote, UserPen, X, Check } from 'lucide-react';
import { useState } from 'react';
import {
  useCardStore,
  usePersonalNumberStore,
  usePositionStore,
} from '../lib/stores';

export default function Header() {
  const { personalNumber1, logout } = usePersonalNumberStore();
  const { card, setCard } = useCardStore();
  const { position, setPosition } = usePositionStore();
  const [alertOpen, setAlertOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'card' | 'position' | 'logout';
    title: string;
    description: string;
    action: () => void;
  } | null>(null);

  const handleConfirmAction = (
    type: 'card' | 'position' | 'logout',
    title: string,
    description: string,
    action: () => void,
  ) => {
    setPendingAction({ type, title, description, action });
    setAlertOpen(true);
  };

  const executeAction = () => {
    if (pendingAction) {
      pendingAction.action();
    }
    setAlertOpen(false);
    setPendingAction(null);
  };

  return (
    <>
      <header
        className={`bg-background sticky top-0 z-50 w-full border-b px-2 py-4 transition-all`}
      >
        <div className='relative mx-auto flex h-4 w-full max-w-7xl items-center justify-between'>
          <div className='flex items-center'>
            <span className='font-mono font-semibold'>inw-2 spis</span>
          </div>

          <div className='flex items-center space-x-1'>
            {card !== 0 && (
              <Button
                onClick={() =>
                  handleConfirmAction(
                    'card',
                    'Zmiana karty',
                    'Czy na pewno chcesz zmienić kartę?',
                    () => {
                      setCard(0, '', '');
                      setPosition(0);
                    },
                  )
                }
                variant='ghost'
                size='icon'
              >
                <StickyNote className='h-[1.2rem] w-[1.2rem]' />
              </Button>
            )}
            {position !== 0 && (
              <Button
                onClick={() =>
                  handleConfirmAction(
                    'position',
                    'Zmiana pozycji',
                    'Czy na pewno chcesz zmienić pozycję?',
                    () => setPosition(0),
                  )
                }
                variant='ghost'
                size='icon'
              >
                <SquarePen className='h-[1.2rem] w-[1.2rem]' />
              </Button>
            )}
            {personalNumber1 && (
              <Button
                onClick={() =>
                  handleConfirmAction(
                    'logout',
                    'Wylogowanie',
                    'Czy na pewno chcesz się wylogować?',
                    logout,
                  )
                }
                variant='ghost'
                size='icon'
              >
                <UserPen className='h-[1.2rem] w-[1.2rem]' />
              </Button>
            )}
            <ThemeModeToggle />
          </div>
        </div>
      </header>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingAction?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-2 w-full">
            <AlertDialogCancel className="w-1/4 flex items-center justify-center gap-2">
              <X className="h-4 w-4" />
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction onClick={executeAction} className="w-3/4 flex items-center justify-center gap-2">
              <Check className="h-4 w-4" />
              Kontynuuj
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
