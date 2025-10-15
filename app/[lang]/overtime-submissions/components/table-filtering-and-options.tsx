'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils/cn';
import { UsersListType } from '@/lib/types/user';
import { Check, ChevronsUpDown, CircleX, Loader, Search } from 'lucide-react';
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

  const [onlyMyPendingApprovals, setOnlyMyPendingApprovals] = useState(() => {
    const param = searchParams?.get('myPendingApprovals');
    return param === 'true';
  });

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

  // Determine if any filter is active
  const anyFilterActive = Boolean(
    monthFilter ||
      yearFilter ||
      statusFilter ||
      managerFilter ||
      onlyMyPendingApprovals,
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
            {(userRoles.some((role) =>
              role.toLowerCase().includes('manager'),
            ) ||
              userRoles.some((role) =>
                role.toLowerCase().includes('leader'),
              )) && (
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
        </form>
      </CardHeader>
      {showFilters && (
        <CardContent className='p-4 pt-0'>
          <form onSubmit={handleSearchClick} className='flex flex-col gap-2'>
            <div className='flex flex-wrap items-start gap-2'>
              <div className='flex flex-col space-y-1'>
                <Label>{dict.filters.status}</Label>
                <Select onValueChange={setStatusFilter} value={statusFilter}>
                  <SelectTrigger className='w-[150px]'>
                    <SelectValue placeholder={dict.filters.select} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='pending'>{dict.status.pending}</SelectItem>
                    <SelectItem value='approved'>{dict.status.approved}</SelectItem>
                    <SelectItem value='rejected'>{dict.status.rejected}</SelectItem>
                    <SelectItem value='accounted'>{dict.status.accounted}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='flex flex-col space-y-1'>
                <Label>{dict.filters.year}</Label>
                <Popover open={openYear} onOpenChange={setOpenYear}>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      role='combobox'
                      className={cn(
                        'w-[150px] justify-between',
                        !yearFilter && 'opacity-50',
                      )}
                    >
                      {yearFilter
                        ? yearOptions.find((year) => year.value === yearFilter)
                            ?.label
                        : dict.filters.select}
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className='w-[150px] p-0'
                    side='bottom'
                    align='start'
                  >
                    <Command>
                      <CommandInput placeholder={dict.filters.searchPlaceholder} />
                      <CommandList>
                        <CommandEmpty>{dict.filters.notFound}</CommandEmpty>
                        <CommandGroup>
                          {yearOptions.map((year) => (
                            <CommandItem
                              key={year.value}
                              value={year.value}
                              onSelect={(currentValue) => {
                                setYearFilter(currentValue);
                                setOpenYear(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  yearFilter === year.value
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                              {year.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className='flex flex-col space-y-1'>
                <Label>{dict.filters.month}</Label>
                <Popover open={openMonth} onOpenChange={setOpenMonth}>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      role='combobox'
                      className={cn(
                        'w-[150px] justify-between',
                        !monthFilter && 'opacity-50',
                      )}
                    >
                      {monthFilter
                        ? monthOptions.find(
                            (month) => month.value === monthFilter,
                          )?.label
                        : dict.filters.select}
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className='w-[150px] p-0'
                    side='bottom'
                    align='start'
                  >
                    <Command>
                      <CommandInput placeholder={dict.filters.searchPlaceholder} />
                      <CommandList>
                        <CommandEmpty>{dict.filters.notFound}</CommandEmpty>
                        <CommandGroup>
                          {monthOptions.map((month) => (
                            <CommandItem
                              key={month.value}
                              value={month.value}
                              onSelect={(currentValue) => {
                                setMonthFilter(currentValue);
                                setOpenMonth(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  monthFilter === month.value
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                              {month.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              {userRoles.includes('admin') || userRoles.includes('hr') ? (
                <div className='flex flex-col space-y-1'>
                  <Label>{dict.filters.manager}</Label>
                  <Popover open={openManager} onOpenChange={setOpenManager}>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        role='combobox'
                        className={cn(
                          'min-w-[150px] justify-between',
                          !managerFilter && 'opacity-50',
                        )}
                      >
                        {managerFilter
                          ? managerOptions.find(
                              (mgr) => mgr.email === managerFilter,
                            )?.name
                          : dict.filters.select}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className='min-w-[250px] p-0'
                      side='bottom'
                      align='start'
                    >
                      <Command>
                        <CommandInput placeholder={dict.filters.searchPlaceholder} />
                        <CommandList>
                          <CommandEmpty>{dict.filters.notFound}</CommandEmpty>
                          <CommandGroup>
                            {managerOptions.map((mgr) => (
                              <CommandItem
                                key={mgr.email}
                                value={mgr.email}
                                onSelect={(currentValue) => {
                                  setManagerFilter(currentValue);
                                  setOpenManager(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    managerFilter === mgr.email
                                      ? 'opacity-100'
                                      : 'opacity-0',
                                  )}
                                />
                                {mgr.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              ) : null}
            </div>

            {/* Row 2: Action buttons */}
            <div className='flex flex-wrap gap-2'>
              <Button
                type='submit'
                variant='secondary'
                className='justify-start'
                disabled={isPendingSearch}
              >
                {isPendingSearch ? (
                  <>
                    <Loader className='mr-1 animate-spin' size={16} />{' '}
                    <span>{dict.filters.search}</span>
                  </>
                ) : (
                  <>
                    <Search className='mr-1' size={16} /> <span>{dict.filters.search}</span>
                  </>
                )}
              </Button>

              <Button
                type='button'
                variant='destructive'
                onClick={handleClearFilters}
                title='Clear filters'
                disabled={isPendingSearch}
              >
                <CircleX className='mr-1' size={16} /> <span>{dict.filters.clear}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
