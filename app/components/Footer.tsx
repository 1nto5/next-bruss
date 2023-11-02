import Logo from './Logo';
import ThemeSwitcher from './ThemeSwitcher';
import Reload from './Reload';

export default function Footer() {
  return (
    // <footer className='mb-2 ml-4 mr-8 mt-24 flex items-center justify-between lg:fixed lg:inset-x-0 lg:bottom-0 '>
    <footer className='pointer-events-none fixed inset-x-0 bottom-0 mb-2 ml-4 mr-8 mt-24 flex items-center justify-between'>
      <div className='flex items-center'>
        <Logo />
      </div>
      <div className='pointer-events-auto flex items-center space-x-4'>
        <ThemeSwitcher />
        <Reload />
      </div>
    </footer>
  );
}
