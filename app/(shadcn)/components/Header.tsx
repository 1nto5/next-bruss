'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import Container from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

import { Menu, Moon, ShoppingCart, Sun } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
// import ProfileButton from './ui/ProfileButton';

const inventory = [
  {
    href: '/',
    title: 'Products',
    description: 'Browse our inventory of products.',
  },
  {
    href: '/',
    title: 'Categories',
    description: 'Browse our inventory of products.',
  },
];

const Header = () => {
  const { theme, setTheme } = useTheme();

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
                  {inventory.map((route, i) => (
                    <Link
                      key={i}
                      href={route.href}
                      className='block px-2 py-1 text-lg'
                    >
                      {route.title}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <Link href='/' className='ml-4 lg:ml-0'>
              <h1 className='text-xl font-bold'>Next BRUSS</h1>
            </Link>
          </div>
          <nav className='mx-6 flex hidden items-center space-x-4 md:block lg:space-x-6'>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Inwentaryzacja</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className='grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] '>
                      {inventory.map((inventory) => (
                        <ListItem
                          key={inventory.title}
                          title={inventory.title}
                          href={inventory.href}
                        >
                          {inventory.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href='/export-data' legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      Export danych
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
          <div className='flex items-center'>
            <Button
              variant='ghost'
              size='icon'
              className='mr-2'
              aria-label='Shopping Cart'
            >
              <ShoppingCart className='h-6 w-6' />
              <span className='sr-only'>Shopping Cart</span>
            </Button>
            <Button
              variant='ghost'
              size='icon'
              aria-label='Toggle Theme'
              className='mr-6'
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className='h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
              <Moon className='absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
              <span className='sr-only'>Toggle Theme</span>
            </Button>
            {/* <ProfileButton /> */}
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
