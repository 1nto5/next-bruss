import React from 'react';
import Link from 'next/link';
import Container from '@/components/ui/container';
import { ThemeModeToggle } from './ThemeModeToggle';
import { LogoutAll } from './Logout';
import { Relaod } from './Reload';
import Logo from './Logo';
import { Locale } from '@/i18n.config';

type HeaderProps = {
  dict: any;
  workplaceName: string;
  workplaceHref: string;
};

export default function Header({
  dict,
  workplaceName,
  workplaceHref,
}: HeaderProps) {
  return (
    <header className='border-b px-4 py-2 sm:flex sm:justify-between'>
      <Container>
        <div className='relative flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center'>
            <Link
              href={workplaceHref}
              className='ml-4 flex items-center lg:ml-0'
            >
              <h1 className='font-bold'>Next</h1>
              <Logo logoStyles='mr-2' />
              <h1 className='font-bold'>
                DMCheck {workplaceName.toUpperCase()}
              </h1>
            </Link>
          </div>

          <div className='flex items-center gap-x-4'>
            <LogoutAll logoutAllHref={workplaceHref} />
            <Relaod reavalidateHref={workplaceHref} />
            <ThemeModeToggle buttonStyle='mr-2 lg:mr-0' />
          </div>
        </div>
      </Container>
    </header>
  );
}
