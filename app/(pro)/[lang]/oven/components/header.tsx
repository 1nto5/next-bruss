'use client';

import { Button } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { UserPen } from 'lucide-react';
import { useCodeStore } from '../lib/stores';
import { ThemeModeToggle } from './theme-mode-toggle';

export default function Header() {
  const { code1, logout } = useCodeStore();

  return (
    <Container>
      <header className='px-6 py-4 sm:flex sm:justify-between'>
        <div className='relative flex h-10 w-full items-center justify-between '>
          <div className='flex items-center'>
            <span className='font-mono font-semibold'>oven</span>
          </div>

          <div className='flex items-center space-x-2'>
            {code1 && (
              <Button onClick={logout} variant='outline' size='icon'>
                <UserPen className='h-[1.2rem] w-[1.2rem]' />
              </Button>
            )}
            <ThemeModeToggle />
          </div>
        </div>
      </header>
    </Container>
  );
}
