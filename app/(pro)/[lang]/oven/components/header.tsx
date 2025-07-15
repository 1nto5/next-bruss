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
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useOvenLastAvgTemp } from '../data/get-oven-last-avg-temp';
import { useOvenStore, usePersonalNumberStore } from '../lib/stores';

// Utility to get the next shift end after a given date
function getNextShiftEnd(after: Date): Date {
  const hours = [6, 14, 22];
  const d = new Date(after);
  d.setSeconds(0, 0);
  for (let h of hours) {
    const shiftEnd = new Date(d);
    shiftEnd.setHours(h, 0, 0, 0);
    if (shiftEnd > after) return shiftEnd;
  }
  // If after 22:00, next is 6:00 next day
  const nextDay = new Date(d);
  nextDay.setDate(d.getDate() + 1);
  nextDay.setHours(6, 0, 0, 0);
  return nextDay;
}

function ShiftLogoutWatcher() {
  const { operator1, operator2, operator3, logout, lastActivity } =
    usePersonalNumberStore();

  useEffect(() => {
    if (!operator1 || !lastActivity) return;
    const check = () => {
      const last = new Date(lastActivity);
      const nextShiftEnd = getNextShiftEnd(last);
      if (new Date() > nextShiftEnd) {
        logout();
        toast.info('Koniec zmiany - wylogowano!');
      }
    };
    const interval = setInterval(check, 60 * 1000); // check every minute
    check(); // check immediately on mount
    return () => clearInterval(interval);
  }, [operator1, lastActivity, logout]);

  // Optionally, update lastActivity on user action for more accuracy
  // (not required for basic shift logout)

  return null;
}

export default function Header() {
  const { operator1, operator2, operator3, logout, lastActivity } =
    usePersonalNumberStore();
  const { selectedOven, clearOven } = useOvenStore();
  const { data: tempData } = useOvenLastAvgTemp(selectedOven);
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
      <ShiftLogoutWatcher />
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
            {/* Show last average temperature if available */}
            {selectedOven && (
              <Badge
                variant='destructive'
                size='default'
                className='flex items-center gap-1'
              >
                {tempData &&
                'avgTemp' in tempData &&
                typeof tempData.avgTemp === 'number' &&
                !isNaN(tempData.avgTemp)
                  ? `${tempData.avgTemp}°C`
                  : '-'}
              </Badge>
            )}
            {loggedInOperators.length > 0 && (
              <div className='flex items-center gap-1'>
                {loggedInOperators.map((operator) => (
                  <Badge
                    key={operator.identifier}
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
              <Button onClick={clearOven} variant='ghost' size='icon'>
                <Flame className='h-[1.2rem] w-[1.2rem]' />
              </Button>
            )}
            {loggedInOperators.length > 0 && (
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

      {/* Remove AlertDialog for oven change, keep only for logout */}
      <AlertDialog
        open={alertOpen && pendingAction?.type === 'logout'}
        onOpenChange={setAlertOpen}
      >
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
