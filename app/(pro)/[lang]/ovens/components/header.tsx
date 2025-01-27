'use client';

import { Button } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { SquarePen, StickyNote, UserPen } from 'lucide-react';
import {
  useCardStore,
  usePersonalNumberStore,
  usePositionStore,
} from '../lib/stores';
import { ThemeModeToggle } from './theme-mode-toggle';

export default function Header() {
  const { personalNumber1, logout } = usePersonalNumberStore();
  const { card, setCard } = useCardStore();
  const { position, setPosition } = usePositionStore();

  return (
    <Container>
      <header className='px-6 py-4 sm:flex sm:justify-between'>
        <div className='relative flex h-10 w-full items-center justify-between '>
          <div className='flex items-center'>
            <span className='font-mono font-semibold'>inw-2 spis</span>
          </div>

          <div className='flex items-center space-x-2'>
            {card !== 0 && (
              <Button
                onClick={() => {
                  setCard(0, '', '');
                  setPosition(0);
                }}
                variant='outline'
                size='icon'
              >
                <StickyNote className='h-[1.2rem] w-[1.2rem]' />
              </Button>
            )}
            {position !== 0 && (
              <Button
                onClick={() => setPosition(0)}
                variant='outline'
                size='icon'
              >
                <SquarePen className='h-[1.2rem] w-[1.2rem]' />
              </Button>
            )}
            {personalNumber1 && (
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
