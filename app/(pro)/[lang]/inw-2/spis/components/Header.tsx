import Logo from '@/components/Logo';
import Container from '@/components/ui/container';
import Link from 'next/link';
import { LogoutAll } from './Logout';
import { Reload } from './Reload';
import { ThemeModeToggle } from './ThemeModeToggle';
import VolumeButton from './VolumeButton';

type HeaderProps = {
  dict: any;
  workplaceName: string;
  workplaceHref: string;
};

export default async function Header({
  dict,
  workplaceName,
  workplaceHref,
}: HeaderProps) {
  return (
    <header className='px-6 py-4 sm:flex sm:justify-between'>
      <Container>
        <div className='relative flex h-10 w-full items-center justify-between '>
          <div className='flex items-center'>
            <Link
              href={workplaceHref}
              className='ml-4 flex items-center lg:ml-0'
            >
              <h1 className='font-bold'>Next</h1>
              <div className='w-24'>
                <Logo />
              </div>
            </Link>
            <span className='font-mono font-semibold'>inw-2 spis</span>
          </div>

          <div className='flex items-center space-x-2'>
            <LogoutAll logoutAllHref={workplaceHref} />
            {/* <BoxDialog cDict={dict} lang='pl' /> */}
            <Reload revalidateHref={workplaceHref} />
            <VolumeButton />
            <ThemeModeToggle />
          </div>
        </div>
      </Container>
    </header>
  );
}
