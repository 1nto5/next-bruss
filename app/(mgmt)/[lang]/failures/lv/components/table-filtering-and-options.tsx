'use client';

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/cn';
import {
  Check,
  ChevronsUpDown,
  CircleX,
  Loader,
  RefreshCw,
  Search,
  Sheet,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { revalidateFailures as revalidate } from '../actions';
import { FailureOptionType } from '../lib/failures-types';
import AddFailureDialog from './add-failure-dialog';

export default function TableFilteringAndOptions({
  setIsPendingSearch,
  isPendingSearch,
  failuresOptions,
}: {
  setIsPendingSearch: (value: boolean) => void;
  isPendingSearch: boolean;
  failuresOptions: FailureOptionType[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const [fromFilter, setFromFilter] = useState(() => {
    const fromParam = searchParams?.get('from');
    return fromParam ? new Date(fromParam) : undefined;
  });
  const [toFilter, setToFilter] = useState(() => {
    const toParam = searchParams?.get('to');
    return toParam ? new Date(toParam) : undefined;
  });
  const [lineFilter, setLineFilter] = useState(searchParams?.get('line') || '');
  const [stationFilter, setStationFilter] = useState(
    searchParams?.get('station') || '',
  );
  const [failureFilter, setFailureFilter] = useState(
    searchParams?.get('failure') || '',
  );
  const [supervisorFilter, setSupervisorFilter] = useState(
    searchParams?.get('supervisor') || '',
  );
  const [responsibleFilter, setResponsibleFilter] = useState(
    searchParams?.get('responsible') || '',
  );

  // const areFiltersSet =
  //   fromFilter ||
  //   toFilter ||
  //   lineFilter ||
  //   stationFilter ||
  //   failureFilter ||
  //   supervisorFilter ||
  //   responsibleFilter;

  const [openStation, setOpenStation] = useState(false);
  const [openFailure, setOpenFailure] = useState(false);

  const handleClearFilters = () => {
    setFromFilter(undefined);
    setToFilter(undefined);
    setLineFilter('');
    setStationFilter('');
    setFailureFilter('');
    setSupervisorFilter('');
    setResponsibleFilter('');
    if (searchParams?.toString()) {
      setIsPendingSearch(true);
      router.push(pathname || '');
    }
  };

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (showFilters) {
      const params = new URLSearchParams();
      if (fromFilter) params.set('from', fromFilter.toISOString());
      if (toFilter) params.set('to', toFilter.toISOString());
      if (lineFilter) params.set('line', lineFilter);
      if (stationFilter) params.set('station', stationFilter);
      if (failureFilter) params.set('failure', failureFilter);
      if (supervisorFilter) params.set('supervisor', supervisorFilter);
      if (responsibleFilter) params.set('responsible', responsibleFilter);
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

  const stationsOptions = failuresOptions
    .filter((option) => option.line === lineFilter)
    .map((option) => option.station);

  const filteredFailures =
    failuresOptions.find((option) => option.station === stationFilter)
      ?.options || [];

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
              <Label>od:</Label>
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
              <Label>do:</Label>
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
            <RadioGroup
              value={lineFilter}
              onValueChange={(value) => {
                setLineFilter(value);
              }}
              className='flex flex-row'
            >
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='lv1' id='lv1' />
                <Label htmlFor='lv1'>LV1</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='lv2' id='lv2' />
                <Label htmlFor='lv2'>LV2</Label>
              </div>
            </RadioGroup>
            <Popover open={openStation} onOpenChange={setOpenStation}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  role='combobox'
                  disabled={!lineFilter}
                  className={cn(
                    'justify-between',
                    !stationFilter && 'opacity-50',
                  )}
                >
                  {stationFilter
                    ? stationsOptions.find(
                        (station) => station === stationFilter,
                      )
                    : 'stacja'}
                  <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className='w-[300px] p-0'
                side='bottom'
                align='start'
              >
                <Command>
                  <CommandInput placeholder='szukaj...' />
                  <CommandList>
                    <CommandEmpty>not found</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        key='reset'
                        onSelect={() => {
                          setStationFilter('');
                          setOpenStation(false);
                        }}
                      >
                        <Check className='mr-2 h-4 w-4 opacity-0' />
                        not set
                      </CommandItem>
                      {stationsOptions.map((station) => (
                        <CommandItem
                          key={station}
                          value={station}
                          onSelect={(currentValue) => {
                            setStationFilter(currentValue);
                            setOpenStation(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              stationFilter === station
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                          {station}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Popover open={openFailure} onOpenChange={setOpenFailure}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  disabled={!stationFilter}
                  role='combobox'
                  className={cn(
                    'justify-between',
                    !failureFilter && 'opacity-50',
                  )}
                >
                  {failureFilter
                    ? filteredFailures.find(
                        (failure) => failure === failureFilter,
                      )
                    : 'awaria'}
                  <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className='w-[300px] p-0'
                side='bottom'
                align='start'
              >
                <Command>
                  <CommandInput placeholder='szukaj...' />
                  <CommandList>
                    <CommandEmpty>not found</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        key='reset'
                        onSelect={() => {
                          setFailureFilter('');
                          setOpenFailure(false);
                        }}
                      >
                        <Check className='mr-2 h-4 w-4 opacity-0' />
                        not set
                      </CommandItem>
                      {filteredFailures.map((failure) => (
                        <CommandItem
                          key={failure}
                          value={failure}
                          onSelect={(currentValue) => {
                            setFailureFilter(currentValue);
                            setOpenFailure(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              failureFilter === failure
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                          {failure}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Input
              placeholder='nadzorujący'
              className='w-auto'
              value={supervisorFilter}
              onChange={(e) => {
                setSupervisorFilter(e.target.value);
              }}
            />
            <Input
              placeholder='odpowiedzialny'
              className='w-auto'
              value={responsibleFilter}
              onChange={(e) => {
                setResponsibleFilter(e.target.value);
              }}
            />
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
              // disabled={!areFiltersSet}
            >
              <CircleX /> <span>Wyczyść</span>
            </Button>

            <Link
              href={`/api/failures/lv/excel?${new URLSearchParams(
                Object.entries({
                  line: lineFilter,
                  station: stationFilter,
                  failure: failureFilter,
                  supervisor: supervisorFilter,
                  responsible: responsibleFilter,
                  from: fromFilter?.toISOString(),
                  to: toFilter?.toISOString(),
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
        <AddFailureDialog failuresOptions={failuresOptions} line={lineFilter} />
      </div>
    </form>
  );
}
