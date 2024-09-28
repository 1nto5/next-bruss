'use client';

import { Button } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { SquarePen, StickyNote, UserPen } from 'lucide-react';
import Link from 'next/link';
import { usePersonalNumberStore } from '../lib/stores';
import { ThemeModeToggle } from './theme-mode-toogle';

export default function Header({ emp, card }: { emp?: string; card?: string }) {
  const { personalNumber1, logout } = usePersonalNumberStore();

  return (
    <header className='px-6 py-4 sm:flex sm:justify-between'>
      <Container>
        <div className='relative flex h-10 w-full items-center justify-between '>
          <div className='flex items-center'>
            {/* <Link
              href={workplaceHref}
              className='ml-4 flex items-center lg:ml-0'
            >
              <h1 className='font-bold'>Next</h1>
              <div className='w-24'>
                <Logo />
              </div>
            </Link> */}
            <span className='font-mono font-semibold'>inw-2 spis</span>
            <span className='ml-8 font-mono font-semibold'>
              Zalogowano: {personalNumber1}
            </span>
          </div>

          <div className='flex items-center space-x-2'>
            {card && (
              <Link href={`/inw-2/spis/${emp}/${card}`}>
                <Button type='submit' variant='outline' size='icon'>
                  <SquarePen className='h-[1.2rem] w-[1.2rem]' />
                </Button>
              </Link>
            )}
            {emp && (
              <Link href={`/inw-2/spis/${emp}`}>
                <Button type='submit' variant='outline' size='icon'>
                  <StickyNote className='h-[1.2rem] w-[1.2rem]' />
                </Button>
              </Link>
            )}
            {personalNumber1 && (
              <Button onClick={logout} variant='outline' size='icon'>
                <UserPen className='h-[1.2rem] w-[1.2rem]' />
              </Button>
            )}
            <ThemeModeToggle />
          </div>
        </div>
      </Container>
    </header>
  );
}
