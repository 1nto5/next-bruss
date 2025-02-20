'use client';

import { Button } from '@/components/ui/button';
import Container from '@/components/ui/container';
import Logo from '@/components/ui/logo';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  adminHeaderRoutes,
  deHeaderRoutes,
  plHeaderRoutes,
} from '@/lib/header-routes';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Menu } from 'lucide-react';
import { Session } from 'next-auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { logout } from '../auth/actions';
import { LoginLogout } from './login-logout';
import { ThemeModeToggle } from './theme-mode-toggle';
type HeaderProps = {
  session: Session | null;
  dict: any;
  lang: string;
};

export default function Header({ session, dict, lang }: HeaderProps) {
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const baseRoutes = lang === 'de' ? deHeaderRoutes : plHeaderRoutes;
  const routes = session?.user?.roles?.includes('admin')
    ? [...baseRoutes, ...adminHeaderRoutes]
    : baseRoutes;

  return (
    <header
      className={`sticky top-0 z-50 px-6 transition-all duration-300 ${scrolled ? 'bg-background/80 border-b py-2' : 'bg-background py-4'} sm:flex sm:justify-between`}
    >
      <Container>
        <div className='relative flex h-4 w-full items-center justify-between'>
          <div className='flex items-center'>
            <Sheet>
              <SheetTrigger asChild>
                <Button className='sm:hidden' variant={'ghost'} size='icon'>
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side='left' className='w-[250px] sm:w-[300px]'>
                <VisuallyHidden asChild>
                  <SheetTitle>Navigation Menu</SheetTitle>
                </VisuallyHidden>
                <nav className='flex flex-col gap-4'>
                  {routes.map((route, i) => (
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
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <Link href='/' className='flex items-center'>
              <Logo />
            </Link>
          </div>
          <nav className='hidden items-center sm:block'>
            <NavigationMenu>
              <NavigationMenuList>
                {routes.map((route) => (
                  <NavigationMenuItem className='m-0 p-0' key={route.title}>
                    <NavigationMenuTrigger
                      className={`p-2 ${scrolled && 'bg-background/40 h-6'}`}
                    >
                      {route.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className='grid w-[400px] gap-1 p-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]'>
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
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
          <div className='flex items-center'>
            <LoginLogout
              isLoggedIn={!!session}
              onLogin={() => {
                router.push(`/auth`);
              }}
              onLogout={() => {
                logout();
                router.refresh();
              }}
            />

            <ThemeModeToggle buttonStyle='' />
          </div>
        </div>
      </Container>
    </header>
  );
}

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
