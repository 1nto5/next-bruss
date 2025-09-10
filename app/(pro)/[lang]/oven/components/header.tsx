'use client';

import {
  Header as BaseHeader,
  HeaderButton,
} from '@/app/(pro)/[lang]/components/header-layout';
import LanguageSwitcher from '@/app/(pro)/[lang]/components/language-switcher';
import { ThemeToggle } from '@/app/(pro)/[lang]/components/theme-toggle';
import VolumeControl from '@/app/(pro)/[lang]/components/volume-control';
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
import type { Locale } from '@/i18n.config';
import {
  Flame,
  LogOut,
  Thermometer,
  TimerReset,
  User,
  UserPen,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useOvenLastAvgTemp } from '../data/get-oven-last-avg-temp';
import { useGetOvenProcesses } from '../data/get-oven-processes';
import type { Dictionary } from '../lib/dictionary';
import { useOperatorStore, useOvenStore } from '../lib/stores';

interface HeaderProps {
  dict: Dictionary;
  lang: Locale;
}

export default function Header({ dict, lang }: HeaderProps) {
  const { operator1, operator2, operator3, logout } = useOperatorStore();
  const { selectedOven, selectedProgram, clearOven, clearProgram } =
    useOvenStore();
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
  const hasRunningProcesses =
    processesData &&
    'success' in processesData &&
    processesData.success.some((process) => process.status === 'running');

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

  const leftContent = (
    <>
      {selectedOven ? (
        <Badge variant='default' className='flex items-center gap-2'>
          <Flame className='h-4 w-4' />
          {selectedOven.toUpperCase()}
        </Badge>
      ) : (
        <Badge variant='default' className='flex items-center gap-2'>
          <Flame className='h-4 w-4' />
          OVEN
        </Badge>
      )}
      {selectedProgram && (
        <Badge variant='secondary' className='flex items-center gap-2'>
          <TimerReset className='h-4 w-4' />
          {selectedProgram}
        </Badge>
      )}
      {/* Show last average temperature if available */}
      {selectedOven && (
        <Badge variant='destructive' className='flex items-center gap-2'>
          <Thermometer className='h-4 w-4' />
          {tempData &&
          'avgTemp' in tempData &&
          typeof tempData.avgTemp === 'number' &&
          !isNaN(tempData.avgTemp)
            ? `${tempData.avgTemp}°C`
            : '-'}
        </Badge>
      )}
      {loggedInOperators.length > 0 && (
        <div className='flex items-center gap-2'>
          {loggedInOperators.map((operator) => (
            <Badge
              key={operator.identifier}
              variant='secondary'
              className='flex items-center gap-2'
            >
              <User className='h-4 w-4' />
              {operator.firstName} {operator.lastName.charAt(0).toUpperCase()}.
            </Badge>
          ))}
        </div>
      )}
    </>
  );

  const rightContent = (
    <>
      {selectedOven && (
        <HeaderButton
          icon={<Flame />}
          onClick={clearOven}
          title={dict.header.clearOven || 'Change oven'}
          text={dict.header.clearOven || 'Change oven'}
        />
      )}
      {selectedProgram && !hasRunningProcesses && (
        <HeaderButton
          icon={<TimerReset />}
          onClick={clearProgram}
          title={dict.header.clearProgram || 'Change program'}
          text={dict.header.clearProgram || 'Change program'}
        />
      )}
      {loggedInOperators.length > 0 && (
        <HeaderButton
          icon={<UserPen />}
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
          title={dict.header.logoutDialog.title || 'Logout'}
          text={dict.header.logoutDialog.title || 'Logout'}
        />
      )}
      <VolumeControl />
      <ThemeToggle />
      <LanguageSwitcher currentLang={lang} />
    </>
  );

  return (
    <>
      <BaseHeader leftContent={leftContent} rightContent={rightContent} />

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
          <AlertDialogFooter className='flex w-full flex-row gap-2'>
            <AlertDialogCancel className='flex w-1/4 items-center justify-center gap-2'>
              <X className='h-4 w-4' />
              {dict.header.logoutDialog.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeAction}
              className='flex w-3/4 items-center justify-center gap-2'
            >
              <LogOut className='h-4 w-4' />
              {dict.header.logoutDialog.continue}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
