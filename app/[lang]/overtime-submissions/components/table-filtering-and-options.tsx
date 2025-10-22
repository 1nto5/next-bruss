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

export default function TableFilteringAndOptions({
  fetchTime,
  userRoles = [],
  users = [],
  assignedToMeCount = 0,
  dict,
}: {
  fetchTime: Date;
  userRoles?: string[];
  users: UsersListType;
  assignedToMeCount?: number;
  dict: Dictionary;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPendingSearch, setIsPendingSearch] = useState(false);

  // Multi-select filter states
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

  const [onlyMySubmissions, setOnlyMySubmissions] = useState(() => {
    const param = searchParams?.get('onlyMySubmissions');
    return param === 'true';
  });

  const [assignedToMe, setAssignedToMe] = useState(() => {
    const param = searchParams?.get('assignedToMe');
    return param === 'true';
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

  // Generate month options
  const monthOptions = (() => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Start from June 2025
    const startYear = 2025;

    for (let year = startYear; year <= currentYear; year++) {
      const monthStart = year === startYear ? 5 : 0; // June (month index 5)
      const monthEnd = year === currentYear ? currentMonth : 11; // December or current month

      for (let month = monthStart; month <= monthEnd; month++) {
        const monthStr = (month + 1).toString().padStart(2, '0');
        const yearStr = year.toString();
        const value = `${yearStr}-${monthStr}`;
        const displayText = `${monthStr}.${yearStr}`;

        options.push({
          value,
          label: displayText,
        });
      }
    }

    // Reverse to show most recent months first
    return options.reverse();
  })();

  const handleClearFilters = () => {
    setMonthFilter([]);
    setYearFilter([]);
    setStatusFilter([]);
    setManagerFilter([]);
    setOnlyMySubmissions(false);
    setAssignedToMe(false);
    if (searchParams?.toString()) {
      setIsPendingSearch(true);
      router.push(pathname || '');
    }
  };

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (monthFilter.length > 0) params.set('month', monthFilter.join(','));
    if (yearFilter.length > 0) params.set('year', yearFilter.join(','));
    if (statusFilter.length > 0) params.set('status', statusFilter.join(','));
    if (managerFilter.length > 0) params.set('manager', managerFilter.join(','));
    if (onlyMySubmissions) params.set('onlyMySubmissions', 'true');
    if (assignedToMe) params.set('assignedToMe', 'true');
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

  // Only show toggles if user has assignments as supervisor
  const showToggles = canSupervise && assignedToMeCount > 0;

  // Check if any filter is active (excluding switches)
  const hasActiveFilters = Boolean(
    monthFilter.length > 0 ||
    yearFilter.length > 0 ||
    statusFilter.length > 0 ||
    managerFilter.length > 0
  );

  return (
    <Card>
      <CardHeader className='p-4'>
        {showToggles && (
          <div className='flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2'>
            <div className='flex items-center space-x-2'>
              <Switch
                id='only-my-submissions'
                checked={onlyMySubmissions}
                onCheckedChange={handleOnlyMySubmissionsChange}
              />
              <Label htmlFor='only-my-submissions'>
                {dict.filters.onlyMySubmissions}
              </Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Switch
                id='assigned-to-me'
                checked={assignedToMe}
                onCheckedChange={handleAssignedToMeChange}
              />
              <Label htmlFor='assigned-to-me'>
                {dict.filters.assignedToMe}
              </Label>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className='p-4 pt-0'>
        <form onSubmit={handleSearchClick} className='flex flex-col gap-4'>
            {/* Row 1: Status and Year */}
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
                <Label>{dict.filters.year}</Label>
                <MultiSelect
                  value={yearFilter}
                  onValueChange={setYearFilter}
                  placeholder={dict.filters.select}
                  searchPlaceholder={dict.filters.searchPlaceholder}
                  emptyText={dict.filters.notFound}
                  clearLabel={dict.filters.clearFilter}
                  selectedLabel={dict.filters.selected}
                  className='w-full'
                  options={yearOptions}
                />
              </div>
            </div>

            {/* Row 2: Month and Manager */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='flex flex-col space-y-1'>
                <Label>{dict.filters.month}</Label>
                <MultiSelect
                  value={monthFilter}
                  onValueChange={setMonthFilter}
                  placeholder={dict.filters.select}
                  searchPlaceholder={dict.filters.searchPlaceholder}
                  emptyText={dict.filters.notFound}
                  clearLabel={dict.filters.clearFilter}
                  selectedLabel={dict.filters.selected}
                  className='w-full'
                  options={monthOptions}
                />
              </div>
              {userRoles.includes('admin') || userRoles.includes('hr') ? (
                <div className='flex flex-col space-y-1'>
                  <Label>{dict.filters.manager}</Label>
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
              ) : null}
            </div>

            {/* Row 3: Action buttons */}
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
