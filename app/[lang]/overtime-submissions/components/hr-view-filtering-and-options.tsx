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

export default function HrViewFilteringAndOptions({
  fetchTime,
  userRoles = [],
  users = [],
  pendingSettlementsCount = 0,
}: {
  fetchTime: Date;
  userRoles?: string[];
  users: UsersListType;
  pendingSettlementsCount?: number;
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
              <Label htmlFor='show-filters'>Pokaż filtry</Label>
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
                Do rozliczenia
                {pendingSettlementsCount > 0 && ` (${pendingSettlementsCount})`}
              </Label>
            </div>
          </div>
        </form>
      </CardHeader>
      {showFilters && (
        <CardContent className='p-4 pt-0'>
          <form onSubmit={handleSearchClick} className='flex flex-col gap-2'>
            <div className='flex flex-wrap items-start gap-2'>
              <div className='flex flex-col space-y-1'>
                <Label>Status</Label>
                <Select onValueChange={setStatusFilter} value={statusFilter}>
                  <SelectTrigger className='w-[150px]'>
                    <SelectValue placeholder='wybierz' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='pending'>Oczekuje</SelectItem>
                    <SelectItem value='approved'>Zatwierdzone</SelectItem>
                    <SelectItem value='rejected'>Odrzucone</SelectItem>
                    <SelectItem value='accounted'>Rozliczone</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='flex flex-col space-y-1'>
                <Label>Pracownik</Label>
                <Popover open={openPerson} onOpenChange={setOpenPerson}>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      role='combobox'
                      className={cn(
                        'min-w-[200px] justify-between',
                        !personFilter && 'opacity-50',
                      )}
                    >
                      {personFilter
                        ? users.find((user) => user.email === personFilter)
                            ?.name
                        : 'wybierz'}
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className='min-w-[300px] p-0'
                    side='bottom'
                    align='start'
                  >
                    <Command>
                      <CommandInput placeholder='szukaj...' />
                      <CommandList>
                        <CommandEmpty>nie znaleziono</CommandEmpty>
                        <CommandGroup>
                          {users.map((user) => (
                            <CommandItem
                              key={user.email}
                              value={user.email}
                              onSelect={(currentValue) => {
                                setPersonFilter(currentValue);
                                setOpenPerson(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  personFilter === user.email
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                              {user.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className='flex flex-col space-y-1'>
                <Label>Rok</Label>
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
                        : 'wybierz'}
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className='w-[150px] p-0'
                    side='bottom'
                    align='start'
                  >
                    <Command>
                      <CommandInput placeholder='szukaj...' />
                      <CommandList>
                        <CommandEmpty>nie znaleziono</CommandEmpty>
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
                <Label>Miesiąc</Label>
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
                        : 'wybierz'}
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className='w-[150px] p-0'
                    side='bottom'
                    align='start'
                  >
                    <Command>
                      <CommandInput placeholder='szukaj...' />
                      <CommandList>
                        <CommandEmpty>nie znaleziono</CommandEmpty>
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
                    <span>Szukaj</span>
                  </>
                ) : (
                  <>
                    <Search className='mr-1' size={16} /> <span>Szukaj</span>
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
                <CircleX className='mr-1' size={16} /> <span>Wyczyść</span>
              </Button>
            </div>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
