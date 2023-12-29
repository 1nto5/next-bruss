'use client';

import React from 'react';
import Link from 'next/link';
import Container from '@/components/ui/container';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeModeToggle } from './ThemeModeToggle';
import { LoginLogout } from './LoginLogout';
import { signIn, signOut, useSession } from 'next-auth/react';
import Logo from './Logo';
import UserAvatar from './UserAvatar';
import { getInitialsFromEmail } from '@/lib/utils/nameFormat';
// import { toast } from 'sonner';

const routes = [
  {
    title: 'Produkcja',
    submenu: [
      {
        href: '/pro/export-data',
        title: 'Export danych',
        description: 'Generowanie pliku excel z danymi systemu skanowania.',
      },
      {
        href: '/pro/rework',
        title: 'Rework',
        description: 'Oznaczanie partii jako rework - ponowne skanowanie',
      },
    ],
  },
  {
    title: 'Inwentaryzacja',
    submenu: [
      {
        href: '/inventory/main',
        title: 'Inwentaryzacja',
        description: 'Aplikacja wspierająca proces inwentaryzacji.',
      },
      {
        href: '/inventory/approve',
        title: 'Zatwierdzanie inwentaryzacji',
        description: 'Narzędzie do potwierdzania zinwentaryzowanych pozycji.',
      },
    ],
  },
  {
    title: 'Nadgodziny',
    href: '/extra-hours',
  },
];

const Header = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <header className='border-b px-4 py-3 sm:flex sm:justify-between'>
      <Container>
        <div className='relative flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center'>
            <Sheet>
              <SheetTrigger>
                <Menu className='h-6 w-6 md:hidden' />
              </SheetTrigger>
              <SheetContent side='left' className='w-[300px] sm:w-[400px]'>
                <nav className='flex flex-col gap-4'>
                  {routes.map((route, i) =>
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
            <Link href='/' className='ml-4 flex items-center lg:ml-0'>
              <h1 className='font-bold'>Next</h1>
              <Logo logoStyles='mr-2' />
            </Link>
          </div>
          <nav className='mx-6 hidden items-center space-x-4 md:block lg:space-x-6'>
            {/* do i need flex className?  */}
            <NavigationMenu>
              <NavigationMenuList>
                {routes.map((route) =>
                  route.submenu ? (
                    <NavigationMenuItem key={route.title}>
                      <NavigationMenuTrigger>
                        {route.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
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
          <div className='flex items-center gap-x-2 lg:gap-x-4'>
            {isAuthenticated && session?.user.email && (
              <UserAvatar
                userInitials={getInitialsFromEmail(session?.user.email)}
              />
            )}
            <LoginLogout
              isLoggedIn={isAuthenticated}
              onLogin={() => {
                signIn();
              }}
              onLogout={() => {
                signOut();
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
};

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
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className,
          )}
          {...props}
        >
          <div className='text-sm font-medium leading-none'>{title}</div>
          <p className='line-clamp-2 text-sm leading-snug text-muted-foreground'>
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';

export default Header;
