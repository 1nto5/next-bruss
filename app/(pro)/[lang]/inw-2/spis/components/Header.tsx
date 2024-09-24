import { Button } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { StickyNote, UserPen } from 'lucide-react';
import Link from 'next/link';
import { ThemeModeToggle } from './ThemeModeToggle';

export default async function Header({ emp }: { emp: string }) {
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
          </div>

          <div className='flex items-center space-x-2'>
            <Link href={`/inw-2/spis/${emp}`}>
              <Button type='submit' variant='outline' size='icon'>
                <StickyNote className='h-[1.2rem] w-[1.2rem]' />
              </Button>
            </Link>
            <Link href={'/inw-2/spis'}>
              <Button type='submit' variant='outline' size='icon'>
                <UserPen className='h-[1.2rem] w-[1.2rem]' />
              </Button>
            </Link>
            {/* <BoxDialog cDict={dict} lang='pl' /> */}
            {/* <Reload revalidateHref={workplaceHref} />
            <VolumeButton /> */}
            <ThemeModeToggle />
          </div>
        </div>
      </Container>
    </header>
  );
}
