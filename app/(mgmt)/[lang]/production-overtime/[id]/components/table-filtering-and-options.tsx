'use client';

import { Button } from '@/components/ui/button';
import { DateTimeInput } from '@/components/ui/datetime-input';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CircleX, Loader, Plus, RefreshCw, Search, Sheet } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { revalidateProductionOvertime as revalidate } from '../../actions';

export default function TableFilteringAndOptions({
  fetchTime,
  isGroupLeader,
}: {
  fetchTime: Date;
  isGroupLeader: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPendingSearch, setIsPendingSearch] = useState(false);

  useEffect(() => {
    setIsPendingSearch(false);
  }, [fetchTime]);

  const [showFilters, setShowFilters] = useState(() => {
    return !!(
      searchParams?.get('date') ||
      searchParams?.get('requestedAtFilter') ||
      searchParams?.get('status')
    );
  });

  const [dateFilter, setDateFilter] = useState(() => {
    const dateParam = searchParams?.get('date');
    return dateParam ? new Date(dateParam) : undefined;
  });
  const [requestedAtFilter, setRequestedAtFilter] = useState(() => {
    const requestedAtFilterParam = searchParams?.get('requestedAtFilter');
    return requestedAtFilterParam
      ? new Date(requestedAtFilterParam)
      : undefined;
  });
  const [statusFilter, setStatusFilter] = useState(
    searchParams?.get('status') || '',
  );

  const handleClearFilters = () => {
    setDateFilter(undefined);
    setRequestedAtFilter(undefined);
    setStatusFilter('');
    if (searchParams?.toString()) {
      setIsPendingSearch(true);
      router.push(pathname || '');
    }
  };

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (showFilters) {
      const params = new URLSearchParams();
      if (dateFilter) params.set('date', dateFilter.toISOString());
      if (requestedAtFilter)
        params.set('requestedAt', requestedAtFilter.toISOString());
      if (statusFilter) params.set('status', statusFilter);
      const newUrl = `${pathname}?${params.toString()}`;
      if (newUrl !== `${pathname}?${searchParams?.toString()}`) {
        setIsPendingSearch(true);
        router.push(newUrl);
      } else {
        setIsPendingSearch(true);
        revalidate();
      }
    } else {
      setIsPendingSearch(true);
      revalidate();
    }
  };

  return (
    <form onSubmit={handleSearchClick} className='flex flex-col gap-2'>
      <div className='flex items-center space-x-2'>
        <Switch
          id='show-filters'
          checked={showFilters}
          onCheckedChange={setShowFilters}
        />
        <Label htmlFor='show-filters'>Pokaż filtry</Label>
      </div>

      {showFilters && (
        <>
          <div className='flex flex-wrap gap-2'>
            <div className='flex items-center space-x-2'>
              <Label>Status</Label>
              <Select onValueChange={setStatusFilter} value={statusFilter}>
                <SelectTrigger className='w-[150px]'>
                  <SelectValue placeholder='wybierz' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='pending'>Oczekuje</SelectItem>
                  <SelectItem value='approved'>Zatwierdzony</SelectItem>
                  <SelectItem value='rejected'>Odrzucony</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex items-center space-x-2'>
              <Label>Termin</Label>
              <DateTimePicker
                value={dateFilter}
                onChange={setDateFilter}
                hideTime
                renderTrigger={({ value, setOpen, open }) => (
                  <DateTimeInput
                    value={value}
                    onChange={(x) => !open && setDateFilter(x)}
                    format='dd/MM/yyyy'
                    disabled={open}
                    onCalendarClick={() => setOpen(!open)}
                  />
                )}
              />
            </div>
            <div className='flex items-center space-x-2'>
              <Label>Zlecono dn</Label>
              <DateTimePicker
                value={requestedAtFilter}
                onChange={setRequestedAtFilter}
                hideTime
                renderTrigger={({ value, setOpen, open }) => (
                  <DateTimeInput
                    value={value}
                    onChange={(x) => !open && setRequestedAtFilter(x)}
                    format='dd/MM/yyyy'
                    disabled={open}
                    onCalendarClick={() => setOpen(!open)}
                  />
                )}
              />
            </div>
          </div>
        </>
      )}

      <div className='flex flex-wrap gap-2'>
        <Button
          type='submit'
          variant='secondary'
          className='justify-start'
          disabled={isPendingSearch}
        >
          {isPendingSearch ? (
            <>
              <Loader className={'animate-spin'} />{' '}
              <span>{showFilters ? 'Szukaj' : 'Odśwież'}</span>
            </>
          ) : (
            <>
              {showFilters ? <Search /> : <RefreshCw />}{' '}
              <span>{showFilters ? 'Szukaj' : 'Odśwież'}</span>
            </>
          )}
        </Button>

        {showFilters && (
          <>
            <Button
              variant='destructive'
              onClick={handleClearFilters}
              title='Clear filters'
            >
              <CircleX /> <span>Wyczyść</span>
            </Button>

            {/* FIXME: excel export api */}
            <Link
              href={`/api/failures/lv/excel?${new URLSearchParams(
                Object.entries({
                  date: dateFilter?.toISOString(),
                  requestedAt: requestedAtFilter?.toISOString(),
                }).reduce(
                  (acc, [key, value]) => {
                    if (value) acc[key] = value;
                    return acc;
                  },
                  {} as Record<string, string>,
                ),
              ).toString()}`}
            >
              <Button>
                <Sheet /> <span>Export do Excel</span>
              </Button>
            </Link>
          </>
        )}
        {isGroupLeader && (
          <Link href='/production-overtime/new-request'>
            <Button variant={'outline'}>
              <Plus /> <span>Nowe zlecenie</span>
            </Button>
          </Link>
        )}
      </div>
    </form>
  );
}
