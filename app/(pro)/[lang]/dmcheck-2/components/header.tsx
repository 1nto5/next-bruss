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
import { Component, Factory, LogOut, RotateCcw, User, UserPen, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { Dictionary } from '../lib/dictionary';
import { useOperatorStore, useScanStore } from '../lib/stores';
import ReworkDialog from './rework-dialog';

interface HeaderProps {
  lang: Locale;
  dict: Dictionary;
}

export default function Header({ lang, dict }: HeaderProps) {
  const { operator1, operator2, operator3, logout } = useOperatorStore();
  const { selectedArticle, clearArticle, boxStatus, palletStatus, isRework, setIsRework } =
    useScanStore();
  const searchParams = useSearchParams();
  const workplace = searchParams.get('workplace');
  const [alertOpen, setAlertOpen] = useState(false);
  const [reworkDialogOpen, setReworkDialogOpen] = useState(false);

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
          variant={
            boxStatus.piecesInBox === selectedArticle?.piecesPerBox
              ? 'default'
              : 'outline'
          }
          className={
            boxStatus.piecesInBox === selectedArticle?.piecesPerBox
              ? 'animate-pulse bg-green-600 hover:bg-green-700'
              : ''
          }
        >
          {dict.statusBar.box}: {boxStatus.piecesInBox}/
          {selectedArticle?.piecesPerBox || '?'}
        </Badge>
      )}
      {palletStatus && palletStatus.boxesOnPallet > 0 && (
        <Badge
          variant={
            palletStatus.boxesOnPallet === selectedArticle?.boxesPerPallet
              ? 'default'
              : 'outline'
          }
          className={
            palletStatus.boxesOnPallet === selectedArticle?.boxesPerPallet
              ? 'animate-pulse bg-green-600 hover:bg-green-700'
              : ''
          }
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
              {operator.firstName} {operator.lastName.charAt(0).toUpperCase()}.
            </Badge>
          ))}
        </div>
      )}
    </>
  );

  const rightContent = (
    <>
      {selectedArticle && !boxStatus.boxIsFull && !palletStatus.palletIsFull && (
        <HeaderButton
          icon={<RotateCcw />}
          onClick={() => setReworkDialogOpen(true)}
          title={isRework ? 'Rework aktywny' : 'Otwórz dialog rework'}
          text={dict.scan?.reworkLabel || 'Rework'}
          variant={isRework ? 'destructive' : 'ghost'}
        />
      )}
      {selectedArticle && (
        <HeaderButton
          icon={<Component />}
          onClick={clearArticle}
          title={dict.logout?.clearArticle || 'Wyloguj artykuł'}
          text={dict.logout?.clearArticle || 'Wyloguj artykuł'}
        />
      )}
      {loggedInOperators.length > 0 && (
        <HeaderButton
          icon={<UserPen />}
          onClick={() => setAlertOpen(true)}
          title={dict.logout?.logoutOperators || 'Wyloguj operatorów'}
          text={dict.logout?.logoutOperators || 'Wyloguj operatorów'}
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

      <ReworkDialog
        open={reworkDialogOpen}
        onOpenChange={setReworkDialogOpen}
        isRework={isRework}
        onReworkChange={setIsRework}
        dict={dict}
      />

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
          <AlertDialogFooter className='flex w-full flex-row gap-2'>
            <AlertDialogCancel className='flex w-1/4 items-center justify-center gap-2'>
              <X className='h-4 w-4' />
              {dict.logout?.cancel || 'Anuluj'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                logout();
                clearArticle();
                setAlertOpen(false);
              }}
              className='flex w-3/4 items-center justify-center gap-2'
            >
              <LogOut className='h-4 w-4' />
              {dict.logout?.confirm || 'Wyloguj'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
