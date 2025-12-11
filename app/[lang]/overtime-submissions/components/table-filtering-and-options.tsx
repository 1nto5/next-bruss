'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Switch } from '@/components/ui/switch';
import { UsersListType } from '@/lib/types/user';
import { CircleX, Loader, Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { revalidateOvertime as revalidate } from '../actions/utils';
import { Dictionary } from '../lib/dict';
import { OVERTIME_FILTER_STATUSES, OvertimeStatus } from '../lib/types';

// Map status values to dictionary keys - TypeScript ensures all filter statuses are covered
const STATUS_DICT_KEYS: Record<typeof OVERTIME_FILTER_STATUSES[number], keyof Dictionary['status']> = {
  'pending': 'pending',
  'pending-plant-manager': 'pendingPlantManager',
  'approved': 'approved',
  'rejected': 'rejected',
  'accounted': 'accounted',
} as const;

export default function TableFilteringAndOptions({
  fetchTime,
  userRoles = [],
  users = [],
  assignedToMeCount = 0,
  assignedToMePendingCount = 0,
  pendingSettlementsCount = 0,
  ordersCount = 0,
  notOrdersCount = 0,
  onlyMySubmissionsCount = 0,
  dict,
}: {
  fetchTime: Date;
  userRoles?: string[];
  users: UsersListType;
  assignedToMeCount?: number;
  assignedToMePendingCount?: number;
  pendingSettlementsCount?: number;
  ordersCount?: number;
  notOrdersCount?: number;
  onlyMySubmissionsCount?: number;
  dict: Dictionary;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPendingSearch, setIsPendingSearch] = useState(false);

  // Multi-select filter states
  const [employeeFilter, setEmployeeFilter] = useState<string[]>(() => {
    const employeeParam = searchParams?.get('employee');
    return employeeParam ? employeeParam.split(',') : [];
  });

  const [managerFilter, setManagerFilter] = useState<string[]>(() => {
    const managerParam = searchParams?.get('manager');
    return managerParam ? managerParam.split(',') : [];
  });

  const managerOptions = users;

  const [monthFilter, setMonthFilter] = useState<string[]>(() => {
    const monthParam = searchParams?.get('month');
    return monthParam ? monthParam.split(',') : [];
  });

  const [yearFilter, setYearFilter] = useState<string[]>(() => {
    const yearParam = searchParams?.get('year');
    return yearParam ? yearParam.split(',') : [];
  });

  const [statusFilter, setStatusFilter] = useState<string[]>(() => {
    const statusParam = searchParams?.get('status');
    return statusParam ? statusParam.split(',') : [];
  });

  const [weekFilter, setWeekFilter] = useState<string[]>(() => {
    const weekParam = searchParams?.get('week');
    return weekParam ? weekParam.split(',') : [];
  });

  const [onlyMySubmissions, setOnlyMySubmissions] = useState(() => {
    const param = searchParams?.get('onlyMySubmissions');
    return param === 'true';
  });

  const [assignedToMe, setAssignedToMe] = useState(() => {
    const param = searchParams?.get('assignedToMe');
    return param === 'true';
  });

  const [onlyPendingSettlements, setOnlyPendingSettlements] = useState(() => {
    const param = searchParams?.get('pendingSettlements');
    return param === 'true';
  });

  const [onlyOrders, setOnlyOrders] = useState(() => {
    const param = searchParams?.get('onlyOrders');
    return param === 'true';
  });

  const [notOrders, setNotOrders] = useState(() => {
    const param = searchParams?.get('notOrders');
    return param === 'true';
  });

  const [idFilter, setIdFilter] = useState(() => {
    return searchParams?.get('id') || '';
  });

  const handleOnlyMySubmissionsChange = (checked: boolean) => {
    setOnlyMySubmissions(checked);
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (checked) {
      params.set('onlyMySubmissions', 'true');
    } else {
      params.delete('onlyMySubmissions');
    }
    setIsPendingSearch(true);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleAssignedToMeChange = (checked: boolean) => {
    setAssignedToMe(checked);
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (checked) {
      params.set('assignedToMe', 'true');
    } else {
      params.delete('assignedToMe');
    }
    setIsPendingSearch(true);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleOnlyPendingSettlementsChange = (checked: boolean) => {
    setOnlyPendingSettlements(checked);
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (checked) {
      params.set('pendingSettlements', 'true');
    } else {
      params.delete('pendingSettlements');
    }
    setIsPendingSearch(true);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleOnlyOrdersChange = (checked: boolean) => {
    setOnlyOrders(checked);
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (checked) {
      params.set('onlyOrders', 'true');
      // Mutually exclusive with notOrders
      params.delete('notOrders');
      setNotOrders(false);
    } else {
      params.delete('onlyOrders');
    }
    setIsPendingSearch(true);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleNotOrdersChange = (checked: boolean) => {
    setNotOrders(checked);
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (checked) {
      params.set('notOrders', 'true');
      // Mutually exclusive with onlyOrders
      params.delete('onlyOrders');
      setOnlyOrders(false);
    } else {
      params.delete('notOrders');
    }
    setIsPendingSearch(true);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Generate year options
  const yearOptions = (() => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Start from 2025
    const startYear = 2025;

    for (let year = startYear; year <= currentYear; year++) {
      options.push({
        value: year.toString(),
        label: year.toString(),
      });
    }

    // Reverse to show most recent years first
    return options.reverse();
  })();

  // Generate month options - only for selected years
  const monthOptions = (() => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Start from June 2025
    const absoluteStartYear = 2025;

    // Only generate months if year is selected
    if (yearFilter.length === 0) {
      return [];
    }

    const yearsToInclude = yearFilter.map((y) => parseInt(y)).sort((a, b) => a - b);

    for (const year of yearsToInclude) {
      const monthStart = year === absoluteStartYear ? 5 : 0; // June (month index 5)
      const monthEnd = year === currentYear ? currentMonth : 11; // December or current month

      for (let month = monthStart; month <= monthEnd; month++) {
        const monthStr = (month + 1).toString().padStart(2, '0');
        const yearStr = year.toString();
        const value = `${yearStr}-${monthStr}`;
        const monthName = dict.months[monthStr as keyof typeof dict.months];
        const displayText = `${monthName} - ${monthStr}.${yearStr}`;

        options.push({
          value,
          label: displayText,
        });
      }
    }

    // Reverse to show most recent months first
    return options.reverse();
  })();

  // Generate week options for selected year (HR/Admin only)
  const generateWeekOptionsForYear = (year: number) => {
    const options = [];
    const firstDayOfYear = new Date(year, 0, 1);
    const lastDayOfYear = new Date(year, 11, 31);

    // Helper function to get ISO week number
    const getISOWeek = (date: Date): number => {
      const target = new Date(date.valueOf());
      const dayNumber = (date.getDay() + 6) % 7;
      target.setDate(target.getDate() - dayNumber + 3);
      const firstThursday = target.valueOf();
      target.setMonth(0, 1);
      if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
      }
      return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    };

    // Helper function to get Monday of ISO week
    const getFirstDayOfISOWeek = (year: number, week: number): Date => {
      const simple = new Date(year, 0, 1 + (week - 1) * 7);
      const dayOfWeek = simple.getDay();
      const isoWeekStart = simple;
      if (dayOfWeek <= 4) {
        isoWeekStart.setDate(simple.getDate() - simple.getDay() + 1);
      } else {
        isoWeekStart.setDate(simple.getDate() + 8 - simple.getDay());
      }
      return isoWeekStart;
    };

    // Determine week range for the year
    const firstWeek = getISOWeek(firstDayOfYear);
    const lastWeek = getISOWeek(lastDayOfYear);

    const startWeek = firstWeek === 1 ? 1 : firstWeek;
    const endWeek = lastWeek === 1 ? 52 : lastWeek;

    for (let week = startWeek; week <= endWeek; week++) {
      const monday = getFirstDayOfISOWeek(year, week);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      // Format: "Tydzień 42: 14-20.10" (using translated label)
      const mondayDay = monday.getDate();
      const sundayDay = sunday.getDate();
      const mondayMonth = monday.getMonth() + 1;
      const sundayMonth = sunday.getMonth() + 1;

      let label;
      if (mondayMonth === sundayMonth) {
        label = `${dict.filters.weekLabel || 'Week'} ${week}: ${mondayDay}-${sundayDay}.${mondayMonth.toString().padStart(2, '0')}`;
      } else {
        label = `${dict.filters.weekLabel || 'Week'} ${week}: ${mondayDay}.${mondayMonth.toString().padStart(2, '0')}-${sundayDay}.${sundayMonth.toString().padStart(2, '0')}`;
      }

      options.push({
        value: `${year}-W${week.toString().padStart(2, '0')}`,
        label,
      });
    }

    return options;
  };

  // Week options - available when year selected, optionally filtered by month (HR/Admin only)
  const weekOptions = (() => {
    if (yearFilter.length !== 1) {
      return []; // Week only available when exactly 1 year is selected
    }

    const year = parseInt(yearFilter[0]);
    const allWeeks = generateWeekOptionsForYear(year);

    // If no month selected, return all weeks from the year
    if (monthFilter.length === 0) {
      return allWeeks;
    }

    // If month(s) selected, filter weeks that fall within those months
    const filteredWeeks = allWeeks.filter((weekOption) => {
      // Parse week value: "2025-W42"
      const [yearStr, weekPart] = weekOption.value.split('-W');
      const weekNum = parseInt(weekPart);

      // Calculate Monday of this week
      const getFirstDayOfISOWeek = (year: number, week: number): Date => {
        const simple = new Date(year, 0, 1 + (week - 1) * 7);
        const dayOfWeek = simple.getDay();
        const isoWeekStart = simple;
        if (dayOfWeek <= 4) {
          isoWeekStart.setDate(simple.getDate() - simple.getDay() + 1);
        } else {
          isoWeekStart.setDate(simple.getDate() + 8 - simple.getDay());
        }
        return isoWeekStart;
      };

      const monday = getFirstDayOfISOWeek(year, weekNum);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      // Check if this week overlaps with any selected month
      return monthFilter.some((monthValue) => {
        const [monthYearStr, monthNumStr] = monthValue.split('-');
        const monthYear = parseInt(monthYearStr);
        const monthNum = parseInt(monthNumStr) - 1; // Convert to 0-indexed

        const monthStart = new Date(monthYear, monthNum, 1);
        const monthEnd = new Date(monthYear, monthNum + 1, 0, 23, 59, 59, 999);

        // Week overlaps if Monday or Sunday falls within the month
        return (
          (monday >= monthStart && monday <= monthEnd) ||
          (sunday >= monthStart && sunday <= monthEnd) ||
          (monday < monthStart && sunday > monthEnd)
        );
      });
    });

    return filteredWeeks;
  })();

  const isWeekFilterDisabled = yearFilter.length !== 1;

  const handleClearFilters = () => {
    setMonthFilter([]);
    setWeekFilter([]);
    setYearFilter([]);
    setStatusFilter([]);
    setManagerFilter([]);
    setEmployeeFilter([]);
    setOnlyMySubmissions(false);
    setAssignedToMe(false);
    setOnlyPendingSettlements(false);
    setOnlyOrders(false);
    setNotOrders(false);
    setIdFilter('');
    if (searchParams?.toString()) {
      setIsPendingSearch(true);
      router.push(pathname || '');
    }
  };

  // Handle year filter change with dependent filter logic
  const handleYearFilterChange = (values: string[]) => {
    setYearFilter(values);
    // If no years selected, clear month and week filters
    if (values.length === 0) {
      if (monthFilter.length > 0) {
        setMonthFilter([]);
      }
      if (weekFilter.length > 0) {
        setWeekFilter([]);
      }
    }
    // If not exactly 1 year selected, clear week filter
    else if (values.length !== 1 && weekFilter.length > 0) {
      setWeekFilter([]);
    }
  };

  // Handle week filter change
  const handleWeekFilterChange = (values: string[]) => {
    setWeekFilter(values);
  };

  // Handle month filter change
  const handleMonthFilterChange = (values: string[]) => {
    setMonthFilter(values);
  };

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (employeeFilter.length > 0) params.set('employee', employeeFilter.join(','));
    if (weekFilter.length > 0) params.set('week', weekFilter.join(','));
    if (monthFilter.length > 0) params.set('month', monthFilter.join(','));
    if (yearFilter.length > 0) params.set('year', yearFilter.join(','));
    if (statusFilter.length > 0) params.set('status', statusFilter.join(','));
    if (managerFilter.length > 0) params.set('manager', managerFilter.join(','));
    if (onlyMySubmissions) params.set('onlyMySubmissions', 'true');
    if (assignedToMe) params.set('assignedToMe', 'true');
    if (onlyPendingSettlements) params.set('pendingSettlements', 'true');
    if (onlyOrders) params.set('onlyOrders', 'true');
    if (notOrders) params.set('notOrders', 'true');
    if (idFilter) params.set('id', idFilter);
    const newUrl = `${pathname}?${params.toString()}`;
    if (newUrl !== `${pathname}?${searchParams?.toString()}`) {
      setIsPendingSearch(true);
      router.push(newUrl);
    } else {
      setIsPendingSearch(true);
      revalidate();
    }
  };

  useEffect(() => {
    setIsPendingSearch(false);
  }, [fetchTime]);

  // Check if user is a manager, leader, admin, or HR - these roles can supervise/approve
  const canSupervise = userRoles.some(
    (role) =>
      role.toLowerCase().includes('manager') ||
      role.toLowerCase().includes('leader'),
  ) || userRoles.includes('admin') || userRoles.includes('hr');

  const isHR = userRoles.includes('hr');
  const isAdmin = userRoles.includes('admin');
  const isManager = userRoles.some((role: string) => role.toLowerCase().includes('manager'));

  // Only show toggles if user has assignments as supervisor
  const showToggles = canSupervise && assignedToMeCount > 0;

  // Check if any filter is active (including switches) or if URL has parameters that need to be cleared
  const hasActiveFilters = Boolean(
    employeeFilter.length > 0 ||
    weekFilter.length > 0 ||
    monthFilter.length > 0 ||
    yearFilter.length > 0 ||
    statusFilter.length > 0 ||
    managerFilter.length > 0 ||
    onlyMySubmissions ||
    assignedToMe ||
    onlyPendingSettlements ||
    onlyOrders ||
    notOrders ||
    idFilter ||
    searchParams?.toString() // Enable buttons if there are URL params to clear
  );

  // Check if user has access to employee/manager filters
  const hasEmployeeFilter = isAdmin || isHR || isManager;
  const hasManagerFilter = isAdmin || isHR;
  const hasAdvancedFilters = hasEmployeeFilter || hasManagerFilter;

  return (
    <Card>
      <CardHeader className='p-4'>
        <div className='flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 sm:flex-wrap'>
          <div className='flex items-center space-x-2'>
            <Switch
              id='overtime-only'
              checked={notOrders}
              onCheckedChange={handleNotOrdersChange}
            />
            <Label htmlFor='overtime-only'>
              {dict.filters.overtimeOnly || 'Overtime'}
              {notOrdersCount > 0 && ` (${notOrdersCount})`}
            </Label>
          </div>
          <div className='flex items-center space-x-2'>
            <Switch
              id='only-orders'
              checked={onlyOrders}
              onCheckedChange={handleOnlyOrdersChange}
            />
            <Label htmlFor='only-orders'>
              {dict.filters.orders || 'Orders'}
              {ordersCount > 0 && ` (${ordersCount})`}
            </Label>
          </div>
          {showToggles && (
            <>
              <div className='flex items-center space-x-2'>
                <Switch
                  id='only-my-submissions'
                  checked={onlyMySubmissions}
                  onCheckedChange={handleOnlyMySubmissionsChange}
                />
                <Label htmlFor='only-my-submissions'>
                  {dict.filters.onlyMySubmissions}
                  {onlyMySubmissionsCount > 0 && ` (${onlyMySubmissionsCount})`}
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <Switch
                  id='assigned-to-me'
                  checked={assignedToMe}
                  onCheckedChange={handleAssignedToMeChange}
                />
                <Label
                  htmlFor='assigned-to-me'
                  className={`${
                    assignedToMePendingCount > 0
                      ? 'animate-pulse text-red-600 dark:text-red-400'
                      : ''
                  }`}
                >
                  {dict.filters.assignedToMe}
                  {assignedToMePendingCount > 0 && ` (${assignedToMePendingCount})`}
                </Label>
              </div>
            </>
          )}
          {(isHR || isAdmin) && (
            <>
              <div className='flex items-center space-x-2'>
                <Switch
                  id='only-pending-settlements'
                  checked={onlyPendingSettlements}
                  onCheckedChange={handleOnlyPendingSettlementsChange}
                />
                <Label
                  htmlFor='only-pending-settlements'
                  className={`${
                    pendingSettlementsCount > 0
                      ? 'animate-pulse text-red-600 dark:text-red-400'
                      : ''
                  }`}
                >
                  {dict.filters.pendingSettlements || 'Pending Settlements'}
                  {pendingSettlementsCount > 0 && ` (${pendingSettlementsCount})`}
                </Label>
              </div>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className='p-4 pt-4'>
        <form onSubmit={handleSearchClick} className='flex flex-col gap-4'>
            {hasAdvancedFilters ? (
              <>
                {/* Row 1: ID, Status, Employee (conditional), Manager (conditional) */}
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                  <div className='flex flex-col space-y-1'>
                    <Label>{dict.filters.id || 'ID'}</Label>
                    <Input
                      value={idFilter}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setIdFilter(e.target.value)
                      }
                      className='w-full'
                    />
                  </div>
                  <div className='flex flex-col space-y-1'>
                    <Label>{dict.filters.status}</Label>
                    <MultiSelect
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                      placeholder={dict.filters.select}
                      searchPlaceholder={dict.filters.searchPlaceholder}
                      emptyText={dict.filters.notFound}
                      clearLabel={dict.filters.clearFilter}
                      selectedLabel={dict.filters.selected}
                      className='w-full'
                      options={OVERTIME_FILTER_STATUSES.map((status) => ({
                        value: status,
                        label: dict.status[STATUS_DICT_KEYS[status]],
                      }))}
                    />
                  </div>
                  {hasEmployeeFilter && (
                    <div className='flex flex-col space-y-1'>
                      <Label>{dict.filters.employee || 'Employee'}</Label>
                      <MultiSelect
                        value={employeeFilter}
                        onValueChange={setEmployeeFilter}
                        placeholder={dict.filters.select}
                        searchPlaceholder={dict.filters.searchPlaceholder}
                        emptyText={dict.filters.notFound}
                        clearLabel={dict.filters.clearFilter}
                        selectedLabel={dict.filters.selected}
                        className='w-full'
                        options={managerOptions.map((user) => ({
                          value: user.email,
                          label: user.name,
                        }))}
                      />
                    </div>
                  )}
                  {hasManagerFilter && (
                    <div className='flex flex-col space-y-1'>
                      <Label>{dict.filters.manager || 'Manager'}</Label>
                      <MultiSelect
                        value={managerFilter}
                        onValueChange={setManagerFilter}
                        placeholder={dict.filters.select}
                        searchPlaceholder={dict.filters.searchPlaceholder}
                        emptyText={dict.filters.notFound}
                        clearLabel={dict.filters.clearFilter}
                        selectedLabel={dict.filters.selected}
                        className='w-full'
                        options={managerOptions.map((mgr) => ({
                          value: mgr.email,
                          label: mgr.name,
                        }))}
                      />
                    </div>
                  )}
                </div>

                {/* Row 2: Year, Month, Week */}
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  <div className='flex flex-col space-y-1'>
                    <Label>{dict.filters.year}</Label>
                    <MultiSelect
                      value={yearFilter}
                      onValueChange={handleYearFilterChange}
                      placeholder={dict.filters.select}
                      searchPlaceholder={dict.filters.searchPlaceholder}
                      emptyText={dict.filters.notFound}
                      clearLabel={dict.filters.clearFilter}
                      selectedLabel={dict.filters.selected}
                      className='w-full'
                      options={yearOptions}
                    />
                  </div>
                  <div className='flex flex-col space-y-1'>
                    <Label>{yearFilter.length === 0 ? dict.filters.monthHint : dict.filters.month}</Label>
                    <MultiSelect
                      value={monthFilter}
                      onValueChange={handleMonthFilterChange}
                      placeholder={dict.filters.select}
                      searchPlaceholder={dict.filters.searchPlaceholder}
                      emptyText={dict.filters.notFound}
                      clearLabel={dict.filters.clearFilter}
                      selectedLabel={dict.filters.selected}
                      className='w-full'
                      options={monthOptions}
                      disabled={yearFilter.length === 0}
                    />
                  </div>
                  <div className='flex flex-col space-y-1'>
                    <Label>{isWeekFilterDisabled ? dict.filters.weekHint : dict.filters.week}</Label>
                    <MultiSelect
                      value={weekFilter}
                      onValueChange={handleWeekFilterChange}
                      placeholder={dict.filters.select}
                      searchPlaceholder={dict.filters.searchPlaceholder}
                      emptyText={dict.filters.notFound}
                      clearLabel={dict.filters.clearFilter}
                      selectedLabel={dict.filters.selected}
                      className='w-full'
                      options={weekOptions}
                      disabled={isWeekFilterDisabled}
                    />
                  </div>
                </div>
              </>
            ) : (
              /* Single row for basic users: Status, Year, Month, Week */
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <div className='flex flex-col space-y-1'>
                  <Label>{dict.filters.status}</Label>
                  <MultiSelect
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                    placeholder={dict.filters.select}
                    searchPlaceholder={dict.filters.searchPlaceholder}
                    emptyText={dict.filters.notFound}
                    clearLabel={dict.filters.clearFilter}
                    selectedLabel={dict.filters.selected}
                    className='w-full'
                    options={OVERTIME_FILTER_STATUSES.map((status) => ({
                      value: status,
                      label: dict.status[STATUS_DICT_KEYS[status]],
                    }))}
                  />
                </div>
                <div className='flex flex-col space-y-1'>
                  <Label>{dict.filters.year}</Label>
                  <MultiSelect
                    value={yearFilter}
                    onValueChange={handleYearFilterChange}
                    placeholder={dict.filters.select}
                    searchPlaceholder={dict.filters.searchPlaceholder}
                    emptyText={dict.filters.notFound}
                    clearLabel={dict.filters.clearFilter}
                    selectedLabel={dict.filters.selected}
                    className='w-full'
                    options={yearOptions}
                  />
                </div>
                <div className='flex flex-col space-y-1'>
                  <Label>{yearFilter.length === 0 ? dict.filters.monthHint : dict.filters.month}</Label>
                  <MultiSelect
                    value={monthFilter}
                    onValueChange={handleMonthFilterChange}
                    placeholder={dict.filters.select}
                    searchPlaceholder={dict.filters.searchPlaceholder}
                    emptyText={dict.filters.notFound}
                    clearLabel={dict.filters.clearFilter}
                    selectedLabel={dict.filters.selected}
                    className='w-full'
                    options={monthOptions}
                    disabled={yearFilter.length === 0}
                  />
                </div>
                <div className='flex flex-col space-y-1'>
                  <Label>{isWeekFilterDisabled ? dict.filters.weekHint : dict.filters.week}</Label>
                  <MultiSelect
                    value={weekFilter}
                    onValueChange={handleWeekFilterChange}
                    placeholder={dict.filters.select}
                    searchPlaceholder={dict.filters.searchPlaceholder}
                    emptyText={dict.filters.notFound}
                    clearLabel={dict.filters.clearFilter}
                    selectedLabel={dict.filters.selected}
                    className='w-full'
                    options={weekOptions}
                    disabled={isWeekFilterDisabled}
                  />
                </div>
              </div>
            )}

            {/* Row 4: Action buttons */}
            <div className='flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:gap-4'>
              <Button
                type='button'
                variant='destructive'
                onClick={handleClearFilters}
                title={dict.filters.clear}
                disabled={isPendingSearch || !hasActiveFilters}
                className='order-2 w-full sm:order-1'
              >
                <CircleX /> <span>{dict.filters.clear}</span>
              </Button>

              <Button
                type='submit'
                variant='secondary'
                disabled={isPendingSearch || !hasActiveFilters}
                className='order-1 w-full sm:order-2'
              >
                {isPendingSearch ? (
                  <Loader className='animate-spin' />
                ) : (
                  <Search />
                )}
                <span>{dict.filters.search}</span>
              </Button>
            </div>
          </form>
      </CardContent>
    </Card>
  );
}
