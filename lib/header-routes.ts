export interface SubHeaderRoute {
  href: string;
  title: string;
  description?: string;
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
  productionOvertime: '/production-overtime',
  overtimeSubmissions: '/overtime-submissions',
  codesGenerator: '/codes-generator',
  projects: '/projects',
};

export const plHeaderRoutes: HeaderRoute[] = [
  {
    title: 'Produkcja',
    href: '',
    submenu: [
      {
        href: ROUTE_PATHS.dmcheckData,
        title: 'DMCheck Data',
      },
      {
        href: ROUTE_PATHS.deviations,
        title: 'Odchylenia',
      },
      {
        href: ROUTE_PATHS.failuresLv,
        title: 'Awarie LV',
      },
    ],
  },
  {
    title: 'Pracownik',
    href: '',
    submenu: [
      {
        href: ROUTE_PATHS.productionOvertime,
        title: 'Praca w godzinach nadliczbowych - produkcja',
      },
      {
        href: ROUTE_PATHS.overtimeSubmissions,
        title: 'Zgłoszenia nadgodzin - test',
      },
    ],
  },
  {
    title: 'Narzędzia',
    href: '',
    submenu: [
      {
        href: ROUTE_PATHS.codesGenerator,
        title: 'Generator QR/Barcode/DMC',
      },
      {
        href: ROUTE_PATHS.inw2spis,
        title: 'Inwentaryzacja - spis',
      },
      {
        href: ROUTE_PATHS.inw2zatwierdz,
        title: 'Zatwierdzenie inwentaryzacji',
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
      },
      {
        href: ROUTE_PATHS.adminEmployees,
        title: 'Employees',
      },
      {
        href: ROUTE_PATHS.adminEmployeesAddMany,
        title: 'Add many employees',
      },
      {
        href: ROUTE_PATHS.adminDmcheckArticles,
        title: 'DMCheck configs',
      },
      {
        href: ROUTE_PATHS.adminReworkMany,
        title: 'DMCheck rework many',
      },
      {
        href: ROUTE_PATHS.projects,
        title: 'Projects',
      },
    ],
  },
];
