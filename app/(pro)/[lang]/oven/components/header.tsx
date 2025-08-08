'use client';

import LanguageSwitcher from '@/app/(pro)/components/language-switcher';
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
import type { Locale } from '@/i18n.config';
import { Flame, UserPen, TimerReset, Thermometer, User } from 'lucide-react';
import { useState } from 'react';
import { useOvenLastAvgTemp } from '../data/get-oven-last-avg-temp';
import { useGetOvenProcesses } from '../data/get-oven-processes';
import type { Dictionary } from '../lib/dictionary';
import { useOvenStore, usePersonalNumberStore } from '../lib/stores';

interface HeaderProps {
  dict: Dictionary;
  lang: Locale;
}

export default function Header({ dict, lang }: HeaderProps) {
  const { operator1, operator2, operator3, logout } = usePersonalNumberStore();
  const { selectedOven, selectedProgram, clearOven, clearProgram } = useOvenStore();
  const { data: tempData } = useOvenLastAvgTemp(selectedOven);
  const { data: processesData } = useGetOvenProcesses(selectedOven);
  const [alertOpen, setAlertOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'oven' | 'logout';
    title: string;
    description: string;
    action: () => void;
  } | null>(null);

  // Check if there are running processes
  const hasRunningProcesses = processesData && 'success' in processesData && 
    processesData.success.some(process => process.status === 'running');

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
            {selectedOven ? (
              <Badge variant='default' size='default' className='flex items-center gap-1'>
                <Flame className='h-3 w-3' />
                {selectedOven.toUpperCase()}
              </Badge>
            ) : (
              <Badge variant='default' size='default' className='flex items-center gap-1'>
                <Flame className='h-3 w-3' />
                OVEN
              </Badge>
            )}
            {selectedProgram && (
              <Badge variant='secondary' size='default' className='flex items-center gap-1'>
                <TimerReset className='h-3 w-3' />
                {selectedProgram}
              </Badge>
            )}
            {/* Show last average temperature if available */}
            {selectedOven && (
              <Badge
                variant='destructive'
                size='default'
                className='flex items-center gap-1'
              >
                <Thermometer className='h-3 w-3' />
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
                    className='flex items-center gap-1'
                  >
                    <User className='h-3 w-3' />
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
            {selectedProgram && !hasRunningProcesses && (
              <Button onClick={clearProgram} variant='ghost' size='icon'>
                <TimerReset className='h-[1.2rem] w-[1.2rem]' />
              </Button>
            )}
            {loggedInOperators.length > 0 && (
              <Button
                onClick={() =>
                  handleConfirmAction(
                    'logout',
                    dict.header.logoutDialog.title,
                    dict.header.logoutDialog.description,
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
            <LanguageSwitcher currentLang={lang} />
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
            <AlertDialogCancel>{dict.header.logoutDialog.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction}>
              {dict.header.logoutDialog.continue}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
