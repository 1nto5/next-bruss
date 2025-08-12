'use client';

import { ThemeToggle } from '@/app/(pro)/components/theme-toggle';
import { Header as BaseHeader, HeaderButton } from '@/app/(pro)/components/header-layout';
import { PBadge } from '@/app/(pro)/components/ui/wrappers';
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
import { Factory, User, UserPen, Package } from 'lucide-react';
import { useState } from 'react';
import type { Dictionary } from '../lib/dictionary';
import { useOperatorStore, useEOLStore } from '../lib/stores';
import LanguageSwitcher from '@/app/(pro)/components/language-switcher';
import VolumeControl from '@/app/(pro)/components/volume-control';

interface HeaderProps {
  lang: Locale;
  dict: Dictionary;
}

export default function Header({ lang, dict }: HeaderProps) {
  const { operator, logout } = useOperatorStore();
  const { article136Status, article153Status, reset } = useEOLStore();
  const [alertOpen, setAlertOpen] = useState(false);

  const leftContent = (
    <>
      <PBadge variant='default' className='flex items-center gap-2'>
        <Factory className='h-4 w-4' />
        EOL136153
      </PBadge>
      {article136Status && (
        <PBadge 
          variant={article136Status.isFull ? 'destructive' : 'secondary'} 
          className={article136Status.isFull ? 'animate-pulse' : ''}
        >
          <Package className='mr-1 h-4 w-4' />
          136: {article136Status.boxesOnPallet}/{article136Status.palletSize}
        </PBadge>
      )}
      {article153Status && (
        <PBadge 
          variant={article153Status.isFull ? 'destructive' : 'secondary'}
          className={article153Status.isFull ? 'animate-pulse' : ''}
        >
          <Package className='mr-1 h-4 w-4' />
          153: {article153Status.boxesOnPallet}/{article153Status.palletSize}
        </PBadge>
      )}
      {operator && (
        <PBadge variant='secondary' className='flex items-center gap-2'>
          <User className='h-4 w-4' />
          {operator.firstName} {operator.lastName.charAt(0).toUpperCase()}.
        </PBadge>
      )}
    </>
  );

  const rightContent = (
    <>
      {operator && (
        <HeaderButton
          icon={<UserPen />}
          onClick={() => setAlertOpen(true)}
          title={dict.header.logout || 'Wyloguj'}
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
              {dict.header.logout || 'Wylogowanie'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dict.errors.contactIT || 'Czy na pewno chcesz wylogować?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                logout();
                reset();
                setAlertOpen(false);
              }}
            >
              Wyloguj
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}