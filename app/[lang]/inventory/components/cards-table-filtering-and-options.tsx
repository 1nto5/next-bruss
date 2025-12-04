'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { CircleX, Loader, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

import { revalidateCards as revalidate } from '../actions';
import { Dictionary } from '../lib/dict';
import { SelectOption } from '@/lib/data/get-inventory-filter-options';

export default function CardsTableFilteringAndOptions({
  setFilter,
  dict,
  fetchTime,
  warehouseOptions,
  sectorOptions,
}: {
  setFilter: (columnId: string, value: string) => void;
  dict: Dictionary;
  fetchTime: string;
  warehouseOptions: SelectOption[];
  sectorOptions: SelectOption[];
}) {
  const [filterCardNumberValue, setFilterCardNumberValue] = useState('');
  const [filterCreatorsValue, setFilterCreatorsValue] = useState('');
  const [filterWarehouseValue, setFilterWarehouseValue] = useState<string[]>([]);
  const [filterSectorValue, setFilterSectorValue] = useState<string[]>([]);
  const [isPendingSearch, setIsPendingSearch] = useState(false);

  useEffect(() => {
    setIsPendingSearch(false);
  }, [fetchTime]);

  const handleClearFilters = () => {
    setFilterCardNumberValue('');
    setFilterCreatorsValue('');
    setFilterWarehouseValue([]);
    setFilterSectorValue([]);
    setFilter('number', '');
    setFilter('creators', '');
    setFilter('warehouse', '');
    setFilter('sector', '');
  };

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPendingSearch(true);
    setFilter('number', filterCardNumberValue);
    setFilter('creators', filterCreatorsValue);
    setFilter('warehouse', filterWarehouseValue.join(','));
    setFilter('sector', filterSectorValue.join(','));
    revalidate();
  };

  const hasActiveFilters = Boolean(
    filterCardNumberValue ||
      filterCreatorsValue ||
      filterWarehouseValue.length > 0 ||
      filterSectorValue.length > 0,
  );

  const canSearch = hasActiveFilters;

  return (
    <Card>
      <CardContent className='p-4'>
        <form onSubmit={handleSearchClick} className='flex flex-col gap-4'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <div className='flex flex-col space-y-1'>
              <Label>{dict.filters.cardNumber}</Label>
              <Input
                type='number'
                value={filterCardNumberValue}
                onChange={(e) => setFilterCardNumberValue(e.target.value)}
              />
            </div>
            <div className='flex flex-col space-y-1'>
              <Label>{dict.filters.creators}</Label>
              <Input
                value={filterCreatorsValue}
                onChange={(e) => setFilterCreatorsValue(e.target.value)}
              />
            </div>
            <div className='flex flex-col space-y-1'>
              <Label>{dict.filters.warehouse}</Label>
              <MultiSelect
                value={filterWarehouseValue}
                onValueChange={setFilterWarehouseValue}
                placeholder={dict.filters.notSelected}
                searchPlaceholder={dict.filters.searchPlaceholder}
                emptyText={dict.filters.notFound}
                clearLabel={dict.filters.clear}
                selectedLabel={dict.filters.selected}
                className='w-full'
                options={warehouseOptions}
              />
            </div>
            <div className='flex flex-col space-y-1'>
              <Label>{dict.filters.sector}</Label>
              <MultiSelect
                value={filterSectorValue}
                onValueChange={setFilterSectorValue}
                placeholder={dict.filters.notSelected}
                searchPlaceholder={dict.filters.searchPlaceholder}
                emptyText={dict.filters.notFound}
                clearLabel={dict.filters.clear}
                selectedLabel={dict.filters.selected}
                className='w-full'
                options={sectorOptions}
              />
            </div>
          </div>

          <div className='flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:gap-4'>
            <Button
              type='button'
              variant='destructive'
              onClick={handleClearFilters}
              disabled={isPendingSearch || !hasActiveFilters}
              className='order-2 w-full sm:order-1'
            >
              <CircleX /> {dict.filters.clearFilters}
            </Button>
            <Button
              type='submit'
              variant='secondary'
              disabled={isPendingSearch || !canSearch}
              className='order-1 w-full sm:order-2'
            >
              {isPendingSearch ? (
                <Loader className='animate-spin' />
              ) : (
                <Search />
              )}
              {dict.filters.search}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
