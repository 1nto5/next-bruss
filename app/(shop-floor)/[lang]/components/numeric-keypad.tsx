'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Delete } from 'lucide-react';
import { memo } from 'react';

interface NumericKeypadProps {
  onNumberClick: (number: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  className?: string;
}

// Memoized numeric keypad to prevent re-renders when parent state changes
// Only re-renders when props actually change
export default memo<NumericKeypadProps>(function NumericKeypad({
  onNumberClick,
  onBackspace,
  onClear,
  className = '',
}) {
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <Card className={`w-full max-w-sm ${className}`}>
      <CardContent className='p-4'>
        <div className='grid grid-cols-3 gap-3'>
          {numbers.slice(0, 9).map((number) => (
            <Button
              key={number}
              variant='outline'
              size='lg'
              className='h-16 text-2xl font-bold'
              onClick={() => onNumberClick(number)}
            >
              {number}
            </Button>
          ))}
          <Button
            variant='outline'
            size='lg'
            className='h-16 text-lg'
            onClick={onClear}
          >
            Clear
          </Button>
          <Button
            variant='outline'
            size='lg'
            className='h-16 text-2xl font-bold'
            onClick={() => onNumberClick('0')}
          >
            0
          </Button>
          <Button
            variant='outline'
            size='lg'
            className='h-16'
            onClick={onBackspace}
          >
            <Delete />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});