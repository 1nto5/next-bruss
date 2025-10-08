'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DateTimeInput } from '@/components/ui/datetime-input';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { CircleX, FileSpreadsheet, Loader, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { revalidateOvenTableData as revalidate } from '../actions';
import PasteValuesDialog from './paste-values-dialog';
import type { Dictionary } from '../lib/dict';

export default function OvenTableFilteringAndOptions({
  ovens,
  fetchTime,
  dict,
}: {
  ovens: string[];
  fetchTime: Date;
  dict: Dictionary;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPendingSearch, setIsPendingSearch] = useState(false);

  useEffect(() => {
    setIsPendingSearch(false);
  }, [fetchTime]);

  // Helper functions for default dates
  const getOneMonthAgo = () => {
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    oneMonthAgo.setHours(0, 0, 0, 0); // Start of day
    return oneMonthAgo;
  };

  const getToday = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of day
    return today;
  };

  const [statusFilter, setStatusFilter] = useState<string[]>(() => {
    const statusParam = searchParams?.get('status');
    return statusParam
      ? statusParam
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : [];
  });
  const [fromFilter, setFromFilter] = useState<Date>(() => {
    const fromParam = searchParams?.get('from');
    return fromParam ? new Date(fromParam) : getOneMonthAgo();
  });
  const [toFilter, setToFilter] = useState<Date>(() => {
    const toParam = searchParams?.get('to');
    return toParam ? new Date(toParam) : getToday();
  });
  const [hydraBatchFilter, setHydraBatchFilter] = useState(
    searchParams?.get('hydra_batch') || '',
  );
  const [articleFilter, setArticleFilter] = useState(
    searchParams?.get('article') || '',
  );
  const [ovenFilter, setOvenFilter] = useState<string[]>(() => {
    const ovenParam = searchParams?.get('oven');
    return ovenParam
      ? ovenParam
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : [];
  });

  // Helper function to count values
  const getValueCount = (value: string) => {
    if (!value.trim()) return 0;
    return value
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0).length;
  };

  const handleClearFilters = () => {
    setStatusFilter([]);
    setFromFilter(getOneMonthAgo());
    setToFilter(getToday());
    setHydraBatchFilter('');
    setArticleFilter('');
    setOvenFilter([]);

    if (searchParams?.toString()) {
      setIsPendingSearch(true);
      router.push(pathname || '');
    }
  };

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (statusFilter.length > 0) params.set('status', statusFilter.join(','));
    if (fromFilter) params.set('from', fromFilter.toISOString());
    if (toFilter) params.set('to', toFilter.toISOString());
    if (hydraBatchFilter) params.set('hydra_batch', hydraBatchFilter);
    if (articleFilter) params.set('article', articleFilter);
    if (ovenFilter.length > 0) params.set('oven', ovenFilter.join(','));
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
    { value: 'prepared', label: dict.processStatus.prepared },
    { value: 'running', label: dict.processStatus.running },
    { value: 'finished', label: dict.processStatus.completed },
    { value: 'deleted', label: dict.processStatus.failed },
  ];

  const ovenOptions = ovens.map((oven) => ({
    value: oven,
    label: oven.toUpperCase(),
  }));

  return (
    <Card>
      <CardContent className='p-4'>
        <form onSubmit={handleSearchClick} className='flex flex-col gap-4'>
          {/* Row 1: Date filters - Full width */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='flex flex-col space-y-1'>
              <Label>{dict.timeFilters.from}</Label>
              <DateTimePicker
                value={fromFilter}
                onChange={(date) => setFromFilter(date || getOneMonthAgo())}
                max={toFilter}
                renderTrigger={({ value, setOpen, open }) => (
                  <DateTimeInput
                    value={value}
                    onChange={(x) =>
                      !open && setFromFilter(x || getOneMonthAgo())
                    }
                    format='dd/MM/yyyy HH:mm'
                    disabled={open}
                    onCalendarClick={() => setOpen(!open)}
                    className='w-full'
                  />
                )}
              />
            </div>
            <div className='flex flex-col space-y-1'>
              <Label>{dict.timeFilters.to}</Label>
              <DateTimePicker
                value={toFilter}
                onChange={(date) => setToFilter(date || getToday())}
                max={new Date()}
                min={fromFilter}
                renderTrigger={({ value, setOpen, open }) => (
                  <DateTimeInput
                    value={value}
                    onChange={(x) => !open && setToFilter(x || getToday())}
                    format='dd/MM/yyyy HH:mm'
                    disabled={open}
                    onCalendarClick={() => setOpen(!open)}
                    className='w-full'
                  />
                )}
              />
            </div>
          </div>

          {/* Row 2: Oven and Status - Full width */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='flex flex-col space-y-1'>
              <Label>{dict.processFilters.oven}</Label>
              <MultiSelect
                options={ovenOptions}
                value={ovenFilter}
                onValueChange={setOvenFilter}
                placeholder={dict.processFilters.select}
                searchPlaceholder={dict.processFilters.searchPlaceholder}
                emptyText={dict.processFilters.notFound}
                className='w-full'
              />
            </div>

            <div className='flex flex-col space-y-1'>
              <Label>{dict.processFilters.status}</Label>
              <MultiSelect
                options={statusOptions}
                value={statusFilter}
                onValueChange={setStatusFilter}
                placeholder={dict.processFilters.select}
                searchPlaceholder={dict.processFilters.searchPlaceholder}
                emptyText={dict.processFilters.notFound}
                className='w-full'
              />
            </div>
          </div>

          {/* Row 3: HYDRA Batch and Article - Full width */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='flex flex-col space-y-1'>
              <Label>{dict.processFilters.hydraBatch}</Label>
              <PasteValuesDialog
                fieldType='hydra_batch'
                fieldLabel={dict.processFilters.hydraBatch}
                currentValue={hydraBatchFilter}
                currentCount={getValueCount(hydraBatchFilter)}
                onApplyValues={setHydraBatchFilter}
                dict={dict}
              >
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  title={dict.processFilters.clickToPaste}
                >
                  {hydraBatchFilter ? (
                    <span className='text-left'>
                      {dict.processFilters.hydraBatch} ({getValueCount(hydraBatchFilter)} value
                      {getValueCount(hydraBatchFilter) !== 1 ? 's' : ''})
                    </span>
                  ) : (
                    <span className='text-muted-foreground'>
                      {dict.processFilters.clickToAdd}
                    </span>
                  )}
                </Button>
              </PasteValuesDialog>
            </div>

            <div className='flex flex-col space-y-1'>
              <Label>{dict.processFilters.article}</Label>
              <PasteValuesDialog
                fieldType='article'
                fieldLabel={dict.processFilters.article}
                currentValue={articleFilter}
                currentCount={getValueCount(articleFilter)}
                onApplyValues={setArticleFilter}
                dict={dict}
              >
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  title={dict.processFilters.clickToPaste}
                >
                  {articleFilter ? (
                    <span className='text-left'>
                      {dict.processFilters.article} ({getValueCount(articleFilter)} value
                      {getValueCount(articleFilter) !== 1 ? 's' : ''})
                    </span>
                  ) : (
                    <span className='text-muted-foreground'>
                      {dict.processFilters.clickToAdd}
                    </span>
                  )}
                </Button>
              </PasteValuesDialog>
            </div>
          </div>

          {/* Row 4: Action buttons - Clear, Export to Excel, Search */}
          <div className='flex flex-col gap-2 sm:grid sm:grid-cols-4 sm:gap-4'>
            <Button
              type='button'
              variant='destructive'
              onClick={handleClearFilters}
              title={dict.processFilters.clear}
              disabled={isPendingSearch}
              className='order-3 w-full sm:order-1'
            >
              <CircleX /> <span>{dict.processFilters.clear}</span>
            </Button>

            <Link
              href={`/api/oven-data/excel?${new URLSearchParams(
                Object.entries({
                  status: Array.isArray(statusFilter)
                    ? statusFilter.join(',')
                    : statusFilter,
                  from: fromFilter?.toISOString(),
                  to: toFilter?.toISOString(),
                  hydra_batch: hydraBatchFilter,
                  article: articleFilter,
                  oven: Array.isArray(ovenFilter)
                    ? ovenFilter.join(',')
                    : ovenFilter,
                }).reduce(
                  (acc, [key, value]) => {
                    if (value) acc[key] = value;
                    return acc;
                  },
                  {} as Record<string, string>,
                ),
              ).toString()}`}
              className='order-2 w-full sm:order-2'
            >
              <Button className='w-full'>
                <FileSpreadsheet />
                <span>{dict.processFilters.export}</span>
              </Button>
            </Link>

            <Button
              type='submit'
              variant='secondary'
              disabled={isPendingSearch}
              className='order-1 w-full sm:order-3 sm:col-span-2'
            >
              {isPendingSearch ? (
                <Loader className='animate-spin' />
              ) : (
                <Search />
              )}
              <span>{dict.processFilters.search}</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
