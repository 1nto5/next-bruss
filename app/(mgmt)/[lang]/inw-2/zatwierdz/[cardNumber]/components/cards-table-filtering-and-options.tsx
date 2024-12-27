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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  sectorsSelectOptions,
  warehouseSelectOptions,
} from '@/lib/options/inventory';
import { cn } from '@/lib/utils';
import { set } from 'date-fns';
import {
  Check,
  ChevronsUpDown,
  CircleX,
  RefreshCcw,
  Sheet,
  TableIcon,
  Undo2,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { revalidateCardPositions as revalidate } from '../actions';

export default function CardsTableFilteringAndOptions({
  setFilter,
}: {
  setFilter: (columnId: string, value: string) => void;
}) {
  const [filterPositionValue, setFilterPositionValue] = useState('');
  const [filterArticleNameValue, setFilterArticleNameValue] = useState('');
  const [filterArticleNumberValue, setFilterArticleNumberValue] = useState('');

  const handleClearFilters = () => {
    setFilter('position', '');
    setFilterPositionValue('');
    setFilter('articleName', '');
    setFilterArticleNameValue('');
    setFilter('articleNumber', '');
    setFilterArticleNumberValue('');
  };

  return (
    <div className='flex flex-wrap gap-2'>
      <Link href='/inw-2/zatwierdz'>
        <Button size='icon' variant='outline' title='wróć do kart'>
          <Undo2 />
        </Button>
      </Link>

      <Input
        type='number'
        placeholder='nr poz.'
        className='w-24'
        value={filterPositionValue}
        onChange={(e) => {
          setFilterPositionValue(e.target.value);
          setFilter('position', e.target.value);
        }}
      />
      <Input
        placeholder='art.'
        className='w-24'
        value={filterArticleNameValue}
        onChange={(e) => {
          setFilterArticleNameValue(e.target.value);
          setFilter('articleName', e.target.value);
        }}
      />
      <Input
        placeholder='nr art.'
        className='w-24'
        value={filterArticleNumberValue}
        onChange={(e) => {
          setFilterArticleNumberValue(e.target.value);
          setFilter('articleNumber', e.target.value);
        }}
      />

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
    </div>
  );
}
