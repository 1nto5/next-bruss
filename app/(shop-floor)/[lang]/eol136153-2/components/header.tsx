'use client';

import {
  Header as BaseHeader,
  HeaderButton,
} from '@/app/(shop-floor)/[lang]/components/header-layout';
import LanguageSwitcher from '@/app/(shop-floor)/[lang]/components/language-switcher';
import { ThemeToggle } from '@/app/(shop-floor)/[lang]/components/theme-toggle';
import VolumeControl from '@/app/(shop-floor)/[lang]/components/volume-control';
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
import type { Locale } from '@/lib/config/i18n';
import { Factory, Package, User, UserPen } from 'lucide-react';
import { useState } from 'react';
import type { Dictionary } from '../lib/dict';
import { useEOLStore, useOperatorStore } from '../lib/stores';

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
      <Badge variant='default' className='flex items-center gap-2'>
        <Factory className='h-4 w-4' />
        EOL136153
      </Badge>
      {article136Status && (
        <Badge
          variant={article136Status.isFull ? 'destructive' : 'secondary'}
          className={article136Status.isFull ? 'animate-pulse' : ''}
        >
          <Package className='mr-1 h-4 w-4' />
          136: {article136Status.boxesOnPallet}/{article136Status.palletSize}
        </Badge>
      )}
      {article153Status && (
        <Badge
          variant={article153Status.isFull ? 'destructive' : 'secondary'}
          className={article153Status.isFull ? 'animate-pulse' : ''}
        >
          <Package className='mr-1 h-4 w-4' />
          153: {article153Status.boxesOnPallet}/{article153Status.palletSize}
        </Badge>
      )}
      {operator && (
        <Badge variant='secondary' className='flex items-center gap-2'>
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
          title={dict.header.logout || 'Logout'}
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
              {dict.header.logout || 'Logout'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dict.errors.contactIT || 'Are you sure you want to logout?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
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
