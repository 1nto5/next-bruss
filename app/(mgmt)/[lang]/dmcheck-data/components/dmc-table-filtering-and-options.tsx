'use client';

import { ArticleConfigType } from '@/app/(mgmt)/[lang]/dmcheck-data/lib/dmcheck-data-types';
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
import { revalidateDmcheckTableData as revalidate } from '../actions';
import PasteValuesDialog from './paste-values-dialog';

export default function DmcTableFilteringAndOptions({
  articles,
  fetchTime,
}: {
  articles: ArticleConfigType[];
  fetchTime: Date;
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
  const [dmcFilter, setDmcFilter] = useState(searchParams?.get('dmc') || '');
  const [hydraFilter, setHydraFilter] = useState(
    searchParams?.get('hydra_batch') || '',
  );
  const [palletFilter, setPalletFilter] = useState(
    searchParams?.get('pallet_batch') || '',
  );
  const [workplaceFilter, setWorkplaceFilter] = useState<string[]>(() => {
    const workplaceParam = searchParams?.get('workplace');
    return workplaceParam
      ? workplaceParam
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : [];
  });
  const [articleFilter, setArticleFilter] = useState<string[]>(() => {
    const articleParam = searchParams?.get('article');
    return articleParam
      ? articleParam
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
    setDmcFilter('');
    setHydraFilter('');
    setPalletFilter('');
    setWorkplaceFilter([]);
    setArticleFilter([]);

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
    if (dmcFilter) params.set('dmc', dmcFilter);
    if (hydraFilter) params.set('hydra_batch', hydraFilter);
    if (palletFilter) params.set('pallet_batch', palletFilter);
    if (workplaceFilter.length > 0)
      params.set('workplace', workplaceFilter.join(','));
    if (articleFilter.length > 0)
      params.set('article', articleFilter.join(','));
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
    { value: 'box', label: 'box - scanned' },
    { value: 'pallet', label: 'pallet - confirmed with hydra label' },
    { value: 'warehouse', label: 'warehouse - confirmed with pallet label' },
    { value: 'rework', label: 'rework - marked as rework' },
  ];

  const workplaceOptions = Array.from(
    new Set(articles.map((article) => article.workplace)),
  ).map((workplace) => ({
    value: workplace,
    label: workplace.toUpperCase(),
  }));

  const articleOptions = articles
    .filter(
      (article) =>
        workplaceFilter.length === 0 ||
        workplaceFilter.includes(article.workplace),
    )
    .reduce((acc: { value: string; label: string }[], current) => {
      const x = acc.find((item) => item.value === current.articleNumber);
      if (!x) {
        return acc.concat([
          {
            value: current.articleNumber,
            label: `${current.articleNumber} - ${current.articleName}`,
          },
        ]);
      } else {
        return acc;
      }
    }, [])
    .sort((a, b) => a.value.localeCompare(b.value));

  return (
    <Card>
      <CardContent className='p-4'>
        <form onSubmit={handleSearchClick} className='flex flex-col gap-4'>
          {/* Row 1: Date filters - Full width */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='flex flex-col space-y-1'>
              <Label>From:</Label>
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
              <Label>To:</Label>
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

          {/* Row 2: Workplace, Article, Status - Full width */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            <div className='flex flex-col space-y-1'>
              <Label>Workplace</Label>
              <MultiSelect
                options={workplaceOptions}
                value={workplaceFilter}
                onValueChange={setWorkplaceFilter}
                placeholder='Select...'
                searchPlaceholder='search...'
                emptyText='not found'
                className='w-full'
              />
            </div>

            <div className='flex flex-col space-y-1'>
              <Label>Article</Label>
              <MultiSelect
                options={articleOptions}
                value={articleFilter}
                onValueChange={setArticleFilter}
                placeholder='Select...'
                searchPlaceholder='search...'
                emptyText='not found'
                className='w-full'
              />
            </div>

            <div className='flex flex-col space-y-1'>
              <Label>Status</Label>
              <MultiSelect
                options={statusOptions}
                value={statusFilter}
                onValueChange={setStatusFilter}
                placeholder='Select...'
                searchPlaceholder='search...'
                emptyText='not found'
                className='w-full'
              />
            </div>
          </div>

          {/* Row 3: DMC, HYDRA Batch, Pallet Batch - Full width */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            <div className='flex flex-col space-y-1'>
              <Label>DMC</Label>
              <PasteValuesDialog
                fieldType='dmc'
                fieldLabel='DMC'
                currentValue={dmcFilter}
                currentCount={getValueCount(dmcFilter)}
                onApplyValues={setDmcFilter}
              >
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  title='Click to paste values from Excel or edit manually'
                >
                  {dmcFilter ? (
                    <span className='text-left'>
                      DMC ({getValueCount(dmcFilter)} value
                      {getValueCount(dmcFilter) !== 1 ? 's' : ''})
                    </span>
                  ) : (
                    <span className='text-muted-foreground'>
                      Click to add...
                    </span>
                  )}
                </Button>
              </PasteValuesDialog>
            </div>

            <div className='flex flex-col space-y-1'>
              <Label>HYDRA Batch</Label>
              <PasteValuesDialog
                fieldType='hydra_batch'
                fieldLabel='HYDRA Batch'
                currentValue={hydraFilter}
                currentCount={getValueCount(hydraFilter)}
                onApplyValues={setHydraFilter}
              >
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  title='Click to paste values from Excel or edit manually'
                >
                  {hydraFilter ? (
                    <span className='text-left'>
                      HYDRA Batch ({getValueCount(hydraFilter)} value
                      {getValueCount(hydraFilter) !== 1 ? 's' : ''})
                    </span>
                  ) : (
                    <span className='text-muted-foreground'>
                      Click to add...
                    </span>
                  )}
                </Button>
              </PasteValuesDialog>
            </div>

            <div className='flex flex-col space-y-1'>
              <Label>Pallet Batch</Label>
              <PasteValuesDialog
                fieldType='pallet_batch'
                fieldLabel='Pallet Batch'
                currentValue={palletFilter}
                currentCount={getValueCount(palletFilter)}
                onApplyValues={setPalletFilter}
              >
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  title='Click to paste values from Excel or edit manually'
                >
                  {palletFilter ? (
                    <span className='text-left'>
                      Pallet Batch ({getValueCount(palletFilter)} value
                      {getValueCount(palletFilter) !== 1 ? 's' : ''})
                    </span>
                  ) : (
                    <span className='text-muted-foreground'>
                      Click to add...
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
              title='Clear filters'
              disabled={isPendingSearch}
              className='order-3 w-full sm:order-1'
            >
              <CircleX /> <span>Clear</span>
            </Button>

            <Link
              href={`/api/dmcheck-data/excel?${new URLSearchParams(
                Object.entries({
                  status: Array.isArray(statusFilter)
                    ? statusFilter.join(',')
                    : statusFilter,
                  from: fromFilter?.toISOString(),
                  to: toFilter?.toISOString(),
                  dmc: dmcFilter,
                  hydra_batch: hydraFilter,
                  pallet_batch: palletFilter,
                  workplace: Array.isArray(workplaceFilter)
                    ? workplaceFilter.join(',')
                    : workplaceFilter,
                  article: Array.isArray(articleFilter)
                    ? articleFilter.join(',')
                    : articleFilter,
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
                <span>Export</span>
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
              <span>Search</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
