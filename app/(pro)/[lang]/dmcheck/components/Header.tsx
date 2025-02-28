import { LogoutAll } from './logout';
import { Reload } from './reload';
import { ThemeModeToggle } from './theme-mode-toggle';
import VolumeButton from './volume-button';

type HeaderProps = {
  workplaceName: string;
  workplaceHref: string;
};

export default async function Header({
  workplaceName,
  workplaceHref,
}: HeaderProps) {
  return (
    <header className='px-2 py-4'>
      <div className='relative flex h-10 w-full items-center justify-between'>
        <div className='flex items-center'>
          <span className='font-mono font-semibold'>
            DMCheck {workplaceName.toLocaleUpperCase()}
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
    </header>
  );
}
