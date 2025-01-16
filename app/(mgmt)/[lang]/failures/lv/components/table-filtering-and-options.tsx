'use client';

import {
  failuresOptions,
  stationsOptions,
} from '@/app/(mgmt)/[lang]/failures/lv/lib/options-failures-lv2';
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
import { cn } from '@/lib/utils';
import {
  Check,
  ChevronsUpDown,
  CircleX,
  RefreshCcw,
  Search,
  Sheet,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { revalidateFailures } from '../actions';
import AddFailureDialog from './add-failure-dialog';

export default function TableFilteringAndOptions({
  setFilter,
}: {
  setFilter: (columnId: string, value: string) => void;
}) {
  const [filterLineValue, setFilterLineValue] = useState('');
  const [filterStationValue, setFilterStationValue] = useState('');
  const [filterFailureValue, setFilterFailureValue] = useState('');
  const [filterSupervisorValue, setFilterSupervisorValue] = useState('');
  const [filterResponsibleValue, setFilterResponsibleValue] = useState('');

  const [openStation, setOpenStation] = useState(false);
  const [openFailure, setOpenFailure] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [from, setFrom] = useState<Date | undefined>(undefined);
  const [to, setTo] = useState<Date | undefined>(undefined);

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
    failuresOptions.find((option) => option.station === filterStationValue)
      ?.options || [];

  const handleSearchClick = () => {
    const params = {
      from: from ? from.toISOString() : '',
      to: to ? to.toISOString() : '',
    };
    router.push(`${pathname}?${createDateTimeQueryString(params)}`);
  };

  const handleClearFilters = () => {
    router.push(pathname);
    setFilter('line', '');
    setFilter('station', '');
    setFilter('failure', '');
    setFilter('supervisor', '');
    setFilter('responsible', '');
    setFilterLineValue('');
    setFilterStationValue('');
    setFilterFailureValue('');
    setFilterSupervisorValue('');
    setFilterResponsibleValue('');
    setFrom(undefined);
    setTo(undefined);
  };

  return (
    <div className='flex flex-wrap gap-2'>
      <div className='flex space-x-4'>
        <RadioGroup
          value={filterLineValue}
          onValueChange={(value) => {
            setFilterLineValue(value);
            setFilter('line', value);
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
            className={cn(
              'justify-between',
              !filterStationValue && 'opacity-50',
            )}
          >
            {filterStationValue
              ? stationsOptions.find(
                  (station) => station === filterStationValue,
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
                    setFilterStationValue('');
                    setFilter('station', '');
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
                      setFilterStationValue(currentValue);
                      setFilter('station', currentValue);
                      setOpenStation(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        filterStationValue === station
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
            disabled={!filterStationValue}
            className={cn(
              'justify-between',
              !filterFailureValue && 'opacity-50',
            )}
          >
            {filterFailureValue
              ? filteredFailures.find(
                  (failure) => failure === filterFailureValue,
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
                    setFilterFailureValue('');
                    setFilter('failure', '');
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
                      setFilterFailureValue(currentValue);
                      setFilter('failure', currentValue);
                      setOpenFailure(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        filterFailureValue === failure
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
        value={filterSupervisorValue}
        onChange={(e) => {
          setFilterSupervisorValue(e.target.value);
          setFilter('supervisor', e.target.value);
        }}
      />
      <Input
        placeholder='odpowiedzialny'
        className='w-36'
        value={filterResponsibleValue}
        onChange={(e) => {
          setFilterResponsibleValue(e.target.value);
          setFilter('responsible', e.target.value);
        }}
      />

      <div className='flex items-center space-x-2'>
        <Label>od:</Label>
        <DateTimePicker
          value={from}
          onChange={setFrom}
          renderTrigger={({ value, setOpen, open }) => (
            <DateTimeInput
              value={value}
              onChange={(x) => !open && setFrom(x)}
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
          value={to}
          onChange={setTo}
          renderTrigger={({ value, setOpen, open }) => (
            <DateTimeInput
              value={value}
              onChange={(x) => !open && setTo(x)}
              format='dd/MM/yyyy HH:mm'
              disabled={open}
              onCalendarClick={() => setOpen(!open)}
            />
          )}
        />
      </div>

      <div className='flex flex-wrap gap-2'>
        <Button
          type='submit'
          variant='outline'
          disabled={!from || !to}
          onClick={handleSearchClick}
          size='icon'
          title='szukaj'
        >
          <Search />
        </Button>
        <Button
          variant='outline'
          onClick={() => handleClearFilters()}
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
        <Link href={`/api/failures/lv/excel`}>
          <Button variant='outline' size='icon' title='export do Excel'>
            <Sheet />
          </Button>
        </Link>
        <AddFailureDialog />
      </div>
    </div>
  );
}
