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
import { DateTimeInput } from '@/components/ui/datetime-input';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/cn';
import { Check, ChevronsUpDown, CircleX, Loader, Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { revalidateOvenTableData as revalidate } from '../actions';

export default function OvenTableFilteringAndOptions({
  ovens,
  fetchTime,
}: {
  ovens: string[];
  fetchTime: Date;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPendingSearch, setIsPendingSearch] = useState(false);

  // Determine if any filter is active in the URL
  const hasAnyFilter =
    !!searchParams?.get('status') ||
    !!searchParams?.get('from') ||
    !!searchParams?.get('to') ||
    !!searchParams?.get('hydra_batch') ||
    !!searchParams?.get('article') ||
    !!searchParams?.get('oven');

  // Initialize showFilters to true if any filter is present
  const [showFilters, setShowFilters] = useState(hasAnyFilter);

  useEffect(() => {
    setIsPendingSearch(false);
  }, [fetchTime]);

  const [statusFilter, setStatusFilter] = useState(
    searchParams?.get('status') || '',
  );
  const [fromFilter, setFromFilter] = useState(() => {
    const fromParam = searchParams?.get('from');
    return fromParam ? new Date(fromParam) : undefined;
  });
  const [toFilter, setToFilter] = useState(() => {
    const toParam = searchParams?.get('to');
    return toParam ? new Date(toParam) : undefined;
  });
  const [hydraBatchFilter, setHydraBatchFilter] = useState(
    searchParams?.get('hydra_batch') || '',
  );
  const [articleFilter, setArticleFilter] = useState(
    searchParams?.get('article') || '',
  );
  const [ovenFilter, setOvenFilter] = useState(searchParams?.get('oven') || '');

  const [openStatus, setOpenStatus] = useState(false);
  const [openOven, setOpenOven] = useState(false);

  const handleClearFilters = () => {
    setStatusFilter('');
    setFromFilter(undefined);
    setToFilter(undefined);
    setHydraBatchFilter('');
    setArticleFilter('');
    setOvenFilter('');

    if (searchParams?.toString()) {
      setIsPendingSearch(true);
      router.push(pathname || '');
    }
  };

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (fromFilter) params.set('from', fromFilter.toISOString());
    if (toFilter) params.set('to', toFilter.toISOString());
    if (hydraBatchFilter) params.set('hydra_batch', hydraBatchFilter);
    if (articleFilter) params.set('article', articleFilter);
    if (ovenFilter) params.set('oven', ovenFilter);
    const newUrl = `${pathname}?${params.toString()}`;
    if (newUrl !== `${pathname}?${searchParams?.toString()}`) {
      setIsPendingSearch(true);
      router.push(newUrl);
    } else {
      setIsPendingSearch(true);
      revalidate();
    }
  };

  const statusOptions = [
    { value: 'running', label: 'Running' },
    { value: 'finished', label: 'Finished' },
  ];

  const ovenOptions = ovens.map((oven) => ({
    value: oven,
    label: oven.toUpperCase(),
  }));

  return (
    <Card>
      <CardHeader className=''>
        <form onSubmit={handleSearchClick} className='flex flex-col gap-2'>
          <div className='flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2'>
            <div className='flex items-center space-x-2'>
              <Switch
                id='show-filters'
                checked={showFilters}
                onCheckedChange={setShowFilters}
              />
              <Label htmlFor='show-filters'>Show filters</Label>
            </div>
          </div>
        </form>
      </CardHeader>
      {showFilters && (
        <CardContent className=''>
          <form onSubmit={handleSearchClick} className='flex flex-col gap-2'>
            <div className='flex flex-wrap items-start gap-2'>
              {/* Status */}
              <div className='flex flex-col space-y-1'>
                <Label>Status</Label>
                <Popover open={openStatus} onOpenChange={setOpenStatus}>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      role='combobox'
                      className={cn(
                        'w-[150px] justify-between',
                        !statusFilter && 'opacity-50',
                      )}
                    >
                      {statusFilter
                        ? statusOptions.find(
                            (status) => status.value === statusFilter,
                          )?.label
                        : 'choose'}
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className='w-[150px] p-0'
                    side='bottom'
                    align='start'
                  >
                    <Command>
                      <CommandInput placeholder='search...' />
                      <CommandList>
                        <CommandEmpty>not found</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            key='reset'
                            onSelect={() => {
                              setStatusFilter('');
                              setOpenStatus(false);
                            }}
                          >
                            <Check className='mr-2 h-4 w-4 opacity-0' />
                            not set
                          </CommandItem>
                          {statusOptions.map((status) => (
                            <CommandItem
                              key={status.value}
                              value={status.value}
                              onSelect={(currentValue) => {
                                setStatusFilter(currentValue);
                                setOpenStatus(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  statusFilter === status.value
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                              {status.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              {/* From */}
              <div className='flex flex-col space-y-1'>
                <Label>From</Label>
                <DateTimePicker
                  value={fromFilter}
                  onChange={setFromFilter}
                  max={toFilter || new Date()}
                  renderTrigger={({ value, setOpen, open }) => (
                    <DateTimeInput
                      value={value}
                      onChange={(x) => !open && setFromFilter(x)}
                      format='dd/MM/yyyy HH:mm'
                      disabled={open}
                      onCalendarClick={() => setOpen(!open)}
                    />
                  )}
                />
              </div>
              {/* To */}
              <div className='flex flex-col space-y-1'>
                <Label>To</Label>
                <DateTimePicker
                  value={toFilter}
                  onChange={setToFilter}
                  max={new Date()}
                  min={fromFilter}
                  renderTrigger={({ value, setOpen, open }) => (
                    <DateTimeInput
                      value={value}
                      onChange={(x) => !open && setToFilter(x)}
                      format='dd/MM/yyyy HH:mm'
                      disabled={open}
                      onCalendarClick={() => setOpen(!open)}
                    />
                  )}
                />
              </div>
              {/* Oven */}
              <div className='flex flex-col space-y-1'>
                <Label>Oven</Label>
                <Popover open={openOven} onOpenChange={setOpenOven}>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      role='combobox'
                      className={cn(
                        'w-[150px] justify-between',
                        !ovenFilter && 'opacity-50',
                      )}
                    >
                      {ovenFilter
                        ? ovenOptions.find((oven) => oven.value === ovenFilter)
                            ?.label
                        : 'choose'}
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className='w-[150px] p-0'
                    side='bottom'
                    align='start'
                  >
                    <Command>
                      <CommandInput placeholder='search...' />
                      <CommandList>
                        <CommandEmpty>not found</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            key='reset'
                            onSelect={() => {
                              setOvenFilter('');
                              setOpenOven(false);
                            }}
                          >
                            <Check className='mr-2 h-4 w-4 opacity-0' />
                            not set
                          </CommandItem>
                          {ovenOptions.map((oven) => (
                            <CommandItem
                              key={oven.value}
                              value={oven.value}
                              onSelect={(currentValue) => {
                                setOvenFilter(currentValue);
                                setOpenOven(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  ovenFilter === oven.value
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                              {oven.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              {/* HYDRA batch */}
              <div className='flex flex-col space-y-1'>
                <Label>HYDRA batch</Label>
                <Input
                  type='string'
                  placeholder='HYDRA batch'
                  className='w-auto'
                  value={hydraBatchFilter}
                  onChange={(e) => setHydraBatchFilter(e.target.value)}
                />
              </div>
              {/* Article */}
              <div className='flex flex-col space-y-1'>
                <Label>Article</Label>
                <Input
                  type='string'
                  placeholder='article'
                  className='w-auto'
                  value={articleFilter}
                  onChange={(e) => setArticleFilter(e.target.value)}
                />
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
                    <span>Search</span>
                  </>
                ) : (
                  <>
                    <Search className='mr-1' size={16} /> <span>Search</span>
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
                <CircleX className='mr-1' size={16} /> <span>Clear</span>
              </Button>
            </div>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
