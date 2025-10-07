import { Button } from '@/components/ui/button';

import { auth, signOut } from '@/lib/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { cn } from '@/lib/utils/cn';
import {
  adminHeaderRoutes,
  deHeaderRoutes,
  enHeaderRoutes,
  plHeaderRoutes,
} from '@/lib/config/header-routes';
import { getInitialsFromEmail } from '@/lib/utils/name-format';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Locale } from '@/lib/config/i18n';
import { LogIn, LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react';
import { ThemeModeToggle } from '../../../components/theme-mode-toggle';

type HeaderProps = {
  dict: any;
  lang: Locale;
};

// export const dynamic = 'force-dynamic';

export default async function Header({ dict, lang }: HeaderProps) {
  const session = await auth();

  const baseRoutes =
    lang === 'de'
      ? deHeaderRoutes
      : lang === 'en'
        ? enHeaderRoutes
        : plHeaderRoutes;
  const routes = session?.user?.roles?.includes('admin')
    ? [...baseRoutes, ...adminHeaderRoutes]
    : baseRoutes;

  return (
    <header
      className={`bg-background sticky top-0 z-50 w-full border-b px-2 py-4 transition-all`}
    >
      <div className='relative mx-auto flex h-4 w-full items-center justify-between'>
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
                <NavigationMenuItem key={route.title}>
                  <NavigationMenuTrigger className={`p-2`}>
                    {route.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className='grid w-[400px] gap-1 p-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]'>
                      {route.submenu.map((subItem) => (
                        <ListItem
                          key={subItem.title}
                          title={subItem.title}
                          href={subItem.href}
                        ></ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
        <div className='flex items-center space-x-1'>
          {session ? (
            <>
              {session.user?.email && (
                <Avatar>
                  <AvatarFallback>
                    {getInitialsFromEmail(session.user.email)}
                  </AvatarFallback>
                </Avatar>
              )}
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/' });
                }}
              >
                <Button variant={'ghost'} size='icon'>
                  <LogOut />
                </Button>
              </form>
            </>
          ) : (
            <form
              action={async () => {
                'use server';
                redirect('/auth');
              }}
            >
              <Button variant={'ghost'} size='icon'>
                <LogIn />
              </Button>
            </form>
          )}

          <ThemeModeToggle />
        </div>
      </div>
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
