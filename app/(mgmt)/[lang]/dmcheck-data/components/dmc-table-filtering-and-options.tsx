'use client';

import { ArticleConfigType } from '@/app/(mgmt)/[lang]/dmcheck-data/lib/dmcheck-data-types';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';
import {
  Check,
  ChevronsUpDown,
  CircleX,
  Loader,
  Search,
  Sheet,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function DmcTableFilteringAndOptions({
  articles,
  setIsPendingSearch,
  isPendingSearch,
}: {
  articles: ArticleConfigType[];
  setIsPendingSearch: (value: boolean) => void;
  isPendingSearch: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [statusFilter, setStatusFilter] = useState(searchParams.get('status'));
  const [fromFilter, setFromFilter] = useState(() => {
    const fromParam = searchParams.get('from');
    return fromParam ? new Date(fromParam) : undefined;
  });
  const [toFilter, setToFilter] = useState(() => {
    const toParam = searchParams.get('to');
    return toParam ? new Date(toParam) : undefined;
  });
  const [dmcFilter, setDmcFilter] = useState(searchParams.get('dmc') || '');
  const [hydraFilter, setHydraFilter] = useState(
    searchParams.get('hydra_batch') || '',
  );
  const [palletFilter, setPalletFilter] = useState(
    searchParams.get('pallet_batch') || '',
  );
  const [workplaceFilter, setWorkplaceFilter] = useState(
    searchParams.get('workplace') || '',
  );
  const [articleFilter, setArticleFilter] = useState(
    searchParams.get('article') || '',
  );

  const areFiltersSet =
    statusFilter ||
    fromFilter ||
    toFilter ||
    dmcFilter ||
    hydraFilter ||
    palletFilter ||
    workplaceFilter ||
    articleFilter;

  const [openStatus, setOpenStatus] = useState(false);
  const [openWorkplace, setOpenWorkplace] = useState(false);
  const [openArticle, setOpenArticle] = useState(false);

  const handleClearFilters = () => {
    setStatusFilter('');
    setFromFilter(undefined);
    setToFilter(undefined);
    setDmcFilter('');
    setHydraFilter('');
    setPalletFilter('');
    setWorkplaceFilter('');
    setArticleFilter('');

    if (searchParams.toString()) {
      setIsPendingSearch(true);
      router.push(pathname);
    }
  };

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (fromFilter) params.set('from', fromFilter.toISOString());
    if (toFilter) params.set('to', toFilter.toISOString());
    if (dmcFilter) params.set('dmc', dmcFilter);
    if (hydraFilter) params.set('hydra_batch', hydraFilter);
    if (palletFilter) params.set('pallet_batch', palletFilter);
    if (workplaceFilter) params.set('workplace', workplaceFilter);
    if (articleFilter) params.set('article', articleFilter);
    const newUrl = `${pathname}?${params.toString()}`;
    if (newUrl !== `${pathname}?${searchParams.toString()}`) {
      setIsPendingSearch(true);
      router.push(newUrl);
    }
  };

  const statusOptions = [
    { value: 'box', label: 'box - scanned' },
    { value: 'pallet', label: 'pallet - confirmed with hydra label' },
    { value: 'warehouse', label: 'warehouse - confirmed with pallet label' },
  ];

  const workplaceOptions = Array.from(
    new Set(articles.map((article) => article.workplace)),
  ).map((workplace) => ({
    value: workplace,
    label: workplace.toUpperCase(),
  }));

  const articleOptions = articles
    .filter(
      (article) => !workplaceFilter || article.workplace === workplaceFilter,
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
    <form onSubmit={handleSearchClick} className='flex flex-col gap-4'>
      <div className='flex flex-wrap gap-4'>
        <div className='flex items-center space-x-2'>
          <Label>from:</Label>
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
        <div className='flex items-center space-x-2'>
          <Label>to:</Label>
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
      </div>

      <div className='flex flex-wrap gap-2'>
        <Popover open={openStatus} onOpenChange={setOpenStatus}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              role='combobox'
              className={cn('justify-between', !statusFilter && 'opacity-50')}
            >
              {statusFilter
                ? statusOptions.find((status) => status.value === statusFilter)
                    ?.value
                : 'status'}
              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-[300px] p-0' side='bottom' align='start'>
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
                      setArticleFilter('');
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
                        setArticleFilter('');
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

        <Input
          type='string'
          placeholder='dmc'
          className='w-auto'
          value={dmcFilter}
          onChange={(e) => setDmcFilter(e.target.value)}
        />
        <Input
          type='string'
          placeholder='HYDRA batch'
          className='w-auto'
          value={hydraFilter}
          onChange={(e) => setHydraFilter(e.target.value)}
        />
        <Input
          type='string'
          placeholder='pallet batch'
          className='w-auto'
          value={palletFilter}
          onChange={(e) => setPalletFilter(e.target.value)}
        />

        <Popover open={openWorkplace} onOpenChange={setOpenWorkplace}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              role='combobox'
              className={cn(
                'justify-between',
                !workplaceFilter && 'opacity-50',
              )}
            >
              {workplaceFilter
                ? workplaceOptions.find(
                    (workplace) => workplace.value === workplaceFilter,
                  )?.label
                : 'workplace'}
              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-[300px] p-0' side='bottom' align='start'>
            <Command>
              <CommandInput placeholder='search...' />
              <CommandList>
                <CommandEmpty>not found</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    key='reset'
                    onSelect={() => {
                      setWorkplaceFilter('');
                      setOpenWorkplace(false);
                      setArticleFilter('');
                    }}
                  >
                    <Check className='mr-2 h-4 w-4 opacity-0' />
                    not set
                  </CommandItem>
                  {workplaceOptions.map((workplace) => (
                    <CommandItem
                      key={workplace.value}
                      value={workplace.value}
                      onSelect={(currentValue) => {
                        setWorkplaceFilter(currentValue);
                        setOpenWorkplace(false);
                        setArticleFilter('');
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          workplaceFilter === workplace.value
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                      {workplace.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover open={openArticle} onOpenChange={setOpenArticle}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              role='combobox'
              className={cn('justify-between', !articleFilter && 'opacity-50')}
            >
              {articleFilter
                ? articleOptions.find(
                    (article) => article.value === articleFilter,
                  )?.label
                : 'article'}
              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-[300px] p-0' side='bottom' align='start'>
            <Command>
              <CommandInput placeholder='search...' />
              <CommandList>
                <CommandEmpty>not found</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    key='reset'
                    onSelect={() => {
                      setArticleFilter('');
                      setOpenArticle(false);
                    }}
                  >
                    <Check className='mr-2 h-4 w-4 opacity-0' />
                    not set
                  </CommandItem>
                  {articleOptions.map((article) => (
                    <CommandItem
                      key={article.value}
                      value={article.value}
                      onSelect={(currentValue) => {
                        setArticleFilter(currentValue);
                        setOpenArticle(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          articleFilter === article.value
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                      {article.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className='flex flex-wrap gap-2'>
        <Button
          type='submit'
          variant='secondary'
          className='justify-start'
          disabled={isPendingSearch || !areFiltersSet}
        >
          {isPendingSearch ? (
            <>
              <Loader className={'animate-spin'} /> <span>Search</span>
            </>
          ) : (
            <>
              <Search /> <span>Search</span>
            </>
          )}
        </Button>

        <Button
          variant='destructive'
          onClick={handleClearFilters}
          title='Clear filters'
          // disabled={!areFiltersSet}
        >
          <CircleX /> <span>Clear</span>
        </Button>

        <Link
          href={`/api/dmcheck-data/excel?${new URLSearchParams(
            Object.entries({
              status: statusFilter,
              from: fromFilter?.toISOString(),
              to: toFilter?.toISOString(),
              dmc: dmcFilter,
              hydra_batch: hydraFilter,
              pallet_batch: palletFilter,
              workplace: workplaceFilter,
              article: articleFilter,
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
            <Sheet /> <span>Export to Excel</span>
          </Button>
        </Link>
      </div>
    </form>
  );
}
