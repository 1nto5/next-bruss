'use client';

import Container from '@/components/ui/container';
import Logo from '@/components/ui/logo';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  adminHeaderRoutes,
  deHeaderRoutes,
  plHeaderRoutes,
} from '@/lib/header-routes';
import { cn } from '@/lib/utils';
import { getInitialsFromEmail } from '@/lib/utils/name-format';
import { Menu } from 'lucide-react';
import { Session } from 'next-auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import { logout } from '../auth/actions';
import { LoginLogout } from './login-logout';
import { ThemeModeToggle } from './theme-mode-toggle';
import UserAvatar from './user-avatar';
type HeaderProps = {
  session: Session | null;
  dict: any;
  lang: string;
};

export default function Header({ session, dict, lang }: HeaderProps) {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const router = useRouter();

  const baseRoutes = lang === 'de' ? deHeaderRoutes : plHeaderRoutes;
  const selectedRoutes = session?.user?.roles?.includes('admin')
    ? [...baseRoutes, ...adminHeaderRoutes]
    : baseRoutes;

  return (
    // <header className='px-6 py-4 sm:flex sm:justify-between'>
    <header
      className={`sticky top-0 z-50 px-6 py-4 transition-colors duration-200 sm:flex sm:justify-between ${isScrolled ? 'bg-background/95 supports-backdrop-filter:bg-background/60 border-b backdrop-blur-sm' : 'bg-background'}`}
    >
      <Container>
        <div className='relative flex h-6 w-full items-center justify-between'>
          <div className='flex items-center'>
            <Sheet>
              <SheetTrigger>
                <Menu className='mr-2 h-6 w-6 md:hidden' />
              </SheetTrigger>
              <SheetContent side='left' className='w-[300px] sm:w-[400px]'>
                <nav className='flex flex-col gap-4'>
                  {selectedRoutes.map((route, i) =>
                    route.submenu ? (
                      <div key={i}>
                        <span className='block px-2 py-1 text-sm'>
                          {route.title}
                        </span>
                        <div className='ml-4'>
                          {route.submenu.map((sub) => (
                            <SheetClose key={sub.title} asChild>
                              <Link
                                href={sub.href}
                                className='block px-2 py-1 text-lg'
                              >
                                {sub.title}
                              </Link>
                            </SheetClose>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <SheetClose key={i} asChild>
                        <Link
                          key={i}
                          href={route.href}
                          className='block px-2 py-1 text-lg'
                        >
                          {route.title}
                        </Link>
                      </SheetClose>
                    ),
                  )}
                </nav>
              </SheetContent>
            </Sheet>
            <Link href='/' className='flex items-center'>
              <h1 className='font-bold'>Next</h1>
              <div className='w-24'>
                <Logo />
              </div>
            </Link>
          </div>
          <nav className='mx-6 hidden items-center space-x-4 md:block lg:space-x-6'>
            <NavigationMenu>
              <NavigationMenuList>
                {selectedRoutes.map((route) =>
                  route.submenu ? (
                    <NavigationMenuItem key={route.title}>
                      <NavigationMenuTrigger>
                        {route.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className=''>
                        <ul className='grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]'>
                          {route.submenu.map((subItem) => (
                            <ListItem
                              key={subItem.title}
                              title={subItem.title}
                              href={subItem.href}
                            >
                              {subItem.description}
                            </ListItem>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : (
                    <NavigationMenuItem key={route.title}>
                      <Link href={route.href} legacyBehavior passHref>
                        <NavigationMenuLink
                          className={navigationMenuTriggerStyle()}
                        >
                          {route.title}
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  ),
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
          <div className='flex items-center space-x-2'>
            {session?.user?.email && (
              <UserAvatar
                userInitials={getInitialsFromEmail(session.user.email)}
              />
            )}

            <LoginLogout
              isLoggedIn={!!session}
              onLogin={() => {
                router.push(`/auth`);
              }}
              onLogout={() => {
                logout();
                toast.success('Wylogowano!');
                router.refresh();
              }}
            />

            <ThemeModeToggle />
          </div>
        </div>
      </Container>
    </header>
  );
}
// test
const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline outline-hidden transition-colors select-none',
            className,
          )}
          {...props}
        >
          <div className='text-sm leading-none font-medium'>{title}</div>
          <p className='text-muted-foreground line-clamp-2 text-sm leading-snug'>
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';
