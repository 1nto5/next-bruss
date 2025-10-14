'use client';

import {
  Header as BaseHeader,
  HeaderButton,
} from '@/app/(shop-floor)/[lang]/components/header-layout';
import LanguageSwitcher from '@/app/(shop-floor)/[lang]/components/language-switcher';
import { ThemeToggle } from '@/app/(shop-floor)/[lang]/components/theme-toggle';
import VolumeControl from '@/app/(shop-floor)/[lang]/components/volume-control';
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
import type { Locale } from '@/lib/config/i18n';
import { Factory, LogOut, User, UserPen, X } from 'lucide-react';
import { useState } from 'react';
import type { Dictionary } from '../lib/dict';
import { useEOLStore, useOperatorStore } from '../lib/stores';

interface HeaderProps {
  lang: Locale;
  dict: Dictionary;
}

export default function Header({ lang, dict }: HeaderProps) {
  const { operator, logout } = useOperatorStore();
  const { reset } = useEOLStore();
  const [alertOpen, setAlertOpen] = useState(false);

  const leftContent = (
    <>
      <Badge variant='default' className='pointer-events-none flex items-center gap-2 whitespace-nowrap'>
        <Factory className='h-4 w-4' />
        EOL136153
      </Badge>
      {operator && (
        <Badge variant='secondary' className='pointer-events-none flex items-center gap-2 whitespace-nowrap'>
          <User className='h-4 w-4' />
          {operator.firstName} {operator.lastName.charAt(0).toUpperCase()}.
        </Badge>
      )}
    </>
  );

  const rightContent = (
    <>
      {operator && (
        <HeaderButton
          icon={<UserPen />}
          onClick={() => setAlertOpen(true)}
          title={dict.logout?.logoutOperators || 'Logout'}
          text={dict.logout?.logoutOperators || 'Logout'}
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
              {dict.logout?.title || 'Logout'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dict.logout?.description || 'Are you sure you want to logout?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='flex w-full flex-row gap-2'>
            <AlertDialogCancel className='flex w-1/4 items-center justify-center gap-2'>
              <X className='h-4 w-4' />
              {dict.logout?.cancel || 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                logout();
                reset();
                setAlertOpen(false);
              }}
              className='flex w-3/4 items-center justify-center gap-2'
            >
              <LogOut className='h-4 w-4' />
              {dict.logout?.confirm || 'Logout'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
