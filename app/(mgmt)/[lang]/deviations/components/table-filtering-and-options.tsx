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
import { CircleX, Loader, Plus, RefreshCw, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { redirectToDeviations as revalidate } from '../actions';

export default function TableFilteringAndOptions({
  fetchTime,
  isLogged,
  userEmail,
}: {
  fetchTime: Date;
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
      searchParams?.get('createdAt') ||
      searchParams?.get('status')
    );
  });

  const [showOnlyMine, setShowOnlyMine] = useState(() => {
    const owner = searchParams?.get('owner');
    return owner === userEmail;
  });

  const [dateFilter, setDateFilter] = useState(() => {
    const dateParam = searchParams?.get('date');
    return dateParam ? new Date(dateParam) : undefined;
  });
  const [createdAtFilter, setRequestedAtFilter] = useState(() => {
    const createdAtParam = searchParams?.get('createdAt');
    return createdAtParam ? new Date(createdAtParam) : undefined;
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
      if (createdAtFilter)
        params.set('createdAt', createdAtFilter.toISOString());
      if (statusFilter) params.set('status', statusFilter);
      if (showOnlyMine) params.set('owner', userEmail || '');
      const newUrl = `${pathname}?${params.toString()}`;
      if (newUrl !== `${pathname}?${searchParams?.toString()}`) {
        setIsPendingSearch(true);
        router.push(newUrl);
      } else {
        setIsPendingSearch(true);
        revalidate();
      }
    } else {
      // Zachowaj parametr owner podczas odświeżania
      const params = new URLSearchParams();
      if (showOnlyMine) params.set('owner', userEmail || '');
      setIsPendingSearch(true);
      if (params.toString()) {
        router.push(`${pathname}?${params.toString()}`);
      } else {
        revalidate();
      }
    }
  };
  const handleShowOnlyMineChange = (checked: boolean) => {
    setShowOnlyMine(checked);
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (checked) {
      params.set('owner', userEmail || '');
    } else {
      params.delete('owner');
    }
    setIsPendingSearch(true);
    router.push(`${pathname}?${params.toString()}`);
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
        {isLogged && (
          <>
            <Switch
              id='only-my-requests'
              checked={showOnlyMine}
              onCheckedChange={handleShowOnlyMineChange}
            />
            <Label htmlFor='only-my-requests'>Tylko moje odchylenia</Label>
          </>
        )}
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
                  <SelectItem value='in approval'>Oczekujące</SelectItem>
                  <SelectItem value='in progress'>Obowiązuje</SelectItem>
                  <SelectItem value='rejected'>Odrzucone</SelectItem>
                  <SelectItem value='draft'>Szkic</SelectItem>
                  <SelectItem value='closed'>Zamknięte</SelectItem>
                  <SelectItem value='approved'>Zatwierdzone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex items-center space-x-2'>
              <Label>Termin odchylenia</Label>
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
              <Label>Data utworzenia</Label>
              <DateTimePicker
                value={createdAtFilter}
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
          </>
        )}

        <Link href='/deviations/add'>
          <Button variant={'outline'}>
            <Plus /> <span>Nowe odchylenie</span>
          </Button>
        </Link>
      </div>
    </form>
  );
}
