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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { failuresOptions, stationsOptions } from '@/lib/options/failures-lv2';
import { cn } from '@/lib/utils';
import {
  Check,
  ChevronsUpDown,
  CircleX,
  RefreshCcw,
  Search,
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { revalidateFailures } from '../actions';
import AddFailureDialog from './add-failure-dialog';

export default function TableFilteringAndOptions() {
  const [openStation, setOpenStation] = useState(false);
  const [openFailure, setOpenFailure] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [fromDate, setFromDate] = useState('');
  const [fromTime, setFromTime] = useState('06:00');
  const [toDate, setToDate] = useState('');
  const [toTime, setToTime] = useState('22:00');

  useEffect(() => {
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    if (fromParam) {
      const [date, time] = fromParam.split('T');
      setFromDate(date || '');
      setFromTime(time || '06:00');
    }

    if (toParam) {
      const [date, time] = toParam.split('T');
      setToDate(date || '');
      setToTime(time || '22:00');
    }
  }, [searchParams]);

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  const createDateTimeQueryString = useCallback(
    (params: Record<string, string>) => {
      const search = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          search.set(key, value);
        } else {
          search.delete(key);
        }
      });
      return search.toString();
    },
    [searchParams],
  );

  const filteredFailures =
    failuresOptions.find(
      (option) => option.station === searchParams.get('station'),
    )?.options || [];

  const handleSearchClick = () => {
    const params = {
      from: `${fromDate}T${fromTime}` || '',
      to: `${toDate}T${toTime}` || '',
    };
    router.push(`${pathname}?${createDateTimeQueryString(params)}`);
  };

  const handleClearFilters = () => {
    setFromDate('');
    setFromTime('06:00');
    setToDate('');
    setToTime('22:00');
    router.push(pathname);
  };

  return (
    <div className='flex flex-wrap gap-2'>
      <div className='flex space-x-4'>
        <RadioGroup
          value={searchParams.get('line') || ''}
          onValueChange={(value) => {
            router.push(pathname + '?' + createQueryString('line', value));
          }}
          className='flex flex-row '
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
      </div>

      <Popover open={openStation} onOpenChange={setOpenStation}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            // aria-expanded={open}
            className={cn(
              'justify-between',
              !searchParams.get('station') && 'opacity-50',
            )}
          >
            {searchParams.get('station')
              ? stationsOptions.find(
                  (station) => station === searchParams.get('station'),
                )
              : 'stacja'}
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[300px] p-0'>
          <Command>
            <CommandInput placeholder='wyszukaj...' />
            <CommandList>
              <CommandEmpty>Nie znaleziono.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  key='reset'
                  onSelect={() => {
                    // setWarehouseValue('');
                    router.push(pathname);
                    setOpenStation(false);
                  }}
                >
                  <Check className='mr-2 h-4 w-4 opacity-0' />
                  nie wybrano
                </CommandItem>
                {stationsOptions.map((station) => (
                  <CommandItem
                    key={station}
                    value={station}
                    onSelect={(currentValue) => {
                      // setWarehouseValue(
                      //   currentValue === warehouseValue
                      //     ? ''
                      //     : currentValue,
                      // );
                      router.push(
                        pathname +
                          '?' +
                          createQueryString(
                            'station',
                            currentValue === searchParams.get('station')
                              ? ''
                              : currentValue,
                          ),
                      );
                      setOpenStation(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        searchParams.get('station') === station
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
            role='combobox'
            disabled={!searchParams.get('station')}
            // aria-expanded={open}
            className={cn(
              'justify-between',
              !searchParams.get('failure') && 'opacity-50',
            )}
          >
            {searchParams.get('failure')
              ? filteredFailures.find(
                  (failure) => failure === searchParams.get('failure'),
                )
              : 'awaria'}
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[300px] p-0'>
          <Command>
            <CommandInput placeholder='wyszukaj...' />
            <CommandList>
              <CommandEmpty>Nie znaleziono.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  key='reset'
                  onSelect={() => {
                    // setWarehouseValue('');
                    router.push(pathname);
                    setOpenFailure(false);
                  }}
                >
                  <Check className='mr-2 h-4 w-4 opacity-0' />
                  nie wybrano
                </CommandItem>
                {filteredFailures.map((failure) => (
                  <CommandItem
                    key={failure}
                    value={failure}
                    onSelect={(currentValue) => {
                      // setWarehouseValue(
                      //   currentValue === warehouseValue
                      //     ? ''
                      //     : currentValue,
                      // );
                      router.push(
                        pathname +
                          '?' +
                          createQueryString(
                            'failure',
                            currentValue === searchParams.get('failure')
                              ? ''
                              : currentValue,
                          ),
                      );
                      setOpenFailure(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        searchParams.get('failure') === failure
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
        value={searchParams.get('supervisor') ?? ''}
        onChange={(e) => {
          router.push(
            pathname + '?' + createQueryString('supervisor', e.target.value),
          );
        }}
      />
      <Input
        placeholder='odpowiedzialny'
        className='w-36'
        value={searchParams.get('responsible') ?? ''}
        onChange={(e) => {
          router.push(
            pathname + '?' + createQueryString('responsible', e.target.value),
          );
        }}
      />

      <div className='flex flex-wrap gap-2'>
        <div className='flex items-center gap-1.5'>
          <Label htmlFor='from'>Od:</Label>
          <Input
            id='fromDate'
            type='date'
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className='w-36'
          />
          <Input
            id='fromTime'
            type='time'
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
            disabled={!fromDate}
          />
        </div>
        <div className='flex items-center gap-1.5'>
          <Label htmlFor='to'>Do:</Label>
          <Input
            id='toDate'
            type='date'
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className='w-36'
          />
          <Input
            id='toTime'
            type='time'
            value={toTime}
            onChange={(e) => setToTime(e.target.value)}
            disabled={!toDate}
          />
        </div>
        <Button
          type='submit'
          variant='outline'
          disabled={!fromDate || !toDate}
          onClick={handleSearchClick}
          size='icon'
          title='szukaj'
        >
          <Search />
        </Button>
        <Button
          variant='outline'
          onClick={handleClearFilters}
          size='icon'
          title='wyczyść filtry'
        >
          <CircleX />
        </Button>

        <Button
          variant='outline'
          onClick={() => revalidateFailures()}
          size='icon'
          title='odśwież'
        >
          <RefreshCcw />
        </Button>
        <AddFailureDialog />
      </div>
    </div>
  );
}
