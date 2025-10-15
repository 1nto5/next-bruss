'use client';

import { ArticleConfigType } from '@/app/[lang]/dmcheck-data/lib/dmcheck-data-types';
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
import type { Dictionary } from '../lib/dict';

export default function DmcTableFilteringAndOptions({
  articles,
  fetchTime,
  dict,
}: {
  articles: ArticleConfigType[];
  fetchTime: Date;
  dict: Dictionary;
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
    { value: 'box', label: dict.statusOptions.box },
    { value: 'pallet', label: dict.statusOptions.pallet },
    { value: 'warehouse', label: dict.statusOptions.warehouse },
    { value: 'rework', label: dict.statusOptions.rework },
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
              <Label>{dict.filters.from}</Label>
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
              <Label>{dict.filters.to}</Label>
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
              <Label>{dict.filters.workplace}</Label>
              <MultiSelect
                options={workplaceOptions}
                value={workplaceFilter}
                onValueChange={setWorkplaceFilter}
                placeholder={dict.filters.select}
                searchPlaceholder={dict.filters.search}
                emptyText={dict.filters.notFound}
                className='w-full'
              />
            </div>

            <div className='flex flex-col space-y-1'>
              <Label>{dict.filters.article}</Label>
              <MultiSelect
                options={articleOptions}
                value={articleFilter}
                onValueChange={setArticleFilter}
                placeholder={dict.filters.select}
                searchPlaceholder={dict.filters.search}
                emptyText={dict.filters.notFound}
                className='w-full'
              />
            </div>

            <div className='flex flex-col space-y-1'>
              <Label>{dict.filters.status}</Label>
              <MultiSelect
                options={statusOptions}
                value={statusFilter}
                onValueChange={setStatusFilter}
                placeholder={dict.filters.select}
                searchPlaceholder={dict.filters.search}
                emptyText={dict.filters.notFound}
                className='w-full'
              />
            </div>
          </div>

          {/* Row 3: DMC, HYDRA Batch, Pallet Batch - Full width */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            <div className='flex flex-col space-y-1'>
              <Label>{dict.filters.dmc}</Label>
              <PasteValuesDialog
                fieldType='dmc'
                fieldLabel={dict.filters.dmc}
                currentValue={dmcFilter}
                currentCount={getValueCount(dmcFilter)}
                onApplyValues={setDmcFilter}
                dict={dict}
              >
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  title={dict.filters.pasteTitle}
                >
                  {dmcFilter ? (
                    <span className='text-left'>
                      {dict.filters.dmc} ({getValueCount(dmcFilter)} {getValueCount(dmcFilter) !== 1 ? dict.filters.values : dict.filters.value})
                    </span>
                  ) : (
                    <span className='text-muted-foreground'>
                      {dict.filters.clickToAdd}
                    </span>
                  )}
                </Button>
              </PasteValuesDialog>
            </div>

            <div className='flex flex-col space-y-1'>
              <Label>{dict.filters.hydraBatch}</Label>
              <PasteValuesDialog
                fieldType='hydra_batch'
                fieldLabel={dict.filters.hydraBatch}
                currentValue={hydraFilter}
                currentCount={getValueCount(hydraFilter)}
                onApplyValues={setHydraFilter}
                dict={dict}
              >
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  title={dict.filters.pasteTitle}
                >
                  {hydraFilter ? (
                    <span className='text-left'>
                      {dict.filters.hydraBatch} ({getValueCount(hydraFilter)} {getValueCount(hydraFilter) !== 1 ? dict.filters.values : dict.filters.value})
                    </span>
                  ) : (
                    <span className='text-muted-foreground'>
                      {dict.filters.clickToAdd}
                    </span>
                  )}
                </Button>
              </PasteValuesDialog>
            </div>

            <div className='flex flex-col space-y-1'>
              <Label>{dict.filters.palletBatch}</Label>
              <PasteValuesDialog
                fieldType='pallet_batch'
                fieldLabel={dict.filters.palletBatch}
                currentValue={palletFilter}
                currentCount={getValueCount(palletFilter)}
                onApplyValues={setPalletFilter}
                dict={dict}
              >
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  title={dict.filters.pasteTitle}
                >
                  {palletFilter ? (
                    <span className='text-left'>
                      {dict.filters.palletBatch} ({getValueCount(palletFilter)} {getValueCount(palletFilter) !== 1 ? dict.filters.values : dict.filters.value})
                    </span>
                  ) : (
                    <span className='text-muted-foreground'>
                      {dict.filters.clickToAdd}
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
              title={dict.filters.clearFilters}
              disabled={isPendingSearch}
              className='order-3 w-full justify-start sm:order-1'
            >
              <CircleX /> <span>{dict.filters.clear}</span>
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
              <span>{dict.filters.export}</span>
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
              <span>{isRefresh ? dict.filters.refresh : dict.filters.search_button}</span>
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
