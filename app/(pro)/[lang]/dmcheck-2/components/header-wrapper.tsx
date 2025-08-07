'use client';

import { ThemeModeToggle } from '@/components/theme-mode-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Package, User, UserPen, Component } from 'lucide-react';
import { useOperatorStore, useScanStore } from '../lib/stores';
import LanguageSwitcher from './language-switcher';
import VolumeControl from './volume-control';
import type { Locale } from '@/i18n.config';
import type { Dictionary } from '../lib/dictionary';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface HeaderWrapperProps {
  lang: Locale;
  dict: Dictionary;
}

export default function HeaderWrapper({ lang, dict }: HeaderWrapperProps) {
  const { operator1, operator2, operator3, logout } = useOperatorStore();
  const { selectedArticle, clearArticle, boxStatus, palletStatus } = useScanStore();
  const searchParams = useSearchParams();
  const workplace = searchParams.get('workplace');
  const [alertOpen, setAlertOpen] = useState(false);

  const loggedInOperators = [operator1, operator2, operator3].filter(
    (operator): operator is NonNullable<typeof operator> => operator !== null,
  );

  return (
    <>
      <header className='bg-background sticky top-0 z-50 w-full border-b px-2 py-4 transition-all'>
        <div className='relative mx-auto flex h-4 w-full items-center justify-between'>
        <div className='flex items-center gap-2'>
          {workplace && (
            <Badge variant='default' className='flex items-center gap-1'>
              {workplace.toUpperCase()}
            </Badge>
          )}
          {selectedArticle && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              <Component className='h-3 w-3' />
              {selectedArticle.articleNumber}
            </Badge>
          )}
          {boxStatus.piecesInBox > 0 && (
            <Badge variant='outline' size='sm'>
              {dict.statusBar.box}: {boxStatus.piecesInBox}/{selectedArticle?.piecesPerBox || '?'}
            </Badge>
          )}
          {palletStatus && palletStatus.boxesOnPallet > 0 && (
            <Badge variant='outline' size='sm'>
              {dict.statusBar.pallet}: {palletStatus.boxesOnPallet}/{selectedArticle?.boxesPerPallet || '?'}
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
                  {operator.firstName} {operator.lastName.charAt(0).toUpperCase()}.
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className='flex items-center space-x-1'>
          {selectedArticle && (
            <Button onClick={clearArticle} variant='ghost' size='icon' title={dict.logout?.clearArticle || 'Wyloguj artykuł'}>
              <Component className='h-[1.2rem] w-[1.2rem]' />
            </Button>
          )}
          {loggedInOperators.length > 0 && (
            <Button
              onClick={() => setAlertOpen(true)}
              variant='ghost'
              size='icon'
              title={dict.logout?.logoutOperators || 'Wyloguj operatorów'}
            >
              <UserPen className='h-[1.2rem] w-[1.2rem]' />
            </Button>
          )}
          <VolumeControl />
          <ThemeModeToggle />
          <LanguageSwitcher currentLang={lang} dict={dict} />
        </div>
        </div>
      </header>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dict.logout?.title || 'Wylogowanie'}</AlertDialogTitle>
          <AlertDialogDescription>
            {dict.logout?.description || 'Czy na pewno chcesz wylogować?'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{dict.logout?.cancel || 'Anuluj'}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              logout();
              clearArticle();
              setAlertOpen(false);
            }}
          >
            {dict.logout?.confirm || 'Wyloguj'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}