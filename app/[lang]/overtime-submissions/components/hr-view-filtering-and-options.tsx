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
  const [openMonth, setOpenMonth] = useState(false);
  const [openYear, setOpenYear] = useState(false);
  const [openPerson, setOpenPerson] = useState(false);

  const [personFilter, setPersonFilter] = useState(() => {
    const personParam = searchParams?.get('person');
    return personParam || '';
  });

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
    setMonthFilter('');
    setYearFilter('');
    setStatusFilter('');
    setPersonFilter('');
    setOnlyPendingSettlements(false);
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
    if (personFilter) params.set('person', personFilter);
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

  // Determine if any filter is active
  const anyFilterActive = Boolean(
    monthFilter ||
      yearFilter ||
      statusFilter ||
      personFilter ||
      onlyPendingSettlements,
  );
  const [showFilters, setShowFilters] = useState(anyFilterActive);

  return (
    <Card>
      <CardHeader className='p-4'>
        <form onSubmit={handleSearchClick} className='flex flex-col gap-2'>
          <div className='flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2'>
            <div className='flex items-center space-x-2'>
              <Switch
                id='show-filters'
                checked={showFilters}
                onCheckedChange={setShowFilters}
              />
              <Label htmlFor='show-filters'>{dict.filters.showFilters}</Label>
            </div>
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
        </form>
      </CardHeader>
      {showFilters && (
        <CardContent className='p-4 pt-0'>
          <form onSubmit={handleSearchClick} className='flex flex-col gap-4'>
            {/* Row 1: Status and Employee */}
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
                <Label>{dict.filters.employee}</Label>
                <ClearableCombobox
                  value={personFilter}
                  onValueChange={setPersonFilter}
                  placeholder={dict.filters.select}
                  searchPlaceholder={dict.filters.searchPlaceholder}
                  notFoundText={dict.filters.notFound}
                  clearLabel={dict.filters.clearFilter}
                  className='w-full'
                  options={users.map((user) => ({
                    value: user.email,
                    label: user.name,
                  }))}
                  open={openPerson}
                  onOpenChange={setOpenPerson}
                />
              </div>
            </div>

            {/* Row 2: Year and Month */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
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
      )}
    </Card>
  );
}
