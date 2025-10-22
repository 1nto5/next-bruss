'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

export default function HrViewFilteringAndOptions({
  fetchTime,
  userRoles = [],
  users = [],
  pendingSettlementsCount = 0,
  dict,
}: {
  fetchTime: Date;
  userRoles?: string[];
  users: UsersListType;
  pendingSettlementsCount?: number;
  dict: Dictionary;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPendingSearch, setIsPendingSearch] = useState(false);

  const [employeeFilter, setEmployeeFilter] = useState<string[]>(() => {
    const employeeParam = searchParams?.get('employee');
    return employeeParam ? employeeParam.split(',') : [];
  });

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

  const [onlyPendingSettlements, setOnlyPendingSettlements] = useState(() => {
    const param = searchParams?.get('pendingSettlements');
    return param === 'true';
  });

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
    // If no year selected, return empty array
    if (yearFilter.length === 0) {
      return [];
    }

    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Start from June 2025
    const absoluteStartYear = 2025;

    // Generate months only for selected years
    const selectedYears = yearFilter.map((y) => parseInt(y)).sort((a, b) => a - b);

    for (const year of selectedYears) {
      const monthStart = year === absoluteStartYear ? 5 : 0; // June (month index 5)
      const monthEnd = year === currentYear ? currentMonth : 11; // December or current month

      for (let month = monthStart; month <= monthEnd; month++) {
        const monthStr = (month + 1).toString().padStart(2, '0');
        const yearStr = year.toString();
        const value = `${yearStr}-${monthStr}`;
        // Format: "10 - Październik"
        const monthName = dict.months[monthStr as keyof typeof dict.months];
        const displayText = `${monthStr} - ${monthName}`;

        options.push({
          value,
          label: displayText,
        });
      }
    }

    // Reverse to show most recent months first
    return options.reverse();
  })();

  // Generate week options for selected year
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
        label = `${dict.filters.weekLabel} ${week}: ${mondayDay}-${sundayDay}.${mondayMonth.toString().padStart(2, '0')}`;
      } else {
        label = `${dict.filters.weekLabel} ${week}: ${mondayDay}.${mondayMonth.toString().padStart(2, '0')}-${sundayDay}.${sundayMonth.toString().padStart(2, '0')}`;
      }

      options.push({
        value: `${year}-W${week.toString().padStart(2, '0')}`,
        label,
      });
    }

    return options;
  };

  // Week options - only available when exactly 1 year is selected
  const weekOptions = (() => {
    if (yearFilter.length === 1) {
      const year = parseInt(yearFilter[0]);
      const allWeeks = generateWeekOptionsForYear(year);

      // If month filter is active, only show weeks that belong to selected months
      if (monthFilter.length > 0) {
        return allWeeks.filter(weekOption => {
          // Parse week value (format: "2025-W42")
          const weekValue = weekOption.value;
          const weekNum = parseInt(weekValue.split('-W')[1]);

          // Get Monday of this week
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

          // Check if week overlaps with any selected month
          return monthFilter.some(monthValue => {
            const [yearStr, monthStr] = monthValue.split('-');
            const month = parseInt(monthStr);
            const monthStart = new Date(parseInt(yearStr), month - 1, 1);
            const monthEnd = new Date(parseInt(yearStr), month, 0);

            // Week overlaps if Monday or Sunday is in the month
            return (monday >= monthStart && monday <= monthEnd) ||
                   (sunday >= monthStart && sunday <= monthEnd) ||
                   (monday < monthStart && sunday > monthEnd);
          });
        });
      }

      return allWeeks;
    }
    return [];
  })();

  // Filters are disabled when they have no options available
  const isMonthFilterDisabled = monthOptions.length === 0;
  const isWeekFilterDisabled = weekOptions.length === 0;

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

  const handleClearFilters = () => {
    setMonthFilter([]);
    setWeekFilter([]);
    setYearFilter([]);
    setStatusFilter([]);
    setEmployeeFilter([]);
    setOnlyPendingSettlements(false);
    if (searchParams?.toString()) {
      setIsPendingSearch(true);
      router.push(pathname || '');
    }
  };

  // Handle year filter change with dependent filter logic
  const handleYearFilterChange = (values: string[]) => {
    setYearFilter(values);
    // If not exactly 1 year selected, clear week filter
    if (values.length !== 1 && weekFilter.length > 0) {
      setWeekFilter([]);
    }
  };

  // Handle week filter change - clears month filter
  const handleWeekFilterChange = (values: string[]) => {
    setWeekFilter(values);
    // If week is selected, clear month filter (mutually exclusive)
    if (values.length > 0 && monthFilter.length > 0) {
      setMonthFilter([]);
    }
  };

  // Handle month filter change - clears week filter
  const handleMonthFilterChange = (values: string[]) => {
    setMonthFilter(values);
    // If month is selected, clear week filter (mutually exclusive)
    if (values.length > 0 && weekFilter.length > 0) {
      setWeekFilter([]);
    }
  };

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (monthFilter.length > 0) params.set('month', monthFilter.join(','));
    if (weekFilter.length > 0) params.set('week', weekFilter.join(','));
    if (yearFilter.length > 0) params.set('year', yearFilter.join(','));
    if (statusFilter.length > 0) params.set('status', statusFilter.join(','));
    if (employeeFilter.length > 0) params.set('employee', employeeFilter.join(','));
    if (onlyPendingSettlements) params.set('pendingSettlements', 'true');
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

  // Check if any filter is active (excluding switches)
  const hasActiveFilters = Boolean(
    monthFilter.length > 0 ||
    weekFilter.length > 0 ||
    yearFilter.length > 0 ||
    statusFilter.length > 0 ||
    employeeFilter.length > 0
  );

  return (
    <Card>
      <CardHeader className='p-4'>
        <div className='flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2'>
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
              {dict.filters.pendingSettlements}
              {pendingSettlementsCount > 0 && ` (${pendingSettlementsCount})`}
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className='p-4 pt-0'>
          <form onSubmit={handleSearchClick} className='flex flex-col gap-4'>
            {/* Row 1: Status and Employee */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
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
                <Label>{dict.filters.employee}</Label>
                <MultiSelect
                  value={employeeFilter}
                  onValueChange={setEmployeeFilter}
                  placeholder={dict.filters.select}
                  searchPlaceholder={dict.filters.searchPlaceholder}
                  emptyText={dict.filters.notFound}
                  clearLabel={dict.filters.clearFilter}
                  selectedLabel={dict.filters.selected}
                  className='w-full'
                  options={users.map((user) => ({
                    value: user.email,
                    label: user.name,
                  }))}
                />
              </div>
            </div>

            {/* Row 2: Year and Month */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
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
                <Label>{isMonthFilterDisabled ? dict.filters.monthHint : dict.filters.month}</Label>
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
                  disabled={isMonthFilterDisabled}
                />
              </div>
            </div>

            {/* Row 3: Week filter */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
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
              <div /> {/* Empty div for grid layout */}
            </div>

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
                disabled={isPendingSearch}
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
