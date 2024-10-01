import Container from '@/components/ui/container';
import Logo from '@/components/ui/logo';
import Link from 'next/link';
import { LogoutAll } from './logout';
import { Reload } from './reload';
import { ThemeModeToggle } from './theme-mode-toggle';
import VolumeButton from './volume-button';

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
            <span className='font-mono font-semibold'>
              {workplaceName.toLocaleUpperCase()}
            </span>
          </div>

          <div className='flex items-center space-x-4'>
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
