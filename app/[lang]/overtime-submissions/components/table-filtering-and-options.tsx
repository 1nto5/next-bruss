'use client';

import { ClearableCombobox } from '@/components/clearable-combobox';
import { ClearableSelect } from '@/components/clearable-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UsersListType } from '@/lib/types/user';
import { CircleX, Loader, Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { revalidateOvertime as revalidate } from '../actions';
import { Dictionary } from '../lib/dict';

export default function TableFilteringAndOptions({
  fetchTime,

  userRoles = [],
  users = [],
  pendingApprovalsCount = 0,
  dict,
}: {
  fetchTime: Date;
  userRoles?: string[];
  users: UsersListType;
  pendingApprovalsCount?: number;
  dict: Dictionary;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPendingSearch, setIsPendingSearch] = useState(false);
  const [openMonth, setOpenMonth] = useState(false);
  const [openYear, setOpenYear] = useState(false);
  const [openManager, setOpenManager] = useState(false);
  const [managerFilter, setManagerFilter] = useState(() => {
    const managerParam = searchParams?.get('manager');
    return managerParam || '';
  });

  const managerOptions = users;

  const [monthFilter, setMonthFilter] = useState(() => {
    const monthParam = searchParams?.get('month');
    return monthParam || '';
  });
  const [yearFilter, setYearFilter] = useState(() => {
    const yearParam = searchParams?.get('year');
    return yearParam || '';
  });
  const [statusFilter, setStatusFilter] = useState(
    searchParams?.get('status') || '',
  );

  const [onlyMySubmissions, setOnlyMySubmissions] = useState(() => {
    const param = searchParams?.get('onlyMySubmissions');
    return param === 'true';
  });

  const [onlyMyPendingApprovals, setOnlyMyPendingApprovals] = useState(() => {
    const param = searchParams?.get('myPendingApprovals');
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

  const handleOnlyMyPendingApprovalsChange = (checked: boolean) => {
    setOnlyMyPendingApprovals(checked);
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (checked) {
      params.set('myPendingApprovals', 'true');
    } else {
      params.delete('myPendingApprovals');
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
    setMonthFilter('');
    setYearFilter('');
    setStatusFilter('');
    setManagerFilter('');
    setOnlyMySubmissions(false);
    setOnlyMyPendingApprovals(false);
    if (searchParams?.toString()) {
      setIsPendingSearch(true);
      router.push(pathname || '');
    }
  };

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (monthFilter) params.set('month', monthFilter);
    if (yearFilter) params.set('year', yearFilter);
    if (statusFilter) params.set('status', statusFilter);
    if (managerFilter) params.set('manager', managerFilter);
    if (onlyMySubmissions) params.set('onlyMySubmissions', 'true');
    if (onlyMyPendingApprovals) params.set('myPendingApprovals', 'true');
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

  // Check if user is a manager or leader
  const isManagerOrLeader = userRoles.some(
    (role) =>
      role.toLowerCase().includes('manager') ||
      role.toLowerCase().includes('leader'),
  );

  return (
    <Card>
      <CardHeader className='p-4'>
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
          {isManagerOrLeader && (
            <div className='flex items-center space-x-2'>
              <Switch
                id='only-my-pending-approvals'
                checked={onlyMyPendingApprovals}
                onCheckedChange={handleOnlyMyPendingApprovalsChange}
              />
              <Label
                htmlFor='only-my-pending-approvals'
                className={`${
                  pendingApprovalsCount > 0
                    ? 'animate-pulse text-red-600 dark:text-red-400'
                    : ''
                }`}
              >
                {dict.filters.pendingApprovals}
                {pendingApprovalsCount > 0 && ` (${pendingApprovalsCount})`}
              </Label>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className='p-4 pt-0'>
        <form onSubmit={handleSearchClick} className='flex flex-col gap-4'>
            {/* Row 1: Status and Year */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='flex flex-col space-y-1'>
                <Label>{dict.filters.status}</Label>
                <ClearableSelect
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  placeholder={dict.filters.select}
                  clearLabel={dict.filters.clearFilter}
                  className='w-full'
                  options={[
                    { value: 'pending', label: dict.status.pending },
                    { value: 'approved', label: dict.status.approved },
                    { value: 'rejected', label: dict.status.rejected },
                    { value: 'accounted', label: dict.status.accounted },
                  ]}
                />
              </div>
              <div className='flex flex-col space-y-1'>
                <Label>{dict.filters.year}</Label>
                <ClearableCombobox
                  value={yearFilter}
                  onValueChange={setYearFilter}
                  placeholder={dict.filters.select}
                  searchPlaceholder={dict.filters.searchPlaceholder}
                  notFoundText={dict.filters.notFound}
                  clearLabel={dict.filters.clearFilter}
                  className='w-full'
                  options={yearOptions}
                  open={openYear}
                  onOpenChange={setOpenYear}
                />
              </div>
            </div>

            {/* Row 2: Month and Manager */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='flex flex-col space-y-1'>
                <Label>{dict.filters.month}</Label>
                <ClearableCombobox
                  value={monthFilter}
                  onValueChange={setMonthFilter}
                  placeholder={dict.filters.select}
                  searchPlaceholder={dict.filters.searchPlaceholder}
                  notFoundText={dict.filters.notFound}
                  clearLabel={dict.filters.clearFilter}
                  className='w-full'
                  options={monthOptions}
                  open={openMonth}
                  onOpenChange={setOpenMonth}
                />
              </div>
              {userRoles.includes('admin') || userRoles.includes('hr') ? (
                <div className='flex flex-col space-y-1'>
                  <Label>{dict.filters.manager}</Label>
                  <ClearableCombobox
                    value={managerFilter}
                    onValueChange={setManagerFilter}
                    placeholder={dict.filters.select}
                    searchPlaceholder={dict.filters.searchPlaceholder}
                    notFoundText={dict.filters.notFound}
                    clearLabel={dict.filters.clearFilter}
                    className='w-full'
                    options={managerOptions.map((mgr) => ({
                      value: mgr.email,
                      label: mgr.name,
                    }))}
                    open={openManager}
                    onOpenChange={setOpenManager}
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
                disabled={isPendingSearch}
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
