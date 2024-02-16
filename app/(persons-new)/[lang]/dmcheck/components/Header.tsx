import React from 'react';
import Link from 'next/link';
import Container from '@/components/ui/container';
import { ThemeModeToggle } from './ThemeModeToggle';
import { LogoutAll } from './Logout';
import { Relaod } from './Reload';
import Logo from './Logo';

type HeaderProps = {
  dict: any;
  workplaceName: string;
  logoutAllHref: string;
};

export default function Header({
  dict,
  workplaceName,
  logoutAllHref,
}: HeaderProps) {
  return (
    <header className='border-b px-4 py-3 sm:flex sm:justify-between'>
      <Container>
        <div className='relative flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center'>
            <Link
              href={logoutAllHref}
              className='ml-4 flex items-center lg:ml-0'
            >
              <h1 className='font-bold'>Next</h1>
              <Logo logoStyles='mr-2' />
              <h1 className='font-bold'>
                DMCheck {workplaceName.toUpperCase()}
              </h1>
            </Link>
          </div>

          <div className='flex items-center gap-x-2 lg:gap-x-4'>
            <LogoutAll logoutAllHref={logoutAllHref} />
            <Relaod />
            <ThemeModeToggle buttonStyle='mr-2 lg:mr-0' />
          </div>
        </div>
      </Container>
    </header>
  );
}
