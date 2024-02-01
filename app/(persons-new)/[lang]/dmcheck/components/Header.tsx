'use client';

import React from 'react';
import Link from 'next/link';
import Container from '@/components/ui/container';
import { ThemeModeToggle } from './ThemeModeToggle';
import { LoginLogout } from './LoginLogout';
import Logo from './Logo';
import { useRouter } from 'next/navigation';

type HeaderProps = {
  dict: any;
  workplaceName: string;
};

export default function Header({ dict, workplaceName }: HeaderProps) {
  const router = useRouter();

  return (
    <header className='border-b px-4 py-3 sm:flex sm:justify-between'>
      <Container>
        <div className='relative flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center'>
            <Link href='/' className='ml-4 flex items-center lg:ml-0'>
              <h1 className='font-bold'>Next</h1>
              <Logo logoStyles='mr-2' />
              <h1 className='font-bold'>
                DMCheck {workplaceName.toUpperCase()}
              </h1>
            </Link>
          </div>

          <div className='flex items-center gap-x-2 lg:gap-x-4'>
            <LoginLogout
              isLoggedIn={true}
              onLogin={() => {
                router.push('/auth');
              }}
              onLogout={() => {
                console.log('test logout');
                // toast.success('Wylogowano!');
              }}
              buttonStyle=''
            />
            <ThemeModeToggle buttonStyle='mr-2 lg:mr-0' />
          </div>
        </div>
      </Container>
    </header>
  );
}
