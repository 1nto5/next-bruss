'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { CircleX, Loader, Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { revalidateOvertime as revalidate } from '../actions';

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

  const [dateFilter, setDateFilter] = useState(() => {
    const dateParam = searchParams?.get('date');
    return dateParam ? new Date(dateParam) : undefined;
  });
  const [submittedAtFilter, setSubmittedAtFilter] = useState(() => {
    const submittedAtFilterParam = searchParams?.get('submittedAtFilter');
    return submittedAtFilterParam
      ? new Date(submittedAtFilterParam)
      : undefined;
  });
  const [statusFilter, setStatusFilter] = useState(
    searchParams?.get('status') || '',
  );

  const handleClearFilters = () => {
    setDateFilter(undefined);
    setSubmittedAtFilter(undefined);
    setStatusFilter('');
    if (searchParams?.toString()) {
      setIsPendingSearch(true);
      router.push(pathname || '');
    }
  };

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (dateFilter) params.set('date', dateFilter.toISOString());
    if (submittedAtFilter)
      params.set('submittedAt', submittedAtFilter.toISOString());
    if (statusFilter) params.set('status', statusFilter);
    const newUrl = `${pathname}?${params.toString()}`;
    if (newUrl !== `${pathname}?${searchParams?.toString()}`) {
      setIsPendingSearch(true);
      router.push(newUrl);
    } else {
      setIsPendingSearch(true);
      revalidate();
    }
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <form onSubmit={handleSearchClick} className='flex flex-col gap-4'>
          <div className='flex flex-wrap items-start gap-4'>
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
              <Label>Data pracy</Label>
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
              <Label>Data zgłoszenia</Label>
              <DateTimePicker
                value={submittedAtFilter}
                onChange={setSubmittedAtFilter}
                hideTime
                renderTrigger={({ value, setOpen, open }) => (
                  <DateTimeInput
                    value={value}
                    onChange={(x) => !open && setSubmittedAtFilter(x)}
                    format='dd/MM/yyyy'
                    disabled={open}
                    onCalendarClick={() => setOpen(!open)}
                  />
                )}
              />
            </div>
          </div>
          <div className='flex space-x-2'>
            <Button type='submit' size='sm' disabled={isPendingSearch}>
              {isPendingSearch ? (
                <Loader className='h-4 w-4 animate-spin' />
              ) : (
                <Search className='h-4 w-4' />
              )}
              <span>Szukaj</span>
            </Button>
            <Button
              type='button'
              variant='destructive'
              size='sm'
              onClick={handleClearFilters}
              disabled={isPendingSearch}
            >
              <CircleX className='h-4 w-4' />
              Wyczyść
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
