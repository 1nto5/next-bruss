export interface SubHeaderRoute {
  href: string;
  title: string;
}

export interface HeaderRoute {
  title: string;
  href: string;
  submenu: SubHeaderRoute[];
}

export const ROUTE_PATHS = {
  dmcheckData: '/dmcheck-data',
  ovenData: '/oven-data',
  deviations: '/deviations',
  failuresLv: '/failures/lv',
  inw2spis: '/inw-2/spis',
  inw2zatwierdz: '/inw-2/zatwierdz',

  newsAdd: '/news/add',
  overtimeOrders: '/overtime-orders',
  overtimeSubmissions: '/overtime-submissions',
  forecast: '/forecast',
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
        href: ROUTE_PATHS.ovenData,
        title: 'Śledzenie wygrzewania',
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
        href: ROUTE_PATHS.overtimeOrders,
        title: 'Zlecenia godzin nadliczbowych',
      },
      {
        href: ROUTE_PATHS.overtimeSubmissions,
        title: 'Zgłoszenia nadgodzin - test',
      },
      {
        href: ROUTE_PATHS.forecast,
        title: 'Forecast nadgodzin',
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
      },
    ],
  },
];

export const enHeaderRoutes: HeaderRoute[] = [
  {
    title: 'Production',
    href: '',
    submenu: [
      {
        href: ROUTE_PATHS.dmcheckData,
        title: 'DMCheck Data',
      },
      {
        href: ROUTE_PATHS.ovenData,
        title: 'Oven Data',
      },
      {
        href: ROUTE_PATHS.deviations,
        title: 'Deviations',
      },
      {
        href: ROUTE_PATHS.failuresLv,
        title: 'LV Failures',
      },
    ],
  },
  {
    title: 'Employee',
    href: '',
    submenu: [
      {
        href: ROUTE_PATHS.overtimeOrders,
        title: 'Overtime Orders',
      },
      {
        href: ROUTE_PATHS.overtimeSubmissions,
        title: 'Overtime submissions',
      },
      {
        href: ROUTE_PATHS.forecast,
        title: 'Overtime Forecast',
      },
    ],
  },
  {
    title: 'Tools',
    href: '',
    submenu: [
      {
        href: ROUTE_PATHS.codesGenerator,
        title: 'QR/Barcode/DMC Generator',
      },
      {
        href: ROUTE_PATHS.inw2spis,
        title: 'Inventory - count',
      },
      {
        href: ROUTE_PATHS.inw2zatwierdz,
        title: 'Inventory approval',
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
        href: ROUTE_PATHS.projects,
        title: 'Projects',
      },
      {
        href: ROUTE_PATHS.newsAdd,
        title: 'Add news',
      },
    ],
  },
];
