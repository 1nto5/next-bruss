'use client';

import { ProThemeToggle } from '@/app/(pro)/components/ui/pro-theme-toggle';
import { ProHeader, ProHeaderBadge, ProHeaderButton } from '@/app/(pro)/components/ui/pro-layout';
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
import { Component, User, UserPen, Factory } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { Dictionary } from '../lib/dictionary';
import { useOperatorStore, useScanStore } from '../lib/stores';
import LanguageSwitcher from './language-switcher';
import VolumeControl from './volume-control';

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
        <ProHeaderBadge icon={<Factory />} variant='default'>
          {workplace.toUpperCase()}
        </ProHeaderBadge>
      )}
      {selectedArticle && (
        <ProHeaderBadge icon={<Component />} variant='secondary'>
          {selectedArticle.articleNumber}
        </ProHeaderBadge>
      )}
      {boxStatus.piecesInBox > 0 && (
        <ProHeaderBadge 
          variant={boxStatus.piecesInBox === selectedArticle?.piecesPerBox ? 'default' : 'outline'}
          className={boxStatus.piecesInBox === selectedArticle?.piecesPerBox ? 'animate-pulse bg-green-600 hover:bg-green-700' : ''}
        >
          {dict.statusBar.box}: {boxStatus.piecesInBox}/
          {selectedArticle?.piecesPerBox || '?'}
        </ProHeaderBadge>
      )}
      {palletStatus && palletStatus.boxesOnPallet > 0 && (
        <ProHeaderBadge 
          variant={palletStatus.boxesOnPallet === selectedArticle?.boxesPerPallet ? 'default' : 'outline'}
          className={palletStatus.boxesOnPallet === selectedArticle?.boxesPerPallet ? 'animate-pulse bg-green-600 hover:bg-green-700' : ''}
        >
          {dict.statusBar.pallet}: {palletStatus.boxesOnPallet}/
          {selectedArticle?.boxesPerPallet || '?'}
        </ProHeaderBadge>
      )}
      {loggedInOperators.length > 0 && (
        <div className='flex items-center gap-2'>
          {loggedInOperators.map((operator) => (
            <ProHeaderBadge
              key={operator.identifier}
              icon={<User />}
              variant='secondary'
            >
              {operator.firstName}{' '}
              {operator.lastName.charAt(0).toUpperCase()}.
            </ProHeaderBadge>
          ))}
        </div>
      )}
    </>
  );

  const rightContent = (
    <>
      {selectedArticle && (
        <ProHeaderButton
          icon={<Component />}
          onClick={clearArticle}
          title={dict.logout?.clearArticle || 'Wyloguj artykuł'}
        />
      )}
      {loggedInOperators.length > 0 && (
        <ProHeaderButton
          icon={<UserPen />}
          onClick={() => setAlertOpen(true)}
          title={dict.logout?.logoutOperators || 'Wyloguj operatorów'}
        />
      )}
      <VolumeControl />
      <ProThemeToggle />
      <LanguageSwitcher currentLang={lang} />
    </>
  );

  return (
    <>
      <ProHeader leftContent={leftContent} rightContent={rightContent} />

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
          <AlertDialogFooter>
            <AlertDialogCancel>
              {dict.logout?.cancel || 'Anuluj'}
            </AlertDialogCancel>
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
