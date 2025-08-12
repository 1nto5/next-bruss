'use client';

import { ThemeToggle } from '@/app/(pro)/components/theme-toggle';
import { Header as BaseHeader, HeaderButton } from '@/app/(pro)/components/header-layout';
import { Badge } from '@/components/ui/badge';
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
import type { Locale } from '@/i18n.config';
import { Component, User, UserPen, Factory, X, LogOut } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { Dictionary } from '../lib/dictionary';
import { useOperatorStore, useScanStore } from '../lib/stores';
import LanguageSwitcher from '@/app/(pro)/components/language-switcher';
import VolumeControl from '@/app/(pro)/components/volume-control';

interface HeaderProps {
  lang: Locale;
  dict: Dictionary;
}

export default function Header({ lang, dict }: HeaderProps) {
  const { operator1, operator2, operator3, logout } = useOperatorStore();
  const { selectedArticle, clearArticle, boxStatus, palletStatus } =
    useScanStore();
  const searchParams = useSearchParams();
  const workplace = searchParams.get('workplace');
  const [alertOpen, setAlertOpen] = useState(false);

  const loggedInOperators = [operator1, operator2, operator3].filter(
    (operator): operator is NonNullable<typeof operator> => operator !== null,
  );

  const leftContent = (
    <>
      {workplace && (
        <Badge variant='default' className='flex items-center gap-2'>
          <Factory className='h-4 w-4' />
          {workplace.toUpperCase()}
        </Badge>
      )}
      {selectedArticle && (
        <Badge variant='secondary' className='flex items-center gap-2'>
          <Component className='h-4 w-4' />
          {selectedArticle.articleNumber}
        </Badge>
      )}
      {boxStatus.piecesInBox > 0 && (
        <Badge 
          variant={boxStatus.piecesInBox === selectedArticle?.piecesPerBox ? 'default' : 'outline'}
          className={boxStatus.piecesInBox === selectedArticle?.piecesPerBox ? 'animate-pulse bg-green-600 hover:bg-green-700' : ''}
        >
          {dict.statusBar.box}: {boxStatus.piecesInBox}/
          {selectedArticle?.piecesPerBox || '?'}
        </Badge>
      )}
      {palletStatus && palletStatus.boxesOnPallet > 0 && (
        <Badge 
          variant={palletStatus.boxesOnPallet === selectedArticle?.boxesPerPallet ? 'default' : 'outline'}
          className={palletStatus.boxesOnPallet === selectedArticle?.boxesPerPallet ? 'animate-pulse bg-green-600 hover:bg-green-700' : ''}
        >
          {dict.statusBar.pallet}: {palletStatus.boxesOnPallet}/
          {selectedArticle?.boxesPerPallet || '?'}
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
              {operator.firstName}{' '}
              {operator.lastName.charAt(0).toUpperCase()}.
            </Badge>
          ))}
        </div>
      )}
    </>
  );

  const rightContent = (
    <>
      {selectedArticle && (
        <HeaderButton
          icon={<Component />}
          onClick={clearArticle}
          title={dict.logout?.clearArticle || 'Wyloguj artykuł'}
        />
      )}
      {loggedInOperators.length > 0 && (
        <HeaderButton
          icon={<UserPen />}
          onClick={() => setAlertOpen(true)}
          title={dict.logout?.logoutOperators || 'Wyloguj operatorów'}
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

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dict.logout?.title || 'Wylogowanie'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dict.logout?.description || 'Czy na pewno chcesz wylogować?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-2 w-full">
            <AlertDialogCancel className="w-1/4 flex items-center justify-center gap-2">
              <X className="h-4 w-4" />
              {dict.logout?.cancel || 'Anuluj'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                logout();
                clearArticle();
                setAlertOpen(false);
              }}
              className="w-3/4 flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              {dict.logout?.confirm || 'Wyloguj'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
