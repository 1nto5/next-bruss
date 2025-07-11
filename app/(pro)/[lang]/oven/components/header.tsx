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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, UserPen } from 'lucide-react';
import { useState } from 'react';
import { useOvenStore, usePersonalNumberStore } from '../lib/stores';

export default function Header() {
  const { operator1, operator2, operator3, personalNumber1, logout } =
    usePersonalNumberStore();
  const { selectedOven, clearOven } = useOvenStore();
  const [alertOpen, setAlertOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'oven' | 'logout';
    title: string;
    description: string;
    action: () => void;
  } | null>(null);

  // Get logged-in operators from store
  const loggedInOperators = [operator1, operator2, operator3].filter(
    (operator): operator is NonNullable<typeof operator> => operator !== null,
  );

  const handleConfirmAction = (
    type: 'oven' | 'logout',
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
        <div className='relative mx-auto flex h-4 w-full items-center justify-between'>
          <div className='flex items-center gap-2'>
            {selectedOven && (
              <Badge variant='default' size='default'>
                {selectedOven.toUpperCase()}
              </Badge>
            )}
            {loggedInOperators.length > 0 && (
              <div className='flex items-center gap-1'>
                {loggedInOperators.map((operator) => (
                  <Badge
                    key={operator.personalNumber}
                    variant='secondary'
                    size='sm'
                  >
                    {operator.firstName}{' '}
                    {operator.lastName.charAt(0).toUpperCase()}.
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className='flex items-center space-x-1'>
            {selectedOven && (
              <Button
                onClick={() =>
                  handleConfirmAction(
                    'oven',
                    'Zmiana pieca',
                    'Czy na pewno chcesz zmienić piec?',
                    clearOven,
                  )
                }
                variant='ghost'
                size='icon'
              >
                <Flame className='h-[1.2rem] w-[1.2rem]' />
              </Button>
            )}
            {personalNumber1 && (
              <Button
                onClick={() =>
                  handleConfirmAction(
                    'logout',
                    'Wylogowanie',
                    'Czy na pewno chcesz wylogować?',
                    () => {
                      logout();
                      clearOven();
                    },
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
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction}>
              Kontynuuj
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
