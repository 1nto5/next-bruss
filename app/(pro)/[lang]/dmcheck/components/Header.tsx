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
    <header className='border-b px-4 py-2 sm:flex sm:justify-between'>
      <Container>
        <div className='relative flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8'>
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
            <span className='font-mono font-semibold'>
              {workplaceName.toLocaleUpperCase()}
            </span>
          </div>

          <div className='flex items-center gap-x-4'>
            <LogoutAll logoutAllHref={workplaceHref} />
            <Reload revalidateHref={workplaceHref} />
            <VolumeButton />
            <ThemeModeToggle buttonStyle='mr-2 lg:mr-0' />
          </div>
        </div>
      </Container>
    </header>
  );
}
