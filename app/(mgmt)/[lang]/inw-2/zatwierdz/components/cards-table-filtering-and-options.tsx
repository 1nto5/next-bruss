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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import {
  sectorsSelectOptions,
  warehouseSelectOptions,
} from '@/lib/options/inventory';
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
import { setTokenSourceMapRange } from 'typescript';
import { revalidateCards as revalidate } from '../actions';

export default function CardsTableFilteringAndOptions({
  setFilter,
}: {
  setFilter: (columnId: string, value: string) => void;
}) {
  const [filterCardNumberValue, setFilterCardNumberValue] = useState('');
  const [filterCreatorsValue, setFilterCreatorsValue] = useState('');
  const [filterWarehouseValue, setFilterWarehouseValue] = useState('');
  const [filterSectorValue, setFilterSectorValue] = useState('');

  const [openWarehouse, setOpenWarehouse] = useState(false);
  const [openSector, setOpenSector] = useState(false);

  const handleClearFilters = () => {
    setFilter('number', '');
    setFilter('creators', '');
    setFilter('warehouse', '');
    setFilter('sector', '');
  };

  return (
    <div className='flex flex-wrap gap-2'>
      <Input
        type='number'
        placeholder='nr karty'
        className='w-24'
        value={filterCardNumberValue}
        onChange={(e) => {
          setFilterCardNumberValue(e.target.value);
          setFilter('number', e.target.value);
        }}
      />
      <Input
        placeholder='spisujący'
        className='w-24'
        value={filterCreatorsValue}
        onChange={(e) => {
          setFilterCreatorsValue(e.target.value);
          setFilter('creators', e.target.value);
        }}
      />

      <Popover open={openWarehouse} onOpenChange={setOpenWarehouse}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            // aria-expanded={open}
            className={cn(
              'justify-between',
              !filterWarehouseValue && 'opacity-50',
            )}
          >
            {filterWarehouseValue
              ? warehouseSelectOptions.find(
                  (warehouse) => warehouse.value === filterWarehouseValue,
                )?.label
              : 'magazyn'}
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[300px] p-0'>
          <Command>
            <CommandInput placeholder='wyszukaj...' />
            <CommandList>
              <CommandEmpty>nie znaleziono</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  key='reset'
                  onSelect={() => {
                    setFilterWarehouseValue('');
                    setFilter('warehouse', '');
                    setOpenWarehouse(false);
                  }}
                >
                  <Check className='mr-2 h-4 w-4 opacity-0' />
                  nie wybrano
                </CommandItem>
                {warehouseSelectOptions.map((warehouse) => (
                  <CommandItem
                    key={warehouse.value}
                    value={warehouse.value}
                    onSelect={(currentValue) => {
                      setFilterWarehouseValue(currentValue);
                      setFilter('warehouse', currentValue);
                      setOpenWarehouse(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        filterWarehouseValue === warehouse.value
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                    {warehouse.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Popover open={openSector} onOpenChange={setOpenSector}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            className={cn(
              'justify-between',
              !filterSectorValue && 'opacity-50',
            )}
          >
            {filterSectorValue
              ? sectorsSelectOptions.find(
                  (sector) => sector.value === filterSectorValue,
                )?.label
              : 'sektor'}
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[300px] p-0'>
          <Command>
            <CommandInput placeholder='wyszukaj...' />
            <CommandList>
              <CommandEmpty>nie znaleziono</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  key='reset'
                  onSelect={() => {
                    setFilterSectorValue('');
                    setFilter('sector', '');
                    setOpenSector(false);
                  }}
                >
                  <Check className='mr-2 h-4 w-4 opacity-0' />
                  nie wybrano
                </CommandItem>
                {sectorsSelectOptions.map((sector) => (
                  <CommandItem
                    key={sector.value}
                    value={sector.value}
                    onSelect={() => {
                      setFilterSectorValue(sector.value);
                      setFilter('sector', sector.value);
                      setOpenSector(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        filterSectorValue === sector.value
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                    {sector.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

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
        onClick={() => revalidate()}
        size='icon'
        title='odśwież'
      >
        <RefreshCcw />
      </Button>
      {/* PLAN: export to stock program compatible file */}
      {/* <Link href={`/api/failures/lv/excel`}>
        <Button variant='outline' size='icon' title='export do Excel'>
          <Sheet />
        </Button>
      </Link> */}
    </div>
  );
}
