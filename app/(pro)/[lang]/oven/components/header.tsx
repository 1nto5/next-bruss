'use client';

import { Button } from '@/components/ui/button';
import { UserPen } from 'lucide-react';
import { useOperatorsStore } from '../lib/stores';
import AddOvenProcessDialog from './add-oven-process-dialog';
import { ThemeModeToggle } from './theme-mode-toggle';

export default function Header() {
  const { operator1, logout } = useOperatorsStore();

  return (
    <header
      className={`bg-background sticky top-0 z-50 mb-1 w-full border-b px-2 py-4 transition-all`}
    >
      <div className='relative mx-auto flex h-4 w-full max-w-7xl items-center justify-between'>
        <div className='flex items-center'>
          <span className='font-mono font-semibold'>oven</span>
        </div>

        <div className='flex items-center space-x-1'>
          <AddOvenProcessDialog />
          {operator1 && (
            <Button onClick={logout} variant='outline' size='icon'>
              <UserPen className='h-[1.2rem] w-[1.2rem]' />
            </Button>
          )}
          <ThemeModeToggle />
        </div>
      </div>
    </header>
  );
}
