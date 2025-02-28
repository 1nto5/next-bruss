'use client';

import { ThemeModeToggle } from '@/components/theme-mode-toggle';
import { Button } from '@/components/ui/button';
import { SquarePen, StickyNote, UserPen } from 'lucide-react';
import {
  useCardStore,
  usePersonalNumberStore,
  usePositionStore,
} from '../lib/stores';

export default function Header() {
  const { personalNumber1, logout } = usePersonalNumberStore();
  const { card, setCard } = useCardStore();
  const { position, setPosition } = usePositionStore();

  return (
    <header
      className={`bg-background sticky top-0 z-50 w-full border-b px-2 py-4 transition-all`}
    >
      <div className='relative mx-auto flex h-4 w-full max-w-7xl items-center justify-between'>
        <div className='flex items-center'>
          <span className='font-mono font-semibold'>inw-2 spis</span>
        </div>

        <div className='flex items-center space-x-1'>
          {card !== 0 && (
            <Button
              onClick={() => {
                setCard(0, '', '');
                setPosition(0);
              }}
              variant='ghost'
              size='icon'
            >
              <StickyNote className='h-[1.2rem] w-[1.2rem]' />
            </Button>
          )}
          {position !== 0 && (
            <Button onClick={() => setPosition(0)} variant='ghost' size='icon'>
              <SquarePen className='h-[1.2rem] w-[1.2rem]' />
            </Button>
          )}
          {personalNumber1 && (
            <Button onClick={logout} variant='ghost' size='icon'>
              <UserPen className='h-[1.2rem] w-[1.2rem]' />
            </Button>
          )}
          <ThemeModeToggle />
        </div>
      </div>
    </header>
  );
}
