export interface SubHeaderRoute {
  href: string;
  title: string;
  description: string;
}

export interface HeaderRoute {
  title: string;
  href: string;
  submenu: SubHeaderRoute[];
}

export const ROUTE_PATHS = {
  dmcheckData: '/dmcheck-data',
  deviations: '/deviations',
  failuresLv: '/failures/lv',
  inw2spis: '/inw-2/spis',
  inw2zatwierdz: '/inw-2/zatwierdz',
  proOldRework: '/pro-old/rework',
  adminUsers: '/admin/users',
  adminEmployees: '/admin/employees',
  adminEmployeesAddMany: '/admin/employees/add-many',
  adminDmcheckArticles: '/admin/dmcheck-articles',
  adminReworkMany: '/admin/rework-many',
};

export const plHeaderRoutes: HeaderRoute[] = [
  {
    title: 'Produkcja',
    href: '',
    submenu: [
      {
        href: ROUTE_PATHS.dmcheckData,
        title: 'DMCheck Data',
        description: 'Dane w systemie skanowania kodów DMC.',
      },
      {
        href: ROUTE_PATHS.deviations,
        title: 'Odchylenia - test',
        description: 'Zarządzanie odchyleniami produkcji. Wersja testowa.',
      },
      {
        href: ROUTE_PATHS.failuresLv,
        title: 'Awarie LV',
        description: 'Raport oraz zgłaszanie awarii LV.',
      },
    ],
  },
  {
    title: 'Inwentaryzacja',
    href: '',
    submenu: [
      {
        href: ROUTE_PATHS.inw2spis,
        title: 'Inwentaryzacja - spis',
        description: 'Aplikacja do wykonywania spisu inwentaryzacyjnego.',
      },
      {
        href: ROUTE_PATHS.inw2zatwierdz,
        title: 'Zatwierdzenie inwentaryzacji',
        description: 'Narzędzie do zatwierdzania zinwentaryzowanych pozycji.',
      },
    ],
  },
];

export const deHeaderRoutes: HeaderRoute[] = [
  {
    title: 'Produktion',
    href: '',
    submenu: [
      {
        href: ROUTE_PATHS.dmcheckData,
        title: 'DMCheck Data',
        description: 'Daten im DMC-Code-Scanning-System.',
      },
      {
        href: ROUTE_PATHS.proOldRework,
        title: 'Rework',
        description: 'Markierung von Teilen oder Chargen als Nacharbeit.',
      },
    ],
  },
];

export const adminHeaderRoutes: HeaderRoute[] = [
  {
    title: 'Admin',
    href: '',
    submenu: [
      {
        href: ROUTE_PATHS.adminUsers,
        title: 'Users management',
        description: 'Manage users roles.',
      },
      {
        href: ROUTE_PATHS.adminEmployees,
        title: 'Employees',
        description: 'Manage employees in Next BRUSS apps.',
      },
      {
        href: ROUTE_PATHS.adminEmployeesAddMany,
        title: 'Add many employees',
        description: 'Add many employees from HYDRA export file.',
      },
      {
        href: ROUTE_PATHS.adminDmcheckArticles,
        title: 'DMCheck articles',
        description: 'Manage articles in DMCheck app.',
      },
      {
        href: ROUTE_PATHS.adminReworkMany,
        title: 'DMCheck rework many',
        description: 'Rework many DMCs / batches at once.',
      },
    ],
  },
];
