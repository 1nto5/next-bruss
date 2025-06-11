'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { CircleX, Loader, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { revalidateProductionOvertime as revalidate } from '../actions';

export default function TableFilteringAndOptions({
  fetchTime,
  isGroupLeader,
  isLogged,
  userEmail,
}: {
  fetchTime: Date;
  isGroupLeader: boolean;
  isLogged: boolean;
  userEmail?: string;
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

  const [showOnlyMine, setShowOnlyMine] = useState(() => {
    const requestedBy = searchParams?.get('requestedBy');
    return requestedBy === userEmail;
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
    setShowOnlyMine(false);
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
      if (showOnlyMine) params.set('requestedBy', 'true');
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

  const handleShowOnlyMineChange = (checked: boolean) => {
    setShowOnlyMine(checked);
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (checked) {
      params.set('requestedBy', userEmail || '');
    } else {
      params.delete('requestedBy');
    }
    setIsPendingSearch(true);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Card>
      <CardHeader className='p-4'>
        <form onSubmit={handleSearchClick} className='flex flex-col gap-2'>
          <div className='flex items-center space-x-2'>
            <Switch
              id='show-filters'
              checked={showFilters}
              onCheckedChange={setShowFilters}
            />
            <Label htmlFor='show-filters'>Pokaż filtry</Label>
            {isLogged && (
              <>
                <Switch
                  id='only-my-requests'
                  checked={showOnlyMine}
                  onCheckedChange={handleShowOnlyMineChange}
                />
                <Label htmlFor='only-my-requests'>Tylko moje zlecenia</Label>
              </>
            )}
          </div>
        </form>
      </CardHeader>
      {showFilters && (
        <CardContent className='p-4 pt-0'>
          <form onSubmit={handleSearchClick} className='flex flex-col gap-4'>
            {/* Row 1: Status and dates */}
            <div className='flex flex-wrap items-end gap-4'>
              <div className='flex flex-col space-y-1'>
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
              <div className='flex flex-col space-y-1'>
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
              <div className='flex flex-col space-y-1'>
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

              {isGroupLeader && (
                <Link href='/production-overtime/new-request'>
                  <Button variant={'outline'}>
                    <Plus className='mr-1' size={16} />{' '}
                    <span>Nowe zlecenie</span>
                  </Button>
                </Link>
              )}
            </div>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
