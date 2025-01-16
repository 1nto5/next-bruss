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

  const routes = [
    {
      title: `${dict?.header?.production?.title}`,
      href: '',
      submenu: [
        {
          href: `/pro/export-data`,
          title: `${dict?.header?.production?.exportData.title}`,
          description: `${dict?.header?.production?.exportData.description}`,
        },
        {
          href: '/pro/rework',
          title: `${dict?.header?.production?.rework.title}`,
          description: `${dict?.header?.production?.rework.description}`,
        },
      ],
    },
    {
      title: `Wsparcie`,
      href: '',
      submenu: [
        {
          href: '/deviations',
          title: `Odchylenia`,
          description: `Zarządzanie odchyleniami produkcji.`,
        },
        {
          href: '/capa',
          title: `CAPA`,
          description: `Tabela CAPA dla artykułów.`,
        },
        {
          href: '/inw/spis',
          title: `${dict?.header?.inventory?.inventory.title}`,
          description: `${dict?.header?.inventory?.inventory.description}`,
        },
        {
          href: '/inw/zatwierdz',
          title: `${dict?.header?.inventory?.inventoryApprove.title}`,
          description: `${dict?.header?.inventory?.inventoryApprove.description}`,
        },
        {
          href: '/inw-2/spis',
          title: `${dict?.header?.inventory?.inventory2.title}`,
          description: `${dict?.header?.inventory?.inventory.description}`,
        },
        {
          href: '/inw-2/zatwierdz',
          title: `${dict?.header?.inventory?.inventoryApprove2.title}`,
          description: `${dict?.header?.inventory?.inventoryApprove.description}`,
        },
        {
          href: '/failures/lv',
          title: `Awarie LV`,
          description: `Raport awarii LV.`,
        },
      ],
    },
    ...(session?.user?.roles?.includes('admin')
      ? [
          {
            title: 'Admin',
            href: '',
            submenu: [
              {
                href: '/admin/users',
                title: 'Users management',
                description: 'Manage users roles.',
              },
              {
                href: '/admin/dmcheck-articles',
                title: 'DMCheck articles',
                description: 'Manage articles in DMCheck app.',
              },
              {
                href: '/admin/employees',
                title: 'Employees',
                description: 'Manage employees in Next BRUSS apps.',
              },
              {
                href: '/admin/employees/add-many',
                title: 'Add many employees',
                description: 'Add many employees from HYDRA export file.',
              },
              {
                href: '/admin/employees/add-many',
                title: 'Add many employees for inventory',
                description: 'Add many employees from excel file.',
              },
              {
                href: '/admin/rework-many',
                title: 'Rework many',
                description: 'Rework many DMCs / batches at once.',
              },
            ],
          },
        ]
      : []),
    // {
    //   title: 'Nadgodziny',
    //   href: '/extra-hours',
    // },
  ];

  const routesDe = [
    {
      title: `${dict?.header?.production?.title}`,
      href: '',
      submenu: [
        {
          href: `/pro/export-data`,
          title: `${dict?.header?.production?.exportData.title}`,
          description: `${dict?.header?.production?.exportData.description}`,
        },
        {
          href: '/pro/rework',
          title: `${dict?.header?.production?.rework.title}`,
          description: `${dict?.header?.production?.rework.description}`,
        },
      ],
    },
    ...(session?.user?.roles?.includes('admin')
      ? [
          {
            title: 'Admin',
            href: '',
            submenu: [
              {
                href: '/admin/users',
                title: 'Users management',
                description: 'Manage users roles.',
              },
              {
                href: '/admin/dmcheck-articles',
                title: 'DMCheck articles',
                description: 'Manage articles in DMCheck app.',
              },
              {
                href: '/admin/employees',
                title: 'Employees',
                description: 'Manage employees in Next BRUSS apps.',
              },
              {
                href: '/admin/employees/add-many',
                title: 'Add many employees',
                description: 'Add many employees from HYDRA export file.',
              },
              {
                href: '/admin/rework-many',
                title: 'Rework many',
                description: 'Rework many DMCs / batches at once.',
              },
            ],
          },
        ]
      : []),
  ];

  const selectedRoutes = lang === 'de' ? routesDe : routes;

  return (
    // <header className='px-6 py-4 sm:flex sm:justify-between'>
    <header
      className={`sticky top-0 z-50 px-6 py-4 transition-colors duration-200 sm:flex sm:justify-between ${isScrolled ? 'border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60' : 'bg-background'}`}
    >
      <Container>
        <div className='relative flex h-6 w-full items-center justify-between '>
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
