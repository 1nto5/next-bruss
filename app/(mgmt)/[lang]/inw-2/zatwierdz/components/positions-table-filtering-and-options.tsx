'use client';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import { CircleX, RefreshCcw, Undo2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { revalidatePositions as revalidate } from '../actions';

export default function PositionsTableFilteringAndOptions({
  setFilter,
}: {
  setFilter: (columnId: string, value: string) => void;
}) {
  const [filterPositionValue, setFilterPositionValue] = useState('');
  const [filterArticleNameValue, setFilterArticleNameValue] = useState('');
  const [filterArticleNumberValue, setFilterArticleNumberValue] = useState('');
  const [filterQuantityValue, setFilterQuantityValue] = useState('');

  const handleClearFilters = () => {
    setFilter('identifier', '');
    setFilterPositionValue('');
    setFilter('articleName', '');
    setFilterArticleNameValue('');
    setFilter('articleNumber', '');
    setFilterArticleNumberValue('');
  };

  return (
    <div className='flex flex-wrap gap-2'>
      <Input
        placeholder='id pozycji'
        className='w-24'
        value={filterPositionValue}
        onChange={(e) => {
          setFilterPositionValue(e.target.value);
          setFilter('identifier', e.target.value);
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
      <Input
        placeholder='ilość'
        className='w-24'
        value={filterQuantityValue}
        onChange={(e) => {
          setFilterQuantityValue(e.target.value);
          setFilter('quantity', e.target.value);
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
