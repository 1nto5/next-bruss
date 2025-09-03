'use client';

import { ArticleConfigType } from '@/app/(mgmt)/[lang]/dmcheck-data/lib/dmcheck-data-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { DateTimeInput } from '@/components/ui/datetime-input';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { CircleX, FileSpreadsheet, Loader, Search } from 'lucide-react';
import { CommandShortcut } from '@/components/ui/command';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { usePlatform } from '@/lib/hooks/use-platform';
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
  const { isMac, isClient } = usePlatform();

  const [isPendingSearch, setIsPendingSearch] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setIsPendingSearch(false);
  }, [fetchTime]);

  const [statusFilter, setStatusFilter] = useState<string[]>(() => {
    const statusParam = searchParams?.get('status');
    return statusParam
      ? statusParam
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : [];
  });
  const [fromFilter, setFromFilter] = useState<Date | null>(() => {
    const fromParam = searchParams?.get('from');
    return fromParam ? new Date(fromParam) : null;
  });
  const [toFilter, setToFilter] = useState<Date | null>(() => {
    const toParam = searchParams?.get('to');
    return toParam ? new Date(toParam) : null;
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

  // Check if filters have been modified from their initial state
  const hasFilters = statusFilter.length > 0 || fromFilter || toFilter || dmcFilter || hydraFilter || palletFilter || workplaceFilter.length > 0 || articleFilter.length > 0;
  
  // Check if current filters match the URL params (use useMemo to prevent hydration issues)
  const isRefresh = useMemo(() => {
    if (!isClient) return true; // Default to refresh on server
    
    const currentParams = new URLSearchParams();
    if (statusFilter.length > 0) currentParams.set('status', statusFilter.join(','));
    if (fromFilter) currentParams.set('from', fromFilter.toISOString());
    if (toFilter) currentParams.set('to', toFilter.toISOString());
    if (dmcFilter) currentParams.set('dmc', dmcFilter);
    if (hydraFilter) currentParams.set('hydra_batch', hydraFilter);
    if (palletFilter) currentParams.set('pallet_batch', palletFilter);
    if (workplaceFilter.length > 0)
      currentParams.set('workplace', workplaceFilter.join(','));
    if (articleFilter.length > 0)
      currentParams.set('article', articleFilter.join(','));
    
    const filtersMatchUrl = currentParams.toString() === (searchParams?.toString() || '');
    return !hasFilters || filtersMatchUrl;
  }, [isClient, statusFilter, fromFilter, toFilter, dmcFilter, hydraFilter, palletFilter, workplaceFilter, articleFilter, searchParams, hasFilters]);

  const handleSearchClick = useCallback((e: React.FormEvent) => {
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
  }, [
    statusFilter,
    fromFilter,
    toFilter,
    dmcFilter,
    hydraFilter,
    palletFilter,
    workplaceFilter,
    articleFilter,
    pathname,
    searchParams,
    router,
    setIsPendingSearch
  ]);

  useEffect(() => {
    if (!isClient) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Command+Enter on macOS, Ctrl+Enter on Windows/Linux
      if (event.key === 'Enter' && 
          ((isMac && event.metaKey) ||
           (!isMac && event.ctrlKey))) {
        event.preventDefault();
        handleSearchClick(event as any);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isClient, isMac, handleSearchClick]);

  const handleClearFilters = () => {
    setStatusFilter([]);
    setFromFilter(null);
    setToFilter(null);
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

  const handleExportClick = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams(
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
      );

      const response = await fetch(`/api/dmcheck-data/excel?${params.toString()}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DMCheck-data.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
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
                value={fromFilter || undefined}
                onChange={(date) => setFromFilter(date || null)}
                max={toFilter || undefined}
                renderTrigger={({ value, setOpen, open }) => (
                  <DateTimeInput
                    value={value}
                    onChange={(x) => !open && setFromFilter(x || null)}
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
                value={toFilter || undefined}
                onChange={(date) => setToFilter(date || null)}
                max={new Date()}
                min={fromFilter || undefined}
                renderTrigger={({ value, setOpen, open }) => (
                  <DateTimeInput
                    value={value}
                    onChange={(x) => !open && setToFilter(x || null)}
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
              className='order-3 w-full justify-start sm:order-1'
            >
              <CircleX /> <span>Clear</span>
            </Button>

            <Button
              onClick={handleExportClick}
              disabled={isExporting || isPendingSearch}
              className='order-2 w-full justify-start sm:order-2'
            >
              {isExporting ? (
                <Loader className='animate-spin' />
              ) : (
                <FileSpreadsheet />
              )}
              <span>Export</span>
            </Button>

            <Button
              type='submit'
              variant='secondary'
              disabled={isPendingSearch}
              className='order-1 w-full justify-start sm:order-3 sm:col-span-2'
            >
              {isPendingSearch ? (
                <Loader className='animate-spin' />
              ) : (
                <Search />
              )}
              <span>{isRefresh ? 'Refresh' : 'Search'}</span>
              <CommandShortcut>
                {isClient ? (isMac ? '⌘↵' : 'Ctrl+↵') : ''}
              </CommandShortcut>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
